"use client";

import Link from "next/link";
import { Clock, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CALM_KIT_EXERCISES } from "@/lib/data/calm-kit";
import { getCategoryStyle } from "@/lib/data/category-styles";
import { cn } from "@/lib/utils";

export function CalmKitList() {
  return (
    <div className="space-y-3">
      <Card className="border-saathi-sage/30 bg-gradient-to-r from-saathi-sage-light to-saathi-lavender/40">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-saathi-sage text-white">
            <Wind className="h-5 w-5" />
          </div>
          <p className="text-sm text-saathi-ink">
            Pick an exercise below — each one takes just a few minutes.
          </p>
        </CardContent>
      </Card>

      {CALM_KIT_EXERCISES.map((exercise) => {
        const style = getCategoryStyle(exercise.category);

        return (
          <Link key={exercise.id} href={`/calm-kit/${exercise.id}`}>
            <Card
              className={cn(
                "border-l-4 transition-colors",
                style.border,
                style.card
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold uppercase",
                    style.icon
                  )}
                >
                  {exercise.duration}m
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-saathi-ink">{exercise.title}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        style.tag
                      )}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-saathi-muted">
                    {exercise.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {exercise.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          style.tag
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-saathi-sage">
                  <Clock className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
