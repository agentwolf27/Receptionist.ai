import { getCurrentBusinessOrRedirect } from "@/lib/data/business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const business = await getCurrentBusinessOrRedirect();
  const autoPrompt = buildSystemPrompt({ ...business, aiConfig: { ...business.aiConfig!, customPrompt: null } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI receptionist settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fine-tune your AI receptionist&apos;s voice, behavior, and escalation rules.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personality & behavior</CardTitle>
          <CardDescription>
            Set the voice. Leave the custom prompt blank to use the auto-generated one
            based on your business profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            config={business.aiConfig ?? {
              voice: "friendly",
              customPrompt: null,
              escalationPhone: null,
              escalationEmail: null,
              model: "mock-llm-v1",
              temperature: 0.7,
            }}
            autoPrompt={autoPrompt}
          />
        </CardContent>
      </Card>
    </div>
  );
}
