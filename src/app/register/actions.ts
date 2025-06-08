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
  const validatedFields = registerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields provided." };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUserResult = await db.select().from(users).where(eq(users.email, email));
  const existingUser = existingUserResult[0];

  if (existingUser) {
    return { error: "A user with this email already exists." };
  }

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
  
  redirect('/login');
}