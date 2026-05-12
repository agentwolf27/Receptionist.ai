import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
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
        <blockquote className="max-w-md text-2xl font-medium leading-snug">
          “We picked up 17 new appointments the first weekend — all after-hours calls
          that would have gone to voicemail.”
          <footer className="mt-4 text-base font-normal text-muted-foreground">
            — Jordan M., owner of Riverbank Auto
          </footer>
        </blockquote>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your dashboard
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
