// src/middleware.ts

import { auth } from "@/server/auth";

export default auth((req) => {
  // The 'auth' middleware already protects all routes by default.
  // We only need to add custom logic for redirecting logged-in users.

  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  
  // If a logged-in user tries to access the login or register pages,
  // redirect them to their dashboard.
  if (isLoggedIn) {
    if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }
  }

  // If not logged in and not on a public page, the default `auth` handler will
  // automatically redirect them to the login page.
  
  // Allow the request to proceed if no custom redirect is needed.
  return;
});

// This config specifies that the middleware should only run on paths
// that are NOT API routes, static files, or image optimization routes.
// Your existing config is correct.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};