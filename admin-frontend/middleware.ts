import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;

  // Root → redirect based on auth
  if (pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/dashboard' : '/login', request.url));
  }

  // Public auth pages — no token needed
  if (pathname === '/login' || pathname === '/setup' || pathname === '/signup') {
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // All dashboard routes require a token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/setup',
    '/signup',
    '/dashboard/:path*',
    '/salons/:path*',
    '/customers/:path*',
    '/bookings/:path*',
    '/payments/:path*',
    '/disputes/:path*',
    '/advertisements/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/testimonials/:path*',
  ],
};
