// src/components/bots/CreateBotDialog.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { inferRouterOutputs } from "@trpc/server";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { AppRouter } from "@/server/api/routers/_app";
import { TRPCClientErrorLike } from "@trpc/client";

const createBotSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().optional(),
});

type CreateBotFormValues = z.infer<typeof createBotSchema>;
type RouterOutput = inferRouterOutputs<AppRouter>;
type BotCreateOutput = RouterOutput["bot"]["create"];

export function CreateBotDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useContext();

  const form = useForm<CreateBotFormValues>({
    resolver: zodResolver(createBotSchema),
    defaultValues: { name: "", description: "" },
  });

  const createBotMutation = api.bot.create.useMutation({
    onSuccess: (data: BotCreateOutput) => {
      toast({
        title: "Chatbot Created!",
        description: `Your new chatbot "${data.name}" is ready.`,
      });
      utils.bot.list.invalidate();
      setIsOpen(false);
      form.reset();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create chatbot.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: CreateBotFormValues) {
    createBotMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Chatbot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Chatbot</DialogTitle>
          <DialogDescription>
            Give your new chatbot a name to get started. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Customer Support Bot'" {...field} />
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
                      placeholder="e.g., 'Answers questions about our products and services.'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem> // <-- FIX: Corrected typo from </FodrmItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBotMutation.isPending}>
                {createBotMutation.isPending ? "Creating..." : "Create Chatbot"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}