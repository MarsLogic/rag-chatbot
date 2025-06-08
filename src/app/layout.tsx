// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { TrpcProvider } from "@/lib/trpc/provider"; // <-- 1. ADD THIS IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAG Chatbot Platform",
  description: "Your journey to intelligent conversational AI starts here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Nest the providers. The order is important. */}
        <AuthProvider>
          {/* 2. WRAP with TrpcProvider here, inside the AuthProvider */}
          <TrpcProvider>
            {children}
            <Toaster />
          </TrpcProvider>
        </AuthProvider>
      </body>
    </html>
  );
}