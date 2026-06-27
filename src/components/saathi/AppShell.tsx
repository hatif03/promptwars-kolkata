"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "./BottomNav";
import { QuickExit } from "./QuickExit";
import { CrisisButton, CrisisSheet } from "./CrisisSheet";

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

  useEffect(() => {
    function onCrisisDetected() {
      setCrisisOpen(true);
    }
    window.addEventListener("saathi:crisis-detected", onCrisisDetected);
    return () => window.removeEventListener("saathi:crisis-detected", onCrisisDetected);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-saathi-bg pb-24">
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-2xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-saathi-ink focus:shadow-md"
      >
        Skip to main content
      </Link>
      <header className="sticky top-0 z-30 border-b border-saathi-border bg-gradient-to-r from-saathi-sage-light via-saathi-surface to-saathi-lavender/30 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-saathi-sage">
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

      <main id="main-content" className="px-5 py-4" tabIndex={-1}>
        {children}
      </main>

      {showNav && <BottomNav />}
      <CrisisSheet open={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  );
}
