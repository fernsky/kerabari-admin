"use client";

import { useState } from "react";
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
  createEnumeratorSchema,
  type CreateEnumeratorInput,
} from "@/server/api/routers/enumerators/enumerators.schema";

export function CreateEnumerator() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const createEnumerator = api.enumerator.create.useMutation();

  const form = useForm<CreateEnumeratorInput>({
    resolver: zodResolver(createEnumeratorSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      userName: "",
      wardNumber: 1,
      password: "",
      isActive: true,
    },
  });

  async function onSubmit(values: CreateEnumeratorInput) {
    setIsLoading(true);
    try {
      await createEnumerator.mutateAsync(values);
      toast.success("Enumerator created successfully");
      router.push("/enumerators");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create enumerator",
      );
    } finally {
      setIsLoading(false);
    }
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
              name="password"
              render={({ field }) => (
                <FormControl>
                  <div>
                    <FormLabel>Password</FormLabel>
                    <Input {...field} type="password" />
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
                {isLoading ? <LoadingButton /> : "Create Enumerator"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
