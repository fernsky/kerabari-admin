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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Mail, MapPin, User2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function EnumeratorsList() {
  const [enumerators] = api.useQueries((t) => [t.admin.getEnumerators()]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const router = useRouter();

  if (enumerators.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!enumerators.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <User2 className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          No enumerators found
        </p>
      </div>
    );
  }

  const getStatusBadge = (isActive: boolean) => (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  const handleClick = (id: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on the dropdown
    if ((e.target as HTMLElement).closest(".dropdown-trigger")) {
      return;
    }
    router.push(`/enumerators/${id}`);
  };

  return (
    <>
      {isMobile ? (
        <div className="space-y-4 px-2">
          {enumerators.data.map((enumerator) => (
            <Card
              key={enumerator.id}
              className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={(e) => handleClick(enumerator.id, e)}
            >
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{enumerator.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {enumerator.id.slice(0, 8)}
                    </p>
                  </div>
                  {getStatusBadge(enumerator.isActive ?? false)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{enumerator.phoneNumber}</span>
                  </div>
                  {enumerator.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{enumerator.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Ward {enumerator.wardNumber}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <div className="dropdown-trigger">
                    <EnumeratorDropdown enumeratorId={enumerator.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enumerators.data.map((enumerator) => (
                <TableRow
                  key={enumerator.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => handleClick(enumerator.id, e)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{enumerator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {enumerator.id.slice(0, 8)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{enumerator.phoneNumber}</span>
                      </div>
                      {enumerator.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{enumerator.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Ward {enumerator.wardNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(enumerator.isActive ?? false)}
                  </TableCell>
                  <TableCell>
                    <div className="dropdown-trigger">
                      <EnumeratorDropdown enumeratorId={enumerator.id} />
                    </div>
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
