"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CloudOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useJourney } from "@/lib/store/journey-store";

const schema = z.object({
  name: z.string().trim().max(60).optional(),
  email: z.email("Please enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});
type Values = z.infer<typeof schema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const startJourney = useJourney((s) => s.startJourney);
  const onboarded = useJourney((s) => Boolean(s.onboardedAt));
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(params.get("confirmed") ? "Email confirmed — welcome! Please sign in." : null);
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = mode === "login" ? await signInAction(values) : await signUpAction(values);
    if (!res.ok) return setServerError(res.error);
    if (res.needsConfirmation) return setNotice("Check your inbox to confirm your email, then sign in.");
    startJourney("account");
    router.push(mode === "register" && !onboarded ? "/onboarding" : "/journey");
  });

  const guest = () => {
    if (!onboarded) startJourney("guest");
    router.push(onboarded ? "/journey" : "/onboarding");
  };

  return (
    <main className="paper-grain grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-lift sm:p-8">
          <h1 className="font-display text-3xl font-semibold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "login" ? "Pick up your story where you left it." : "Save your journey securely and access it on any device."}
          </p>

          {!isSupabaseConfigured ? (
            <div className="mt-6 space-y-4">
              <div className="flex gap-3 rounded-2xl bg-gold-soft p-4 text-sm">
                <CloudOff className="mt-0.5 size-5 shrink-0 text-gold" />
                <p>
                  Cloud accounts aren&apos;t configured on this deployment. You can still enjoy everything as a guest — your journey is stored privately on this device.
                </p>
              </div>
              <Button className="w-full" onClick={guest} data-testid="continue-guest">
                Continue as guest
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your first name</Label>
                  <Input id="name" autoComplete="given-name" {...register("name")} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(formState.errors.email)} {...register("email")} />
                <FieldError>{formState.errors.email?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} aria-invalid={Boolean(formState.errors.password)} {...register("password")} />
                <FieldError>{formState.errors.password?.message}</FieldError>
              </div>
              <FieldError>{serverError}</FieldError>
              {notice && <p className="rounded-2xl bg-sage-soft p-3 text-sm">{notice}</p>}
              <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
                {formState.isSubmitting && <Loader2 className="animate-spin" />}
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={guest}>
                Continue as guest instead
              </Button>
            </form>
          )}
        </div>
        <p className="text-center text-sm text-muted">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-primary hover:underline">
            {mode === "login" ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
