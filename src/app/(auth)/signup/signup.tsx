"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { APP_TITLE } from "@/lib/constants";
import { signup } from "@/lib/auth/actions";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Signup() {
  const [state, formAction] = useFormState(signup, null);

  const wards = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4 text-center">
        <CardTitle className="text-xl">{APP_TITLE}</CardTitle>
        <CardDescription className="text-sm">
          Log in to your account to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              required
              placeholder="Ram Prasad Koirala"
              id="name"
              autoComplete="name"
              name="name"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              required
              id="phoneNumber"
              placeholder="9841234567"
              autoComplete="tel"
              name="phoneNumber"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              id="email"
              placeholder="ramprasadkoirala@gmail.com"
              autoComplete="email"
              name="email"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Username</Label>
            <Input
              required
              id="userName"
              placeholder="ramprasad"
              autoComplete="username"
              name="userName"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wardNumber">Ward Number</Label>
            <Select name="wardNumber" required>
              <SelectTrigger className="">
                <SelectValue placeholder="Select your ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {wards.map((ward) => {
                    return (
                      <SelectItem key={ward.value} value={ward.value}>
                        {ward.label}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="********"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repeatPassword">Repeat Password</Label>
            <PasswordInput
              id="repeatPassword"
              name="repeatPassword"
              required
              autoComplete="new-password"
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
            Sign Up
          </SubmitButton>
        </form>
        <p className="my-3 flex gap-2 justify-center">
          <span className="text-sm text-gray-400 font-light">
            Already have an account?
          </span>
          <Link
            href="/login"
            className="text-blue-900 text-sm text-center underline"
          >
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
