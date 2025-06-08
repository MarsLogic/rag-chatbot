// src/middleware.ts
import { auth } from "@/server/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Rule 1: Protect the dashboard and all main app routes.
  // If a user is not logged in, redirect them to the login page.
  if ((pathname.startsWith('/dashboard') || pathname === '/') && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  // Rule 2: Handle logged-in users.
  // If a logged-in user tries to access the login or register pages,
  // redirect them to their dashboard.
  if (isLoggedIn && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
  
  // Rule 3: Allow all other requests to proceed.
  return;
})

// Do not invoke Middleware on API routes, static files, or image assets.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}