// src/app/(main)/settings/page.tsx

import { ProfileForm } from "@/components/settings/ProfileForm";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ProfileForm />
    </div>
  );
}