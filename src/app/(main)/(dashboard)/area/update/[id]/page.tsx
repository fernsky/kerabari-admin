import { AreaEdit } from "@/components/dashboard/area-edit";
import { AreaWrapper } from "@/components/dashboard/area-wrapper";

export default function UpdateAreaPage({ params }: { params: { id: string } }) {
  return (
    <AreaWrapper>
      <AreaEdit areaCode={parseInt(params.id)} />
    </AreaWrapper>
  );
}
