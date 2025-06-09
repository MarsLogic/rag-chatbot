// src/server/auth.ts

import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users } from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });
        if (!user || !user.hashedPassword) {
          return null;
        }
        const passwordsMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (passwordsMatch) {
          return user;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  
  // This callbacks block is correct and necessary.
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});