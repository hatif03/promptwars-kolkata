"use client";

import { Phone, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CRISIS_RESOURCES, AI_DISCLAIMER } from "@/lib/safety/crisis";

type CrisisSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function CrisisSheet({ open, onClose }: CrisisSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-labelledby="crisis-title"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2 text-saathi-crisis">
            <AlertTriangle className="h-5 w-5" />
            <h2 id="crisis-title" className="text-lg font-semibold">
              You deserve support
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-saathi-cream"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-saathi-muted">
          If you&apos;re in distress, please reach out. These helplines are free
          and confidential.
        </p>

        <div className="space-y-3">
          {CRISIS_RESOURCES.map((resource) => (
            <a
              key={resource.number}
              href={resource.href}
              className="flex items-center justify-between rounded-2xl border border-saathi-sage/15 bg-saathi-cream/50 p-4 transition-colors hover:bg-saathi-cream"
            >
              <div>
                <p className="font-medium text-saathi-ink">{resource.name}</p>
                <p className="text-xs text-saathi-muted">{resource.description}</p>
              </div>
              <div className="flex items-center gap-2 font-semibold text-saathi-sage-dark">
                <Phone className="h-4 w-4" />
                {resource.number}
              </div>
            </a>
          ))}
        </div>

        <p className="mt-4 text-xs text-saathi-muted">{AI_DISCLAIMER}</p>
      </div>
    </div>
  );
}

export function CrisisButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="crisis"
      size="sm"
      onClick={onClick}
      className={className}
    >
      <Phone className="h-4 w-4" />
      Get help now
    </Button>
  );
}
