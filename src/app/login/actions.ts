// src/app/login/actions.ts

"use server";

import { signIn } from "@/server/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { loginSchema } from "./schemas";

// Define the shape of the state object that the action will return
type SignInState = {
  error?: string;
  success?: boolean;
};

// This is the correct signature for a server action used with `useFormState`:
// It takes the previous state and the form data as arguments.
export async function signInAction(
  prevState: SignInState | undefined,
  formData: FormData,
): Promise<SignInState> {
  // Convert FormData to a plain object for validation
  const values = Object.fromEntries(formData.entries());

  // Validate the form data with your Zod schema
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  try {
    // Pass the validated data to NextAuth's signIn function
    await signIn("credentials", {
      ...validatedFields.data,
      redirectTo: "/dashboard",
    });

    // This part is unreachable on success because of the automatic redirect.
    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "An unexpected error occurred." };
      }
    }
    // NextAuth throws a special error on successful redirect, which we must re-throw.
    throw error;
  }
}