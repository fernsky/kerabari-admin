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
  return <main className="container mx-auto min-h-screen p-4"></main>;
}
