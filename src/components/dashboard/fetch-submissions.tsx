"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FetchSubmissions = ({ formId }: { formId: string }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [count, setCount] = useState<string>("100");

  const fetchMutation = api.superadmin.fetchSurveySubmissions.useMutation({
    onSuccess: () => {
      toast.success("Submissions fetched successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMutation.mutate({
      id: formId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      count: count ? parseInt(count) : undefined,
    });
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Fetch Form Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>

                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Count</label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              disabled={fetchMutation.isLoading}
              className="w-full"
            >
              {fetchMutation.isLoading ? "Fetching..." : "Fetch Submissions"}
            </Button>
          </div>
          {fetchMutation.isError && (
            <p className="text-red-500 text-sm mt-2">
              {fetchMutation.error.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
