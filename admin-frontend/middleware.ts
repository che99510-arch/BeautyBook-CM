import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;

  // Root → redirect based on auth state
  if (pathname === '/') {
    const dest = token ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Login page — redirect away if already logged in
  if (pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes — require token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Only run on actual page routes, not on assets or API
export const config = {
  matcher: [
    '/',
    '/login',
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
