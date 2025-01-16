import { useMediaQuery } from "react-responsive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Copy, Filter, Key } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenListProps {
  areaId: string;
}

// Add this new component for mobile card view
const TokenCard = ({
  token,
  onCopy,
}: {
  token: any;
  onCopy: (token: string) => void;
}) => (
  <div className="rounded-lg border p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="font-mono text-sm break-all">
        {token.token.slice(0, 8)}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onCopy(token.token)}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
    <div className="flex items-center justify-between">
      <Badge variant={token.status === "allocated" ? "default" : "secondary"}>
        {token.status}
      </Badge>
    </div>
  </div>
);

const TokenTable = ({
  data,
  onCopy,
}: {
  data: { tokens: any[]; pagination: any };
  onCopy: (token: string) => void;
}) => {
  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (!isDesktop) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {data.tokens.map((token) => (
          <TokenCard key={token.token} token={token} onCopy={onCopy} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Token</TableHead>
            <TableHead className="w-[30%]">Status</TableHead>
            <TableHead className="text-right w-[30%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.tokens.map((token) => (
            <TableRow key={token.token.slice(0, 8)}>
              <TableCell className="font-mono break-all">
                {token.token.slice(0, 8)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    token.status === "allocated" ? "default" : "secondary"
                  }
                >
                  {token.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(token.token)}
                >
                  <Copy className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border rounded-md p-4">
      <p className="text-sm text-muted-foreground text-center sm:text-left">
        Showing{" "}
        <span className="font-medium">
          {page * pageSize + 1} - {Math.min((page + 1) * pageSize, total)}
        </span>{" "}
        of <span className="font-medium">{total}</span> tokens
      </p>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={(page + 1) * pageSize >= total}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const TokenList = ({ areaId }: TokenListProps) => {
  const [status, setStatus] = useState<"allocated" | "unallocated" | undefined>(
    undefined,
  );
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const { data, isLoading } = api.area.getAreaTokens.useQuery({
    areaId,
    status,
    limit: pageSize,
    offset: page * pageSize,
  });

  const copyToClipboard = async (token: string) => {
    await navigator.clipboard.writeText(token);
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter Tokens</span>
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as "allocated" | "unallocated" | undefined);
              setPage(0); // Reset page when filter changes
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All tokens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tokens</SelectItem>
              <SelectItem value="allocated">Allocated only</SelectItem>
              <SelectItem value="unallocated">Unallocated only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : !data || !data.tokens.length ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Key className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No tokens found
            </p>
            <p className="text-sm text-muted-foreground">
              {status
                ? `No ${status} tokens available`
                : "No tokens available for this area"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <TokenTable data={data} onCopy={copyToClipboard} />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={data.pagination.total}
              onPageChange={setPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
