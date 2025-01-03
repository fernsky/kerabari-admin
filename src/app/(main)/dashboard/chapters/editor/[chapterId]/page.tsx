import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { ChapterEditor } from "../../_components/chapter-editor";

interface EditorPageProps {
  params: {
    chapterId: string;
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">Edit Chapter</h1>
        <p className="text-sm text-muted-foreground">Update the details of the chapter.</p>
      </div>
      <ChapterEditor chapterId={params.chapterId} />
    </div>
  );
}
