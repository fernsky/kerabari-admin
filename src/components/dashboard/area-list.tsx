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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignAreaToEnumeratorSchema } from "@/server/api/routers/areas/area.schema";
import { api } from "@/trpc/react";
import { Edit3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { toast } from "sonner";
import type { z } from "zod";

export default function AreaList() {
  const [areas] = api.useQueries((t) => [t.area.getAreas()]);
  const [enumerators] = api.useQueries((t) => [t.admin.getEnumerators()]);
  const assignAreaToEnumerator = api.area.assignAreaToEnumerator.useMutation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const router = useRouter();

  const handleRowClick = (areaCode: number, event: React.MouseEvent) => {
    const isEditClick = (event.target as HTMLElement).closest(
      "a,select,button",
    );
    if (!isEditClick) {
      router.push(`/area/update/${areaCode}`);
    }
  };

  async function handleAssignment(
    values: z.infer<typeof assignAreaToEnumeratorSchema>,
  ) {
    try {
      await assignAreaToEnumerator.mutateAsync(values);
      toast.success("Successfully assigned area to enumerator.");
    } catch (error) {
      toast.error("Failed to assign area to enumerator.");
    }
  }

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
            key={area.code}
            className="shadow-lg cursor-pointer"
            onClick={(e) => handleRowClick(area.code, e)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Area Code: {area.code}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Ward Number: {area.wardNumber}
              </p>
              <div className="mt-2">
                <Select
                  //@ts-ignore
                  defaultValue={area.assignedTo ?? ""}
                  onValueChange={(value) =>
                    handleAssignment({
                      areaCode: area.code,
                      enumeratorId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign Enumerator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {enumerators.data
                        ?.filter(
                          (enumerator) =>
                            enumerator.wardNumber === area.wardNumber,
                        )
                        .map((enumerator) => (
                          <SelectItem key={enumerator.id} value={enumerator.id}>
                            {enumerator.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Link
                href={`/area/update/${area.code}`}
                className="text-blue-500 hover:underline flex items-center mt-2"
              >
                <Edit3 className="inline-block mr-2 w-4 h-4" />
                Edit
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-lg p-4 bg-white">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ward Number
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Area Code
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assign To
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {areas.data.map((area) => (
            <TableRow
              key={area.code}
              className="hover:bg-gray-100 cursor-pointer"
              onClick={(e) => handleRowClick(area.code, e)}
            >
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {area.wardNumber}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {area.code}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <Select
                  //@ts-ignore
                  defaultValue={area.assignedTo ?? ""}
                  onValueChange={(value) =>
                    handleAssignment({
                      areaCode: area.code,
                      enumeratorId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign Enumerator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {enumerators.data
                        ?.filter(
                          (enumerator) =>
                            enumerator.wardNumber === area.wardNumber,
                        )
                        .map((enumerator) => (
                          <SelectItem key={enumerator.id} value={enumerator.id}>
                            {enumerator.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                <Link
                  href={`/area/update/${area.code}`}
                  className="flex items-center hover:underline"
                >
                  <Edit3 className="inline-block mr-2 w-4 h-4" />
                  Edit
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
