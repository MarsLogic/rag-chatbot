// src/app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // The middleware already protects this page for unauthenticated users.
  // This server-side redirect ensures that any authenticated user who
  // happens to land on the root URL is immediately sent to their dashboard.
  // This makes the root URL behave like a stable entrypoint to the app.
  redirect("/dashboard");

  // This part of the component will never render due to the redirect.
  return null;
}