// src/components/auth/auth-provider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
};

// This component wraps our application with the NextAuth session context.
export default function AuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}