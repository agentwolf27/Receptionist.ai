"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveAIConfigAction } from "../actions";

interface SettingsFormProps {
  config: {
    voice: string;
    customPrompt: string | null;
    escalationPhone: string | null;
    escalationEmail: string | null;
    model: string;
    temperature: number;
  };
  autoPrompt: string;
}

export function SettingsForm({ config, autoPrompt }: SettingsFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [useCustom, setUseCustom] = useState(!!config.customPrompt);
  // Controlled so the live preview mirrors what we'd actually send.
  const [customPrompt, setCustomPrompt] = useState(config.customPrompt ?? autoPrompt);
  const effectivePrompt = useCustom ? customPrompt : autoPrompt;

  function resetToAuto() {
    setUseCustom(false);
    setCustomPrompt(autoPrompt);
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      if (!useCustom) formData.set("customPrompt", "");
      await saveAIConfigAction(formData);
      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Couldn't save settings");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <select
            id="voice"
            name="voice"
            defaultValue={config.voice}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="playful">Playful</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            name="model"
            defaultValue={config.model}
            placeholder="mock-llm-v1"
          />
          <p className="text-xs text-muted-foreground">
            Currently using the built-in mock. Add an OPENAI_API_KEY to switch.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            name="temperature"
            type="number"
            min={0}
            max={2}
            step={0.1}
            defaultValue={config.temperature}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="escalationPhone">Escalation phone</Label>
          <Input
            id="escalationPhone"
            name="escalationPhone"
            defaultValue={config.escalationPhone ?? ""}
            placeholder="(555) 555-0142"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="escalationEmail">Escalation email</Label>
          <Input
            id="escalationEmail"
            name="escalationEmail"
            type="email"
            defaultValue={config.escalationEmail ?? ""}
            placeholder="owner@business.com"
          />
        </div>
      </div>

      <div className="space-y-3 border-t pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label htmlFor="customPrompt" className="text-base">
              Custom system prompt
            </Label>
            <p className="text-xs text-muted-foreground">
              Override the auto-generated prompt entirely. The right side always
              shows what we&apos;ll actually send to the AI.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetToAuto}
              disabled={!useCustom && customPrompt === autoPrompt}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset to auto-generated
            </Button>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
              />
              Use custom
            </label>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {useCustom ? "Editor" : "Auto-generated (read-only)"}
            </p>
            <Textarea
              id="customPrompt"
              name="customPrompt"
              rows={14}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={!useCustom}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Live preview · {effectivePrompt.length} chars
            </p>
            <pre className="h-[calc(14rem*1.25)] overflow-auto whitespace-pre-wrap rounded-md border bg-muted p-3 text-[11px] leading-relaxed">
              {effectivePrompt}
            </pre>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
