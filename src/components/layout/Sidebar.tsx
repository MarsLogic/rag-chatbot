// src/components/layout/Sidebar.tsx

"use client"; // This makes it a Client Component so we can use hooks

import Link from "next/link";
import { usePathname } from "next/navigation"; // Import the hook to read the URL path
import {
  LayoutDashboard,
  BotMessageSquare,
  Database,
  Settings,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chatbots", icon: BotMessageSquare, label: "Chatbots" },
  { href: "/data-sources", icon: Database, label: "Data Sources" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname(); // Get the current URL's path, e.g., "/dashboard"

  return (
    <div className="flex h-full flex-col border-r bg-gray-50">
      <div className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BotMessageSquare className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight">RAG-Bot</h1>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          // Check if the current path matches the link's href
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              // Conditionally add classes if the link is active
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 hover:text-gray-900 ${
                isActive ? "bg-gray-200 text-gray-900 font-semibold" : ""
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t p-4">
        <SignOutButton />
      </div>
    </div>
  );
}