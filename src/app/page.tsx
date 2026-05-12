import Link from "next/link";
import {
  Bot,
  CalendarCheck,
  MessageSquare,
  PhoneIncoming,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: PhoneIncoming,
    title: "Never miss a call",
    body: "Your AI receptionist answers 24/7 — greeting customers, answering questions, and booking appointments while you focus on the work.",
  },
  {
    icon: CalendarCheck,
    title: "Books appointments end-to-end",
    body: "Collects name, service, date, and contact info. Checks availability. Creates the booking. Sends the confirmation. Done.",
  },
  {
    icon: MessageSquare,
    title: "Always on brand",
    body: "Trained only on your services, hours, and FAQs. No hallucinations. Escalates to a human when it isn't sure.",
  },
  {
    icon: Workflow,
    title: "Plug in real providers later",
    body: "Mocked Twilio, Vapi, OpenAI, and calendar adapters out of the box. Swap with one config flip when you're ready to go live.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            Receptionist<span className="text-muted-foreground">.ai</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <Badge variant="secondary" className="mb-4 gap-1">
                <Sparkles className="h-3 w-3" />
                New — AI back office for local businesses
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                The AI receptionist that pays for itself by the second booking.
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Answer every call, every chat, every after-hours inquiry. Receptionist.ai
                books appointments, answers FAQs, and sends confirmations — without
                hiring another front-desk person.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">Start free in 60 seconds</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                No credit card. Runs locally with mock providers — swap to Twilio / OpenAI when ready.
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-400/10 blur-2xl" />
              <div className="rounded-2xl border bg-card p-4 shadow-xl">
                <div className="flex items-center gap-2 border-b pb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    live transcript — Maple Dental
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <ChatBubble role="assistant">
                    Hi! Thanks for calling Maple Dental — how can I help today?
                  </ChatBubble>
                  <ChatBubble role="user">
                    I&apos;d like to book a cleaning, tomorrow if possible.
                  </ChatBubble>
                  <ChatBubble role="assistant">
                    Of course! Could I get your name?
                  </ChatBubble>
                  <ChatBubble role="user">Alex Rivera, 555-0142.</ChatBubble>
                  <ChatBubble role="assistant">
                    You&apos;re booked for a cleaning tomorrow at 2pm, Alex. Confirmation
                    just sent to 555-0142.
                  </ChatBubble>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              The front desk that never sleeps
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything a small business needs to capture every lead and book every
              appointment — without lifting the phone.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Set up your business",
                  body: "Tell us about your services, hours, and FAQs in under five minutes.",
                },
                {
                  step: "2",
                  title: "We build the receptionist",
                  body: "We generate a tailored AI prompt from your data — no engineering required.",
                },
                {
                  step: "3",
                  title: "Watch the bookings roll in",
                  body: "Test in the simulator, then go live with Twilio / Vapi. Track every conversation and booking from the dashboard.",
                },
              ].map((s) => (
                <li key={s.step} className="rounded-xl border bg-card p-6">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {s.step}
                  </span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start free with mock providers. Bring your own Twilio + OpenAI keys and pay
            only what the providers charge. We&apos;ll add hosted plans later.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/signup">Create your free account</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Receptionist.ai</span>
          <span>Built with Next.js, Prisma, and a lot of espresso.</span>
        </div>
      </footer>
    </div>
  );
}

function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        role === "user"
          ? "ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground"
          : "mr-auto max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-foreground"
      }
    >
      {children}
    </div>
  );
}
