import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { SectionEditor } from "../../_components/section-editor";

interface EditorPageProps {
  params: {
    sectionId: string;
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Edit Section</h1>
        <p className="text-sm text-muted-foreground">Update section details and content.</p>
      </div>
      <SectionEditor sectionId={params.sectionId} />
    </div>
  );
}
