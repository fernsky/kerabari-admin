"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { APP_TITLE } from "@/lib/constants";
import { login } from "@/lib/auth/actions";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export function Login() {
  const [state, formAction] = useFormState(login, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4 text-center">
        <CardTitle className="text-xl">{APP_TITLE}</CardTitle>
        <CardDescription className="text-sm">
          Log in to your account to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="userName">Username</Label>
            <Input
              required
              id="userName"
              placeholder="ramprasadkoirala"
              autoComplete="userName"
              name="userName"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="********"
            />
          </div>

          {state?.fieldError ? (
            <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {Object.values(state.fieldError).map((err) => (
                <li className="ml-4" key={err}>
                  {err}
                </li>
              ))}
            </ul>
          ) : state?.formError ? (
            <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {state?.formError}
            </p>
          ) : null}
          <SubmitButton className="w-full" aria-label="submit-btn">
            Log In
          </SubmitButton>
        </form>
        <p className="my-3 flex gap-2 justify-center">
          <span className="text-sm text-gray-400 font-light">
            Do not have an account?
          </span>
          <Link
            href="/signup"
            className="text-blue-900 text-sm text-center underline"
          >
            Singup
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
