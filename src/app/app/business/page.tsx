import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessForm } from "./business-form";

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const user = await requireUser();
  const { onboarding } = await searchParams;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        {onboarding ? (
          <Badge variant="secondary" className="mb-3 gap-1">
            <Sparkles className="h-3 w-3" />
            Step 1 of 4
          </Badge>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">Business profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The AI receptionist uses this information to introduce itself and answer
          questions. Nothing here is sent to any third-party until you wire one up.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tell us about your business</CardTitle>
          <CardDescription>
            All fields are editable any time. The greeting is what the AI says first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessForm
            initial={
              business
                ? {
                    name: business.name,
                    industry: business.industry,
                    description: business.description,
                    phone: business.phone,
                    email: business.email,
                    address: business.address,
                    timezone: business.timezone,
                    greeting: business.greeting,
                  }
                : null
            }
            isNew={!business}
          />
        </CardContent>
      </Card>
    </div>
  );
}
