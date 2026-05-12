import Link from "next/link";
import { CheckCircle2, MessageSquare, HelpCircle } from "lucide-react";
import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WelcomePage() {
  const business = await getCurrentBusinessOrRedirect();
  // Flip the onboarding flag the first time someone lands here. Idempotent
  // so refreshes are harmless. We can't call revalidatePath() during render,
  // and don't need to — /app is dynamic and re-reads onboardingCompleted on
  // every request.
  await prisma.aIConfig.upsert({
    where: { businessId: business.id },
    update: { onboardingCompleted: true },
    create: { businessId: business.id, onboardingCompleted: true },
  });

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        You&apos;re ready, {business.name}.
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Your AI receptionist knows your services, hours, and FAQs. Take it for
        a test drive — every booking it makes is real.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/app/simulator">
            <MessageSquare className="mr-2 h-4 w-4" />
            Try the simulator
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/app/faqs">
            <HelpCircle className="mr-2 h-4 w-4" />
            Add FAQs first
          </Link>
        </Button>
      </div>

      <Card className="mt-10 w-full text-left">
        <CardHeader>
          <CardTitle className="text-base">What happens next</CardTitle>
          <CardDescription>
            Optional next steps to make your receptionist sharper.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <Link
            href="/app/services"
            className="rounded-md border p-3 hover:bg-muted/40"
          >
            <div className="font-medium">Add services</div>
            <div className="text-muted-foreground">
              Prices and durations the AI can quote.
            </div>
          </Link>
          <Link
            href="/app/faqs"
            className="rounded-md border p-3 hover:bg-muted/40"
          >
            <div className="font-medium">Capture FAQs</div>
            <div className="text-muted-foreground">
              The AI will answer in your voice.
            </div>
          </Link>
          <Link
            href="/app/settings"
            className="rounded-md border p-3 hover:bg-muted/40"
          >
            <div className="font-medium">Tune the prompt</div>
            <div className="text-muted-foreground">
              Override tone and behavior.
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
