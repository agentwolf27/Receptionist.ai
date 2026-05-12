import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  createSessionToken,
  readSession,
  setSessionCookie,
} from "./session";

/**
 * Auth client with the same shape as Supabase's `supabase.auth.*`.
 * Swap implementation for real Supabase by editing the methods below.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

async function toAuthUser(userId: string): Promise<AuthUser | null> {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  return u ? { id: u.id, email: u.email, name: u.name } : null;
}

export const auth = {
  async signUp({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { user: null, error: "Email and password required" };
    }
    if (password.length < 6) {
      return { user: null, error: "Password must be at least 6 characters" };
    }
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return { user: null, error: "An account with this email already exists" };
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: cleanEmail, passwordHash, name: name?.trim() || null },
    });
    const token = createSessionToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);
    return { user: { id: user.id, email: user.email, name: user.name }, error: null };
  },

  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) return { user: null, error: "Invalid email or password" };
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return { user: null, error: "Invalid email or password" };
    const token = createSessionToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);
    return { user: { id: user.id, email: user.email, name: user.name }, error: null };
  },

  async signOut(): Promise<void> {
    await clearSessionCookie();
  },

  async getUser(): Promise<AuthUser | null> {
    const session = await readSession();
    if (!session) return null;
    return toAuthUser(session.userId);
  },
};

export async function requireUser(): Promise<AuthUser> {
  const user = await auth.getUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
