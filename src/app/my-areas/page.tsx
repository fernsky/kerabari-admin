import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";

export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  console.log(user);
  return <main className="container mx-auto min-h-screen p-4"></main>;
}
