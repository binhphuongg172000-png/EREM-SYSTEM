import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    if (!userId || !userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/sale/dashboard', request.url));
    }
  }

  // Protect /sale routes
  if (path.startsWith('/sale')) {
    if (!userId || !userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'SALE') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Redirect root to correct dashboard
  if (path === '/') {
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/sale/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/sale/:path*'],
};
