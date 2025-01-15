"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  updateEnumeratorSchema,
  type UpdateEnumeratorInput,
} from "@/server/api/routers/enumerators/enumerators.schema";
import { z } from "zod";

const FormCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4">{children}</CardContent>
  </Card>
);

export function EditEnumerator({ enumeratorId }: { enumeratorId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const updateEnumerator = api.enumerator.update.useMutation();
  const resetPassword = api.enumerator.resetPassword.useMutation();
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

  type PasswordFormValues = {
    password: string;
    confirmPassword: string;
  };

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(
      z
        .object({
          password: z.string().min(6),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }),
    ),
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

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await resetPassword.mutateAsync({
        enumeratorId,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Password reset successfully");
      passwordForm.reset();
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  if (isLoadingEnumerator) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 px-2 lg:px-10">
      <Form {...form}>
        <form
          id="enumerator-form"
          className="grid gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormCard
            title="Personal Information"
            description="Basic details about the enumerator"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="9800000000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormCard>

          <FormCard
            title="Account Details"
            description="Login credentials and account status"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="johndoe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wardNumber"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Ward Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between space-x-2">
                      <FormLabel>Active Status</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormCard>

          <FormCard
            title="Security"
            description="Reset password for this enumerator"
          >
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={resetPassword.isLoading}>
                    Reset Password
                  </Button>
                </div>
              </form>
            </Form>
          </FormCard>
        </form>
      </Form>
    </div>
  );
}
