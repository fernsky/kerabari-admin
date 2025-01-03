import { type Metadata } from "next";
import { env } from "@/env";
import { NewPartForm } from "../_components/new-part-form";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Create New Part",
  description: "Create a new part for your document",
};

export default function NewPartPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Create Part</h1>
        <p className="text-sm text-muted-foreground">
          Add a new part to your document. Parts can contain multiple chapters and sections.
        </p>
      </div>
      <div className="max-w-lg">
        <NewPartForm />
      </div>
    </div>
  );
}
