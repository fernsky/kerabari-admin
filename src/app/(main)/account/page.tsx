import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { LogOut } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ProfileCard } from "./_components/profile-card";
import { QuickActionsCard } from "./_components/quick-actions-card";
import { HelpCard } from "./_components/help-card";

export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <ContentLayout title="Account Settings">
      <main className="container mx-auto min-h-screen space-y-6 p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Account Settings
              </h1>
              <p className="mt-1 text-muted-foreground">
                Manage your account preferences and settings
              </p>
            </div>
            {/* @ts-ignore */}
            <form action={logout}>
              <Button variant="outline" className="gap-2 flex">
                <LogOut className="h-4 w-4" />
                <p>Sign Out</p>
              </Button>
            </form>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ProfileCard user={user} />
            <QuickActionsCard />
          </div>

          <HelpCard />
        </div>
      </main>
    </ContentLayout>
  );
}
