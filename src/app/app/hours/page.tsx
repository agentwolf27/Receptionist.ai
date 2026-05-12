import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoursForm } from "./hours-form";

interface Props {
  searchParams: Promise<{ onboarding?: string }>;
}

export default async function HoursPage({ searchParams }: Props) {
  const business = await getCurrentBusinessOrRedirect();
  const { onboarding } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business hours</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The AI only books appointments inside these hours.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>Times are in {business.timezone}.</CardDescription>
        </CardHeader>
        <CardContent>
          <HoursForm
            isOnboarding={onboarding === "1"}
            initial={business.hours.map((h) => ({
              dayOfWeek: h.dayOfWeek,
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: h.isClosed,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
