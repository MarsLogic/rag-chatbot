// src/lib/actions.ts
'use server';

import { signOut } from '@/server/auth';

export async function signOutAction() {
  // We call signOut with NO options. We destroy the session and let the
  // middleware handle the redirect based on its rules.
  await signOut();
}