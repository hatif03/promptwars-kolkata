"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wind, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/calm-kit", label: "Calm Kit", icon: Wind },
  { href: "/companion", label: "Saathi", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-saathi-border bg-saathi-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/home" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-saathi-sage text-white shadow-sm"
                  : "text-saathi-muted hover:bg-saathi-sage-light hover:text-saathi-sage-dark"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
