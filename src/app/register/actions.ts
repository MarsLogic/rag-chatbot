// src/app/register/actions.ts

"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from 'next/navigation';
import { registerSchema } from "./schemas";

export async function registerUser(values: z.infer<typeof registerSchema>) {
  // 1. Validate the input fields on the server
  const validatedFields = registerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields provided." };
  }

  const { name, email, password } = validatedFields.data;

  // 2. Check if a user with this email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: "A user with this email already exists." };
  }

  // 3. Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Try to create the new user
  try {
    await db.insert(users).values({
      name,
      email,
      hashedPassword,
    });
    
  } catch (dbError) {
    console.error("Database error:", dbError);
    return { error: "Could not create user. Please try again." };
  }

  // 5. THIS IS THE FIX: Redirect to the login page AFTER successful creation.
  // This must be called *outside* the try...catch block to avoid an error
  // with how Next.js handles redirects within them.
  redirect('/login');
}