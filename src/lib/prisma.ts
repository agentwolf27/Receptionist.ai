import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
if (dbUrl && !dbUrl.startsWith("postgres")) {
  throw new Error(
    "DATABASE_URL must be a PostgreSQL URL (postgresql:// or postgres://). This app uses Supabase/Postgres only — see .env.example."
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
