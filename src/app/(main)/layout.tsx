// src/app/(main)/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">
      <aside className="hidden w-64 flex-col border-r md:flex">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-100/50">
        {children}
      </main>
    </div>
  );
}