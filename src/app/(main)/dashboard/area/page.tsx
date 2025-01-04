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
import { api } from "@/trpc/react";

export default function AreaPage() {
  const [areas] = api.useQueries((t) => [t.area.getAreas()]);

  const [enumerators] = api.useQueries((t) => [t.admin.getEnumerators()]);

  if (!areas.data?.length) {
    return (
      <div className="text-center text-muted-foreground">No areas found</div>
    );
  }

  return (
    <div>
      <h1>Areas</h1>
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
                  <Select>
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
    </div>
  );
}
