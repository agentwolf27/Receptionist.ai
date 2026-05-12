import { redirect } from "next/navigation";
import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "../(auth)/actions";
import { BottomNav, SidebarNav } from "./nav-link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth.getUser();
  if (!user) redirect("/login");

  const business = await prisma.business.findUnique({
    where: { userId: user.id },
    select: { id: true, name: true },
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r bg-muted/20 lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </span>
          Receptionist.ai
        </div>
        <SidebarNav />
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <Avatar className="h-9 w-9 bg-primary/10 text-primary">
              <span className="flex h-full w-full items-center justify-center text-sm font-medium">
                {(user.name ?? user.email).slice(0, 1).toUpperCase()}
              </span>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-6 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/app" className="flex items-center gap-2 font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-3.5 w-3.5" />
              </span>
              Receptionist.ai
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {business ? (
              <span className="hidden items-center gap-2 text-muted-foreground sm:flex">
                <Sparkles className="h-3.5 w-3.5" />
                {business.name}
              </span>
            ) : (
              <Link
                href="/app/business"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Finish setting up your business →
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">{children}</main>

        <BottomNav />
      </div>
    </div>
  );
}
