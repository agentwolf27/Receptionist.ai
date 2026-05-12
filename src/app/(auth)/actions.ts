"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";

export interface AuthFormState {
  error?: string;
}

export async function signupAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");
  const { error } = await auth.signUp({ email, password, name });
  if (error) return { error };
  revalidatePath("/");
  redirect("/app/business?onboarding=1");
}

export async function loginAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await auth.signInWithPassword({ email, password });
  if (error) return { error };
  revalidatePath("/");
  redirect("/app");
}

export async function logoutAction() {
  await auth.signOut();
  redirect("/");
}
