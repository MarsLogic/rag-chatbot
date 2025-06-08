// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Determine if the environment is secure (HTTPS) to select the correct cookie name
  const isSecure = req.nextUrl.protocol === 'https:';
  const cookieName = isSecure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  // The '!' non-null assertion operator assures TypeScript that the secret will exist.
  // The 'salt' property is now required by next-auth for enhanced security.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
    salt: cookieName,
  });

  const { pathname } = req.nextUrl;

  // Allow requests for next-auth session & provider fetching, and static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // If user is not logged in and is not on the login/register page, redirect to login
  if (!token && pathname !== '/login' && pathname !== '/register') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/upload (this is our Vercel Blob handler, needs to be public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/upload|_next/static|_next/image|favicon.ico).*)',
  ],
};