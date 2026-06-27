"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CALM_KIT_EXERCISES } from "@/lib/data/calm-kit";

export function CalmKitList() {
  return (
    <div className="space-y-3">
      {CALM_KIT_EXERCISES.map((exercise) => (
        <Link key={exercise.id} href={`/calm-kit/${exercise.id}`}>
          <Card className="transition-colors hover:bg-saathi-cream/40">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-saathi-ink">{exercise.title}</p>
                <p className="text-xs text-saathi-muted">{exercise.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {exercise.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-saathi-lavender/30 px-2 py-0.5 text-[10px] text-saathi-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-saathi-sage-dark">
                <Clock className="h-4 w-4" />
                {exercise.duration}m
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
