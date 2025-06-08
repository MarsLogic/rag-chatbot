// src/server/actions/auth.ts
"use server";

import { signOut } from "@/server/auth";

export const signOutUser = async () => {
  await signOut({
    redirectTo: "/login",
  });
};