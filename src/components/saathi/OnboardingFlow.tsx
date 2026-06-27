"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EXAM_OPTIONS, type ExamType, type LanguagePref } from "@/lib/types";
import { JournalEditor } from "./JournalEditor";
import { AI_DISCLAIMER } from "@/lib/safety/crisis";

type Step = "welcome" | "profile" | "journal" | "done";

const STEP_ORDER: Step[] = ["welcome", "profile", "journal", "done"];
const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  profile: "Profile",
  journal: "First journal",
  done: "Complete",
};

export function OnboardingFlow() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("welcome");
  const [displayName, setDisplayName] = useState("");
  const [examType, setExamType] = useState<ExamType>("NEET");
  const [languagePref, setLanguagePref] = useState<LanguagePref>("hinglish");
  const [daysToExam, setDaysToExam] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveProfile() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        display_name: displayName || "Student",
        exam_type: examType,
        language_pref: languagePref,
        days_to_exam: daysToExam ? parseInt(daysToExam, 10) : null,
      })
      .eq("id", user.id);

    setLoading(false);
    setStep("journal");
  }

  async function completeOnboarding() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", user.id);

    setLoading(false);
    router.push("/home");
    router.refresh();
  }

  if (step === "welcome") {
    return (
      <Card className="border-saathi-sage/25 bg-gradient-to-br from-saathi-lavender/30 to-saathi-cream">
        <CardContent className="space-y-6 pt-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-saathi-ink">Hi, I&apos;m Saathi</h1>
            <p className="mt-2 text-sm text-saathi-muted">
              Exam prep ka saathi — here to listen, not to judge.
            </p>
            <p className="mt-1 text-xs text-saathi-muted italic">
              Sunno. Samjho. Saans lo.
            </p>
          </div>
          <p className="text-sm leading-relaxed text-saathi-ink">
            I&apos;m an AI companion for students preparing for NEET, JEE, and other
            high-stakes exams. I&apos;m not a therapist — just someone who&apos;s here
            when you need to vent, reflect, or breathe.
          </p>
          <Button className="w-full" onClick={() => setStep("profile")}>
            Let&apos;s begin
          </Button>
          <p className="text-xs text-saathi-muted">{AI_DISCLAIMER}</p>
        </CardContent>
      </Card>
    );
  }

  if (step === "profile") {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <nav aria-label="Onboarding progress">
            <ol className="mb-4 flex gap-2 text-xs">
              {STEP_ORDER.map((s) => (
                <li
                  key={s}
                  aria-current={step === s ? "step" : undefined}
                  className={
                    step === s
                      ? "font-medium text-saathi-sage-dark"
                      : "text-saathi-muted"
                  }
                >
                  {STEP_LABELS[s]}
                </li>
              ))}
            </ol>
          </nav>
          <h2 className="text-lg font-semibold text-saathi-ink">Tell me about you</h2>
          <p className="text-sm text-saathi-muted">No long forms — just the basics.</p>

          <div>
            <label htmlFor="onboarding-name" className="mb-1 block text-sm text-saathi-ink">
              What should I call you?
            </label>
            <Input
              id="onboarding-name"
              placeholder="Aanya"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-saathi-ink">Preparing for</label>
            <div className="flex flex-wrap gap-2">
              {EXAM_OPTIONS.map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => setExamType(exam)}
                  aria-pressed={examType === exam}
                  aria-label={`Preparing for ${exam}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    examType === exam
                      ? "bg-saathi-sage text-white"
                      : "bg-saathi-cream text-saathi-ink"
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-saathi-ink">Language</label>
            <div className="flex gap-2">
              {(["en", "hi", "hinglish"] as LanguagePref[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguagePref(lang)}
                  aria-pressed={languagePref === lang}
                  aria-label={`Language ${lang}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                    languagePref === lang
                      ? "bg-saathi-sage text-white"
                      : "bg-saathi-cream text-saathi-ink"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="onboarding-days" className="mb-1 block text-sm text-saathi-ink">
              Days until exam (optional)
            </label>
            <Input
              id="onboarding-days"
              type="number"
              placeholder="120"
              value={daysToExam}
              onChange={(e) => setDaysToExam(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={saveProfile}
            disabled={loading}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "journal") {
    return (
      <div className="space-y-4">
        <Card className="bg-saathi-lavender/20">
          <CardContent className="pt-5">
            <h2 className="font-semibold text-saathi-ink">
              Your first entry, {displayName || "friend"}
            </h2>
            <p className="mt-1 text-sm text-saathi-muted">
              How are you really doing? I&apos;ll respond when you&apos;re done writing.
            </p>
          </CardContent>
        </Card>
        <JournalEditor compact onSaved={() => setStep("done")} />
      </div>
    );
  }

  return (
    <Card className="text-center">
      <CardContent className="space-y-4 pt-8">
        <h2 className="text-xl font-semibold text-saathi-ink">You&apos;re all set</h2>
        <p className="text-sm text-saathi-muted">
          Saathi is here whenever you need — 2 AM panic, post-mock stress, or
          just a quiet moment.
        </p>
        <Button className="w-full" onClick={completeOnboarding} disabled={loading}>
          Go to home
        </Button>
      </CardContent>
    </Card>
  );
}
