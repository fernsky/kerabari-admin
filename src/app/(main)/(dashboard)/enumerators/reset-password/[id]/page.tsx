import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ResetEnumeratorPassword } from "@/components/dashboard/reset-enumerator-password";

export default function ResetEnumeratorPasswordPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ContentLayout title="Reset Password">
      <ResetEnumeratorPassword enumeratorId={params.id} />
    </ContentLayout>
  );
}
