"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createUser } from "@/lib/auth/actions";

export function CreateNewUserForm() {
  const [domain, setDomain] = useState<"municipality" | "ward">("municipality");
  const [error, setError] = useState<string>();

  async function handleSubmit(formData: FormData) {
    // TODO: Implement create user action
    const result = await createUser(null, formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success("User created successfully");
      const form = document.getElementById("create-user-form") as HTMLFormElement;
      form.reset();
    }
  }

  return (
    <Card className="w-[1000px]">
      <CardHeader className="grid gap-2">
        <CardTitle>Add user</CardTitle>
        <CardDescription>
          Add a new user to the system. Admins can create users with different roles and access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="create-user-form" action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="userName">Username</Label>
            <Input
              id="userName"
              name="userName"
              type="text"
              required
              placeholder="Enter username"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Set password for user"
            />
          </div>

          <div className="grid gap-2">
            <Label>Domain Access</Label>
            <RadioGroup
              name="domain"
              defaultValue="municipality"
              onValueChange={(value) => setDomain(value as "municipality" | "ward")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="municipality" id="municipality" />
                <Label htmlFor="municipality">Municipality</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ward" id="ward" />
                <Label htmlFor="ward">Ward</Label>
              </div>
            </RadioGroup>
          </div>

          {domain === "ward" && (
            <div className="grid gap-2">
              <Label htmlFor="wardNumber">Ward Number</Label>
              <Input
                id="wardNumber"
                name="wardNumber"
                type="number"
                min="1"
                required
                placeholder="Enter ward number"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" required defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(undefined);
                const form = document.getElementById("create-user-form") as HTMLFormElement;
                form.reset();
              }}
            >
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
      {pending ? "Creating..." : "Create User"}
    </Button>
  );
}
