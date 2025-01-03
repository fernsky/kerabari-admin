"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { api } from "@/trpc/react";
import Link from "next/link";

export function WardsList() {
  const [wards] = api.useQueries((t) => [t.ward.getWards()]);

  if (!wards.data?.length) {
    return (
      <div className="text-center text-muted-foreground">No wards found</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ward Number</TableHead>
            <TableHead>Area Code</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wards.data.map((ward) => (
            <TableRow key={ward.wardNumber}>
              <TableCell>{ward.wardNumber}</TableCell>
              <TableCell>{ward.wardAreaCode}</TableCell>
              <TableCell>
                <Link href={`/dashboard/ward/update/${ward.wardNumber}`}>
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
