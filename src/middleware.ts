import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const OWNER_ONLY = ['/analytics', '/settings'];
const MONITOR_ONLY = ['/activity'];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (OWNER_ONLY.some((p) => pathname.startsWith(p)) && role !== 'OWNER') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (MONITOR_ONLY.some((p) => pathname.startsWith(p)) && role !== 'MONITOR') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/expenses/:path*', '/analytics/:path*', '/activity/:path*', '/settings/:path*'],
};
