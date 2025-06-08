// src/app/(main)/chatbots/page.tsx

"use client";

import Link from "next/link"; // Import the Link component for navigation
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/trpc/client";
// FIX: Using the standard project alias. This is the correct convention.
import { CreateBotDialog } from "@/components/bots/CreateBotDialog"; 
import { Badge } from "@/components/ui/badge";

export default function ChatbotsPage() {
  const { data: bots, isLoading } = api.bot.list.useQuery();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Chatbots</h2>
          <p className="text-muted-foreground">
            Here you can manage all of your created chatbots.
          </p>
        </div>
        <CreateBotDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chatbots</CardTitle>
          <CardDescription>
            A list of all the chatbots in your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (!bots || bots.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No chatbots found. Create one to get started!
                  </TableCell>
                </TableRow>
              )}
              {bots?.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell className="font-medium">{bot.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{bot.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(bot.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {/* Add the Link to make the Edit button work */}
                        <Link href={`/chatbots/${bot.id}/settings`}>
                          <DropdownMenuItem>
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-100 focus:text-red-800">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}