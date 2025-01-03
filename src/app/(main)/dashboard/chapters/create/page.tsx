import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { NewChapterForm } from "../../_components/new-chapter-form";

export default async function CreateChapterPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Create Chapter</h1>
        <p className="text-sm text-muted-foreground">
          Chapter contain sections that can be placed with content.
        </p>
      </div>
      <NewChapterForm />
    </div>
  );
}
