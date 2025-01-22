import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  MapPin,
  AtSign,
  Phone,
  Building2,
  LogOut,
  Mail,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const roleColors = {
    admin: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    superadmin: "bg-red-100 text-red-800 hover:bg-red-200",
    enumerator: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  };

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
            {/* Profile Card */}
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="border-b bg-muted/50 pb-8">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Account Profile
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge
                    className={`${
                      roleColors[user.role as keyof typeof roleColors]
                    } px-3 py-1 text-xs font-medium`}
                  >
                    {(user.role ?? "user").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <AtSign className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Username
                      </p>
                      <p className="font-medium">{user.userName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <Building2 className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Ward Assignment
                      </p>
                      <p className="font-medium">Ward {user.wardNumber}</p>
                    </div>
                  </div>

                  {user.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-orange-100 p-2">
                        <Phone className="h-4 w-4 text-orange-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Phone
                        </p>
                        <p className="font-medium">{user.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {user.email && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-100 p-2">
                        <Mail className="h-4 w-4 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Quick Actions</CardTitle>
                </div>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link href="/">
                      <Shield className="h-4 w-4" />
                      Change Password
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link href="/">
                      <Clock className="h-4 w-4" />
                      Activity Log
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link href="/">
                      <MapPin className="h-4 w-4" />
                      View Assigned Areas
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help Card */}
          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-2">
                <Shield className="h-5 w-5 text-blue-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you need assistance with your account or have any
                  questions, please contact your supervisor or the support team
                  at{" "}
                  <a
                    href="mailto:support@example.com"
                    className="text-primary hover:underline"
                  >
                    support@example.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </ContentLayout>
  );
}
