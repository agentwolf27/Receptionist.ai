import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const user = await auth.getUser();
  if (user) redirect("/app");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-muted/30 p-12">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </span>
          Receptionist.ai
        </Link>
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold leading-snug">
            Stop losing customers to voicemail.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>• 5-minute setup with a guided onboarding</li>
            <li>• Mock providers built-in — try before you wire anything up</li>
            <li>• Swap to real Twilio / Vapi / OpenAI when ready</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start your free trial — no card required
          </p>
          <div className="mt-8">
            <SignupForm />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
