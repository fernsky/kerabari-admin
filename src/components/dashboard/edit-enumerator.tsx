"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  updateEnumeratorSchema,
  type UpdateEnumeratorInput,
} from "@/server/api/routers/enumerators/enumerators.schema";

export function EditEnumerator({ enumeratorId }: { enumeratorId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const updateEnumerator = api.enumerator.update.useMutation();
  const { data: enumerator, isLoading: isLoadingEnumerator } =
    api.enumerator.getById.useQuery(enumeratorId);

  const form = useForm<UpdateEnumeratorInput>({
    resolver: zodResolver(updateEnumeratorSchema),
    defaultValues: {
      enumeratorId: enumeratorId,
      name: "",
      phoneNumber: "",
      email: "",
      userName: "",
      wardNumber: 1,
      isActive: true,
    },
  });

  useEffect(() => {
    if (enumerator) {
      form.reset({
        enumeratorId: enumeratorId,
        name: enumerator.name ?? undefined,
        phoneNumber: enumerator.phoneNumber ?? undefined,
        email: enumerator.email ?? undefined,
        userName: enumerator.userName ?? undefined,
        wardNumber: enumerator.wardNumber ?? undefined,
        isActive: enumerator.isActive ?? true,
      });
    }
  }, [enumerator, form, enumeratorId]);

  async function onSubmit(values: UpdateEnumeratorInput) {
    setIsLoading(true);
    try {
      await updateEnumerator.mutateAsync(values);
      toast.success("Enumerator updated successfully");
      router.push("/enumerators");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update enumerator",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingEnumerator) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-[600px] pt-10">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormControl>
                  <div>
                    <FormLabel>Full Name</FormLabel>
                    <Input {...field} placeholder="John Doe" />
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormControl>
                  <div>
                    <FormLabel>Phone Number</FormLabel>
                    <Input {...field} placeholder="9800000000" />
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormControl>
                  <div>
                    <FormLabel>Email (Optional)</FormLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="john@example.com"
                    />
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />

            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormControl>
                  <div>
                    <FormLabel>Username</FormLabel>
                    <Input {...field} placeholder="johndoe" />
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />

            <FormField
              control={form.control}
              name="wardNumber"
              render={({ field: { value, onChange, ...field } }) => (
                <FormControl>
                  <div>
                    <FormLabel>Ward Number</FormLabel>
                    <Input
                      {...field}
                      type="number"
                      value={value}
                      onChange={(e) => onChange(parseInt(e.target.value))}
                      min={1}
                    />
                    <FormMessage />
                  </div>
                </FormControl>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormControl>
                  <div className="flex items-center space-x-2 justify-between">
                    <FormLabel>Active</FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingButton /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
