import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { ResetPasswordForm } from "./_components/reset-password-form";
import { Paths } from "@/lib/constants";
import { CreateNewUserForm } from "./_components/create-new-user-form";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Settings",
  description: "Update your dashboard settings",
};

export default async function SettingsPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect(Paths.Login);
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>
      <div className="grid gap-8">
        <div className="max-w-lg">
          <ResetPasswordForm />
        </div>
        {user.role === "admin" && (
          <div className="max-w-lg">
            <CreateNewUserForm />
          </div>
        )}
      </div>
    </div>
  );
}
