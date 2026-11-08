"use server";

import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";

const credentials = z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  name: z.string().trim().max(60).optional(),
});

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; error: string };

export async function signUpAction(input: z.input<typeof credentials>): Promise<AuthResult> {
  const parsed = credentials.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, error: "Accounts are not configured. Continue as a guest instead." };
  const { email, password, name } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name ?? "" },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, needsConfirmation: !data.session };
}

export async function signInAction(input: z.input<typeof credentials>): Promise<AuthResult> {
  const parsed = credentials.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, error: "Accounts are not configured. Continue as a guest instead." };
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await getServerSupabase();
  await supabase?.auth.signOut();
}
