import "server-only";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/auth";

const businessInclude = {
  hours: true,
  services: { orderBy: { createdAt: "asc" } },
  appointmentTypes: { orderBy: { createdAt: "asc" } },
  faqs: { orderBy: { order: "asc" } },
  aiConfig: true,
} satisfies Prisma.BusinessInclude;

export type BusinessFull = Prisma.BusinessGetPayload<{ include: typeof businessInclude }>;

export async function getCurrentBusiness(): Promise<BusinessFull | null> {
  const user = await requireUser();
  return prisma.business.findUnique({
    where: { userId: user.id },
    include: businessInclude,
  });
}

export async function getCurrentBusinessOrRedirect(): Promise<BusinessFull> {
  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/app/business?onboarding=1");
  }
  return business;
}
