import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // Allow login page without token
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (token) {
      // Redirect to dashboard if already logged in
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/salons') || 
      pathname.startsWith('/customers') || pathname.startsWith('/bookings') ||
      pathname.startsWith('/payments') || pathname.startsWith('/disputes') ||
      pathname.startsWith('/advertisements') || pathname.startsWith('/reports') ||
      pathname.startsWith('/settings')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
