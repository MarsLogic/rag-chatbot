// src/middleware.ts

// This is the modern, official, and most reliable way to handle
// authentication middleware with NextAuth.js v5. It uses the `auth`
// function we already configured in `src/server/auth.ts` and handles
// all the complex cookie and session logic for us automatically.
export { auth as middleware } from "@/server/auth";

// This config ensures the middleware runs on all paths except for
// specific static assets, API routes for file uploads, etc.
// This part of your file is correct and does not need to change.
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