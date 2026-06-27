"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryStyle } from "@/lib/data/category-styles";
import type { CalmExercise } from "@/lib/data/calm-kit";

type ExercisePlayerProps = {
  exercise: CalmExercise;
};

export function ExercisePlayer({ exercise }: ExercisePlayerProps) {
  const router = useRouter();
  const style = getCategoryStyle(exercise.category);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveCompletion(helpfulRating: number) {
    setSaving(true);
    await fetch("/api/exercises/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: exercise.id,
        helpfulRating,
      }),
    });
    setSaving(false);
    setCompleted(true);
  }

  if (completed) {
    return (
      <Card className="text-center">
        <CardContent className="space-y-4 pt-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-saathi-sage" />
          <h2 className="text-xl font-semibold">Well done</h2>
          <p className="text-sm text-saathi-muted">
            Taking care of your mind is part of preparation.
          </p>
          <Button className="w-full" onClick={() => router.push("/home")}>
            Back to home
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step >= exercise.steps.length) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <h2 className="text-lg font-semibold">Did this help?</h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`h-10 w-10 rounded-full text-sm font-medium ${
                  rating === n
                    ? "bg-saathi-sage text-white"
                    : "bg-saathi-cream text-saathi-ink"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <Button
            className="w-full"
            disabled={!rating || saving}
            onClick={() => rating && saveCompletion(rating)}
          >
            Finish
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={`border-l-4 ${style.border} ${style.card}`}>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-saathi-sage">{style.label}</p>
          <p className="mt-1 text-sm text-saathi-muted">
            Step {step + 1} of {exercise.steps.length}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-saathi-ink">
            {exercise.steps[step]}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button className="flex-1" onClick={() => setStep(step + 1)}>
          {step === exercise.steps.length - 1 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
}
