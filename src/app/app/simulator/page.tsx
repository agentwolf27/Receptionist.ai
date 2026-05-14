import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { isUsingGroq } from "@/lib/providers/llm";
import { Simulator } from "./simulator";
import { CollapsiblePrompt } from "./collapsible-prompt";

export default async function SimulatorPage() {
  const business = await getCurrentBusinessOrRedirect();
  const systemPrompt = buildSystemPrompt(business);
  const greeting =
    business.greeting ?? `Hi! Thanks for contacting ${business.name}. How can I help you today?`;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>AI Receptionist Simulator</CardTitle>
            <CardDescription>
              Test your receptionist exactly as a real customer would. Bookings are saved to your
              dashboard for this preview account — not for real patient or production use.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {isUsingGroq() ? "Groq" : "Mock LLM"}
          </Badge>
        </CardHeader>
        <CardContent className="flex-1">
          <Simulator greeting={greeting} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Try saying</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• &ldquo;What are your hours?&rdquo;</p>
            <p>• &ldquo;Do you accept walk-ins?&rdquo;</p>
            <p>• &ldquo;How much does a cleaning cost?&rdquo;</p>
            <p>• &ldquo;Book me for a cleaning tomorrow at 2pm. My name is Alex Rivera, 555-0142.&rdquo;</p>
            <p>• &ldquo;Can I speak to a manager?&rdquo; (triggers escalation)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generated system prompt</CardTitle>
            <CardDescription>
              Sent to the LLM each turn.{" "}
              <Link href="/app/settings" className="underline">
                Override in settings
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CollapsiblePrompt systemPrompt={systemPrompt} />
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link href="/app/settings">Edit AI settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
