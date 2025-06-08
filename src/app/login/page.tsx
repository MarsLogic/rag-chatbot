// src/app/login/page.tsx

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// This separate component is needed to use the `useFormStatus` hook,
// which provides the form's pending (submitting) state.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export default function LoginPage() {
  // `useFormState` manages the state returned from the server action (e.g., error messages)
  const [state, formAction] = useFormState(signInAction, undefined);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-lg shadow-lg border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login to Your Account</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access the platform.
          </p>
        </div>
        
        {/* The form's `action` prop is directly connected to our server action */}
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email" // The `name` attribute is essential for server actions
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password" // The `name` attribute is essential for server actions
              type="password"
              placeholder="********"
              required
            />
          </div>
          
          {/* This block will only render if the server action returns an error */}
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}