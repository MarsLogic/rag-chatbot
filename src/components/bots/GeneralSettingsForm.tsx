// src/components/bots/GeneralSettingsForm.tsx

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// FIX: Import the official type helper and router
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/api/routers/_app";
import { TRPCClientErrorLike } from "@trpc/client";

// FIX: Use the recommended `inferRouterOutputs` to get the correct type for our bot object
type RouterOutput = inferRouterOutputs<AppRouter>;
type Bot = RouterOutput["bot"]["byId"];
type BotUpdateOutput = RouterOutput["bot"]["update"];

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneralSettingsFormProps {
  bot: Bot;
}

export function GeneralSettingsForm({ bot }: GeneralSettingsFormProps) {
  const { toast } = useToast();
  const utils = api.useContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // This useEffect pre-populates the form with the bot's current data
  useEffect(() => {
    if (bot) {
      form.reset({
        name: bot.name,
        description: bot.description ?? "",
      });
    }
  }, [bot, form.reset]);

  const updateBotMutation = api.bot.update.useMutation({
    // FIX: Explicitly type the 'updatedBot' parameter
    onSuccess: (updatedBot: BotUpdateOutput) => {
      toast({
        title: "Settings Saved",
        description: `"${updatedBot.name}" has been updated.`,
      });
      // Invalidate queries to refetch fresh data across the app
      utils.bot.byId.invalidate({ id: bot.id });
      utils.bot.list.invalidate();
    },
    // FIX: Explicitly type the 'error' parameter
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: "Error",
        description: error.message || "Could not save settings.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    updateBotMutation.mutate({
      id: bot.id,
      ...values,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Support Bot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short description of your bot's purpose."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateBotMutation.isPending}>
              {updateBotMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}