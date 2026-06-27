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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-saathi-sage/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/home" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs transition-colors",
                active
                  ? "bg-saathi-sage/15 text-saathi-sage-dark"
                  : "text-saathi-muted hover:text-saathi-ink"
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
