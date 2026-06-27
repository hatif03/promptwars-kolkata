"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickExit() {
  function handleQuickExit() {
    window.location.href = "https://www.google.com";
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickExit}
      className="text-saathi-muted hover:text-saathi-ink"
      title="Quick exit to a neutral site"
    >
      <LogOut className="h-4 w-4" />
      Quick exit
    </Button>
  );
}
