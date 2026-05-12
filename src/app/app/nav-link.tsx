"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarClock,
  Clock,
  HelpCircle,
  LayoutDashboard,
  MessageSquareText,
  PlaySquare,
  Settings2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/simulator", label: "AI Simulator", icon: PlaySquare },
  { href: "/app/conversations", label: "Conversations", icon: MessageSquareText },
  { href: "/app/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/app/business", label: "Business profile", icon: Building2 },
  { href: "/app/services", label: "Services", icon: Wrench },
  { href: "/app/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/app/hours", label: "Hours", icon: Clock },
  { href: "/app/settings", label: "AI settings", icon: Settings2 },
];

export function SidebarNav() {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {NAV.map((item) => (
        <SidebarLink key={item.href} {...item} />
      ))}
    </nav>
  );
}

export function BottomNav() {
  return (
    <nav className="border-t bg-muted/20 lg:hidden">
      <div className="grid grid-cols-5 text-xs">
        {NAV.slice(0, 5).map((item) => (
          <BottomLink key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}

function SidebarLink({ href, label, icon: Icon, exact }: NavItem) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function BottomLink({ href, label, icon: Icon, exact }: NavItem) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 px-2 py-3 text-[11px] font-medium",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label.split(" ")[0]}
    </Link>
  );
}
