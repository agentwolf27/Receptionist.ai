"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";

export interface AuthFormState {
  error?: string;
}

function isNextRedirect(e: unknown): boolean {
  if (typeof e !== "object" || e === null || !("digest" in e)) return false;
  const d = (e as { digest?: unknown }).digest;
  return typeof d === "string" && d.startsWith("NEXT_REDIRECT");
}

function authActionErrorMessage(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021") {
      return "Database tables are missing. On the machine that targets this database, run: npx prisma migrate deploy";
    }
    if (e.code === "P2002") {
      return "An account with this email already exists.";
    }
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return "Could not connect to the database. Check DATABASE_URL / DIRECT_URL (and DB password) for this deployment.";
  }
  if (e instanceof Error) {
    const msg = e.message;
    if (/prepared statement/i.test(msg)) {
      return "DB pooling error: add ?pgbouncer=true (and sslmode=require) to DATABASE_URL for Supabase transaction pooler.";
    }
    if (process.env.NODE_ENV === "development") return msg;
  }
  return "Something went wrong. Please try again.";
}

export async function signupAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");
  try {
    const { error } = await auth.signUp({ email, password, name });
    if (error) return { error };
    revalidatePath("/");
    redirect("/app/business?onboarding=1");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    console.error("[signupAction]", e);
    return { error: authActionErrorMessage(e) };
  }
}

export async function loginAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    const { error } = await auth.signInWithPassword({ email, password });
    if (error) return { error };
    revalidatePath("/");
    redirect("/app");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    console.error("[loginAction]", e);
    return { error: authActionErrorMessage(e) };
  }
}

export async function logoutAction() {
  await auth.signOut();
  redirect("/");
}
