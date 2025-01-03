import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { SectionList } from "./_components/section-list";

export default async function SectionsPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Sections</h1>
        <p className="text-sm text-muted-foreground">
          Manage sections that contain paragraphs and tables.
        </p>
      </div>
      <SectionList />
    </div>
  );
}
