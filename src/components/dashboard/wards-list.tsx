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
import { Edit3 } from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";

export function WardsList() {
  const [wards] = api.useQueries((t) => [t.ward.getWards()]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const router = useRouter();

  const handleRowClick = (wardNumber: number, event: React.MouseEvent) => {
    const isEditClick = (event.target as HTMLElement).closest("a");
    if (!isEditClick) {
      router.push(`/ward/show/${wardNumber}`);
    }
  };

  if (!wards.data?.length) {
    return (
      <div className="text-center text-muted-foreground mt-20">
        No wards found
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        {wards.data.map((ward) => (
          <Card
            key={ward.wardNumber}
            className="shadow-lg cursor-pointer"
            onClick={(e) => handleRowClick(ward.wardNumber, e)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Ward Number: {ward.wardNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Area Code: {ward.wardAreaCode}
              </p>
              <Link
                href={`/ward/update/${ward.wardNumber}`}
                className="text-blue-500 hover:underline flex items-center"
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
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {wards.data.map((ward) => (
            <TableRow
              key={ward.wardNumber}
              className="hover:bg-gray-100 cursor-pointer"
              onClick={(e) => handleRowClick(ward.wardNumber, e)}
            >
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {ward.wardNumber}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ward.wardAreaCode}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                <Link
                  href={`/ward/update/${ward.wardNumber}`}
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
