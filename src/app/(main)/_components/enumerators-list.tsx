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

export function EnumeratorsList() {
  const [enumerators] = api.useQueries((t) => [t.admin.getEnumerators()]);

  if (!enumerators.data?.length) {
    return (
      <div className="text-center text-muted-foreground">No chapters found</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enumerators.data.map((enumerator) => (
            <TableRow key={enumerator.id}>
              <TableCell>{enumerator.name}</TableCell>
              <TableCell>{enumerator.phoneNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
