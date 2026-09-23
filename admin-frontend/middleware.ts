import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // Allow login page without token
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Root → always redirect to login (page.tsx handles the rest client-side)
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect all dashboard routes
  const protectedPaths = [
    '/dashboard', '/salons', '/customers', '/bookings', '/payments',
    '/disputes', '/advertisements', '/reports', '/settings',
    '/testimonials', '/notifications',
  ];
  if (protectedPaths.some(p => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|splash).*)',
  ],
};
