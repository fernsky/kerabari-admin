"use client";

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
import { toast } from "sonner";

import type { z } from "zod";

import { api } from "@/trpc/react";

import React from "react";

export default function AreaList() {
  console.log(api);
  const [areas] = api.useQueries((t) => [t.area.getAreas()]);

  const [enumerators] = api.useQueries((t) => [t.admin.getEnumerators()]);

  const assignAreaToEnumerator = api.area.assignAreaToEnumerator.useMutation();

  async function handleAssignment(
    values: z.infer<typeof assignAreaToEnumeratorSchema>,
  ) {
    try {
      await assignAreaToEnumerator.mutateAsync(values);
      toast.success("Sucessfully assigned area to enumerator.");
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ward Number</TableHead>
              <TableHead>Area Code</TableHead>
              <TableHead>Assign</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.data?.map((area) => (
              <TableRow key={area.code}>
                <TableCell>{area.wardNumber}</TableCell>
                <TableCell>{area.code}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={area.assignedTo ?? ""}
                    onValueChange={async (value) => {
                      await handleAssignment({
                        areaCode: area.code,
                        enumeratorId: value,
                      });
                    }}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select enumerator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {enumerators.data
                          ?.filter(
                            (enumerator) =>
                              enumerator.wardNumber == area.wardNumber,
                          )
                          .map((enumerator) => (
                            <SelectItem
                              key={enumerator.id}
                              value={enumerator.id}
                            >
                              {enumerator.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
