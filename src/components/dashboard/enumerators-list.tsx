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
import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "react-responsive";
import { EnumeratorDropdown } from "./enumerator-dropdown";

export function EnumeratorsList() {
  const [enumerators] = api.useQueries((t) => [t.admin.getEnumerators()]);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  if (!enumerators.data?.length) {
    return (
      <div className="text-center text-muted-foreground">No chapters found</div>
    );
  }

  return (
    <>
      {isMobile ? (
        <>
          {enumerators.data.map((enumerator) => (
            <Card
              key={enumerator.id}
              className="mb-6 shadow-sm hover:shadow transition-shadow"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-xs font-medium text-gray-400">
                    ID: {enumerator.id.slice(0, 4)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {enumerator.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {enumerator.phoneNumber}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <EnumeratorDropdown enumeratorId={enumerator.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        <div className="hidden md:block">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enumerators.data.map((enumerator) => (
                <TableRow key={enumerator.id}>
                  <TableCell>{enumerator.id.slice(0, 4)}</TableCell>
                  <TableCell>{enumerator.name}</TableCell>
                  <TableCell>{enumerator.phoneNumber}</TableCell>
                  <TableCell>
                    <EnumeratorDropdown enumeratorId={enumerator.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
