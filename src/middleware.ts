// src/middleware.ts

export { auth as middleware } from "@/server/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/upload (Vercel Blob handler)
     * - api/inngest (NEW: Inngest webhook handler)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/upload|api/inngest|_next/static|_next/image|favicon.ico).*)',
  ],
};