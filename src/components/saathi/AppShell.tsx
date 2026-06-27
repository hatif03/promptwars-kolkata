"use client";

import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { QuickExit } from "./QuickExit";
import { CrisisButton } from "./CrisisSheet";
import { useState } from "react";
import { CrisisSheet } from "./CrisisSheet";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showNav?: boolean;
  headerRight?: ReactNode;
};

export function AppShell({
  children,
  title,
  subtitle,
  showNav = true,
  headerRight,
}: AppShellProps) {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-saathi-bg pb-24">
      <header className="sticky top-0 z-30 border-b border-saathi-sage/10 bg-saathi-bg/95 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-saathi-sage">
              Saathi
            </p>
            {title && (
              <h1 className="text-xl font-semibold text-saathi-ink">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-saathi-muted">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <QuickExit />
            <CrisisButton onClick={() => setCrisisOpen(true)} />
            {headerRight}
          </div>
        </div>
      </header>

      <main className="px-5 py-4">{children}</main>

      {showNav && <BottomNav />}
      <CrisisSheet open={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  );
}
