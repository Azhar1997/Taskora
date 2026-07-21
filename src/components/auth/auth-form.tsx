"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, signupSchema } from "@/lib/validators";

type Mode = "login" | "signup";

export function AuthForm({
  action,
  mode,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  mode: Mode;
}) {
  const schema = mode === "login" ? loginSchema : signupSchema;
  type FormValues = z.infer<typeof schema>;
  const [state, formAction] = useActionState(action, {});
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === "login" ? ({ email: "", password: "" } as FormValues) : ({ name: "", email: "", password: "" } as FormValues),
  });
  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    startTransition(() => formAction(formData));
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {mode === "signup" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Full name
          </label>
          <Input id="name" {...form.register("name" as keyof FormValues)} placeholder="Ava Thompson" />
          {"name" in errors ? (
            <p className="text-xs text-[var(--danger)]">{String(errors.name?.message ?? "")}</p>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" {...form.register("email" as keyof FormValues)} placeholder="you@company.com" />
        {errors.email ? (
          <p className="text-xs text-[var(--danger)]">{String(errors.email.message ?? "")}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input id="password" type="password" {...form.register("password" as keyof FormValues)} placeholder="Password123!" />
        {errors.password ? (
          <p className="text-xs text-[var(--danger)]">{String(errors.password.message ?? "")}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Working..." : mode === "login" ? "Log in" : "Create account"}
      </Button>
    </form>
  );
}
