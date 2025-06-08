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

  // --- THIS IS THE FIX ---
  // We add this callbacks block to put the user's ID into the session token.
  callbacks: {
    // The 'jwt' callback is called when a JSON Web Token is created.
    // We can add custom properties to the token here.
    jwt({ token, user }) {
      if (user) {
        // When the user first signs in, add their ID to the token.
        token.id = user.id;
      }
      return token;
    },
    // The 'session' callback is called when a session is checked.
    // We can add the custom properties from the token to the session object.
    session({ session, token }) {
      if (session.user) {
        // Add the ID from the token to the session.user object.
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});