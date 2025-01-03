import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Signup } from "./signup";

export const metadata = {
    title: "Signup",
    description: "Signup Page",
};

export default async function SignupPage() {
    const { user } = await validateRequest();

    if (user) redirect(Paths.Dashboard);

    return <Signup />;
}