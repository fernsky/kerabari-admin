import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <ContentLayout title="Account">
      <div className="flex">
        <p className="justify-end">
          <Button>Request an Area</Button>
        </p>
      </div>
    </ContentLayout>
  );
}
