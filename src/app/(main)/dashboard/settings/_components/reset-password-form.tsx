"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/auth/actions";

export function ResetPasswordForm() {
  const [error, setError] = useState<string>();

  // Add clear handler
  const handleClear = () => {
    setError(undefined);
    const form = document.getElementById("password-form") as HTMLFormElement;
    form.reset();
  };

  async function handleSubmit(formData: FormData) {
    const result = await resetPassword(null, formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success("Password updated successfully");
      const form = document.getElementById("password-form") as HTMLFormElement;
      form.reset();
    }
  }

  return (
    <Card className="w-[1000px]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-gray-800">Password</CardTitle>
        <CardDescription>
          Change your password here. Make sure to use a strong password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="password-form" action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="mt-4 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-[160px]" disabled={pending}>
      {pending ? "Updating..." : "Update password"}
    </Button>
  );
}
