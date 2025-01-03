import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { NewSectionForm } from "../_components/new-section-form";

export default async function CreateSectionPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Create Section</h1>
        <p className="text-sm text-muted-foreground">Create a new section to organize content.</p>
      </div>
      <NewSectionForm />
    </div>
  );
}
