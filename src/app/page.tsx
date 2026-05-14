"use client";

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
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoExpectationsSection } from "@/components/marketing/demo-expectations-section";
import { DemoSiteBanner } from "@/components/marketing/demo-site-banner";
import { LandingScrollShell } from "@/components/marketing/landing-scroll-shell";

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function LandingPage() {
  return (
    <LandingScrollShell>
      <div className="sticky top-0 z-50 border-b border-border/40 bg-background/70 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
        <DemoSiteBanner />
        <header className="w-full">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-90">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md">
                <Bot className="h-4 w-4" />
              </span>
              Receptionist<span className="text-muted-foreground">.ai</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#how" className="transition-colors hover:text-foreground">
                How it works
              </a>
              <a href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </a>
              <a
                href="#demo-expectations"
                className="transition-colors hover:text-amber-700 dark:hover:text-amber-300"
              >
                Demo notice
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
      </div>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge variant="secondary" className="mb-4 gap-1 shadow-sm">
                <Sparkles className="h-3 w-3" />
                Preview — AI back office for local businesses
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-gradient pb-2">
                The AI receptionist that pays for itself by the second booking.
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Answer every call, every chat, every after-hours inquiry. Receptionist.ai books
                appointments, answers FAQs, and sends confirmations — without hiring another
                front-desk person.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="shadow-lg transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0">
                  <Link href="/signup">Start free in 60 seconds</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="backdrop-blur-sm">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Demo mode: mock providers by default — add your own keys when you&apos;re ready.
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-emerald-500/10 to-violet-500/15 blur-2xl motion-safe:animate-pulse motion-reduce:animate-none" />
              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    sample transcript — Maple Dental
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <ChatBubble role="assistant">
                    Hi! Thanks for calling Maple Dental — how can I help today?
                  </ChatBubble>
                  <ChatBubble role="user">
                    I&apos;d like to book a cleaning, tomorrow if possible.
                  </ChatBubble>
                  <ChatBubble role="assistant">Of course! Could I get your name?</ChatBubble>
                  <ChatBubble role="user">Alex Rivera, 555-0142.</ChatBubble>
                  <ChatBubble role="assistant">
                    You&apos;re booked for a cleaning tomorrow at 2pm, Alex. Confirmation just sent
                    to 555-0142.
                  </ChatBubble>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gradient pb-2">The front desk that never sleeps</h2>
            <p className="mt-3 text-muted-foreground">
              Everything a small business needs to capture every lead and book every appointment —
              without lifting the phone.
            </p>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-12 grid gap-6 sm:grid-cols-2"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group glass-panel rounded-xl p-6 transition-colors duration-300 hover:border-primary/30"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                  <f.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section id="how" className="border-t border-border/50 bg-muted/25 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <h2 className="text-3xl font-semibold tracking-tight text-gradient pb-2">How it works</h2>
            <motion.ol 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mt-8 grid gap-6 md:grid-cols-3"
            >
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
                <motion.li
                  key={s.step}
                  variants={itemVariants}
                  className="glass-panel rounded-xl p-6"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-lg">
                    {s.step}
                  </span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gradient pb-2">Simple, honest pricing</h2>
          <p className="mt-3 text-muted-foreground">
            Start free with mock providers. Bring your own Twilio + OpenAI keys and pay only what
            the providers charge. We&apos;ll add hosted plans later.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 shadow-md transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
          >
            <Link href="/signup">Create your free account</Link>
          </Button>
        </section>

        <DemoExpectationsSection />
      </main>

      <footer className="border-t border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Receptionist.ai</span>
          <span className="max-w-md text-xs sm:text-right">
            Built with Next.js &amp; Prisma. This deployment is a{" "}
            <strong className="text-foreground">demo / preview</strong> — see{" "}
            <a href="#demo-expectations" className="underline underline-offset-2">
              expectations
            </a>{" "}
            before sharing widely.
          </span>
        </div>
      </footer>
    </LandingScrollShell>
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
          ? "ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground shadow-md"
          : "mr-auto max-w-[80%] rounded-2xl rounded-bl-sm bg-muted/90 px-3 py-2 text-foreground shadow-sm backdrop-blur-sm"
      }
    >
      {children}
    </div>
  );
}
