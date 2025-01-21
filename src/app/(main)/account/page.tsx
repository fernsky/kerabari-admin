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

export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);
  console.log(user);

  return (
    <main className="container mx-auto min-h-screen p-4">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Welcome, {user.name}!</CardTitle>
          <CardDescription>Your account details are below:</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Role:</strong>{" "}
            {user.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : "N/A"}
          </p>
          <p>
            <strong>Username:</strong> {user.userName}
          </p>
          <p>
            <strong>Ward Number:</strong> {user.wardNumber}
          </p>
        </CardContent>
        <CardFooter>
          {/* @ts-ignore */}
          <form action={logout}>
            <SubmitButton variant="outline">Logout</SubmitButton>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
