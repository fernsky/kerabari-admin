"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";

export default function AreaList() {
  const [areas] = api.useQueries((t) => [t.area.getAreas()]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const router = useRouter();

  const handleRowClick = (id: string, event: React.MouseEvent) => {
    const isEditClick = (event.target as HTMLElement).closest("a");
    if (!isEditClick) {
      router.push(`/area/update/${id}`);
    }
  };

  if (!areas.data?.length) {
    return (
      <div className="text-center text-muted-foreground mt-20">
        No areas found
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        {areas.data.map((area) => (
          <Card
            key={area.id}
            className="shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-l-primary bg-gradient-to-r from-white to-gray-50"
            onClick={(e) => handleRowClick(area.id, e)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold  text-gray-700">
                  Area {area.code}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Ward</span>
                <span className="text-sm bg-primary/10  text-gray-700 px-2 py-0.5 rounded-full">
                  {area.wardNumber}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border shadow-lg p-6 bg-white">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="py-4 text-left text-sm font-semibold text-primary">
              Ward Number
            </TableHead>
            <TableHead className="py-4 text-left text-sm font-semibold text-primary">
              Area Code
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.data.map((area) => (
            <TableRow
              key={area.id}
              className="hover:bg-muted/50 transition-colors cursor-pointer border-b"
              onClick={(e) => handleRowClick(area.id, e)}
            >
              <TableCell className="py-4 text-sm font-medium">
                Ward {area.wardNumber}
              </TableCell>
              <TableCell className="py-4">
                <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                  {area.code}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
