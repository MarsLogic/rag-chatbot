// src/components/settings/ProfileForm.tsx

"use client";

import { api } from "@/lib/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import type { AppRouter } from "@/server/api/routers/_app";
import type { TRPCClientErrorLike } from "@trpc/client";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  // FIX: 'useUtils' is deprecated. Replaced with 'useContext'.
  const utils = api.useContext();
  
  const { data: user, isLoading } = api.account.me.useQuery();
  
  const updateProfile = api.account.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
      });
      // Invalidate query to refetch fresh data
      utils.account.me.invalidate();
      router.refresh(); // Refresh server components if needed
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: "Error",
        description: error.message || "Could not update profile.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    disabled: isLoading || updateProfile.isPending,
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
      });
    }
  }, [user, form.reset]);

  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate({ name: data.name });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is your public display name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly disabled />
                  </FormControl>
                  <FormDescription>
                    You cannot change your email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be your display name on the platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting || updateProfile.isPending}>
              {form.formState.isSubmitting || updateProfile.isPending ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}