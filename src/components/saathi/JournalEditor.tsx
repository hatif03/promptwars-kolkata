"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Mic, MicOff, Volume2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LiveRegion } from "@/components/a11y/LiveRegion";
import { MoodStrip } from "./MoodStrip";
import type { JournalAnalysis, MoodType, LanguagePref } from "@/lib/types";
import { getExerciseById, recommendExercise } from "@/lib/data/calm-kit";
import { AI_DISCLAIMER } from "@/lib/safety/crisis";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { useSpeechOutput } from "@/hooks/useSpeechOutput";
import { useCrisisPrecheck } from "@/hooks/useCrisisPrecheck";
import { createClient } from "@/lib/supabase/client";

type JournalEditorProps = {
  onSaved?: () => void;
  compact?: boolean;
  mood?: MoodType | null;
  tags?: string[];
};

function dispatchCrisisEvent() {
  window.dispatchEvent(new CustomEvent("saathi:crisis-detected"));
}

export function JournalEditor({
  onSaved,
  compact = false,
  mood: externalMood,
  tags: externalTags,
}: JournalEditorProps) {
  const [content, setContent] = useState("");
  const [internalMood, setInternalMood] = useState<MoodType | null>(null);
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [languagePref, setLanguagePref] = useState<LanguagePref>("hinglish");
  const baseInputRef = useRef("");

  const mood = externalMood !== undefined ? externalMood : internalMood;
  const tags = externalTags !== undefined ? externalTags : internalTags;

  const { speak, isSupported: ttsSupported } = useSpeechOutput({ languagePref });

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setContent((prev) => (prev ? `${prev} ${text}` : text).trim());
      baseInputRef.current = "";
    } else {
      setContent(baseInputRef.current ? `${baseInputRef.current} ${text}` : text);
    }
  }, []);

  const speechInput = useSpeechInput({
    languagePref,
    onTranscript: handleTranscript,
  });

  const { checkText } = useCrisisPrecheck({
    onCrisisDetected: dispatchCrisisEvent,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("language_pref")
          .eq("id", user.id)
          .single();
        if (profile?.language_pref) {
          setLanguagePref(profile.language_pref as LanguagePref);
        }
      } catch {
        // Profile language optional for journal
      }
    }
    loadProfile();
  }, []);

  function handleContentChange(value: string) {
    setContent(value);
    baseInputRef.current = value;
    checkText(value);
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    speechInput.stopListening();
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setLiveMessage("Saathi is reflecting on your entry");

    try {
      const res = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mood, tags }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setAnalysis(data.analysis);
      setIsCrisis(data.isCrisis);
      setContent("");
      baseInputRef.current = "";
      setLiveMessage("Saathi shared a reflection on your journal entry");
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLiveMessage("");
    } finally {
      setLoading(false);
    }
  }

  const aiExercise = analysis ? getExerciseById(analysis.recommendedExerciseId) : null;
  const ruleExercise =
    analysis?.themes?.length ? recommendExercise(analysis.themes, tags) : null;
  const exercise = aiExercise ?? ruleExercise;

  return (
    <div className="space-y-4">
      <LiveRegion message={liveMessage} />

      {!compact && (
        <MoodStrip
          onMoodSelect={(m, t) => {
            setInternalMood(m);
            setInternalTags(t);
          }}
        />
      )}

      <div>
        <label htmlFor="journal" className="mb-2 block text-sm font-medium text-saathi-ink">
          How are you really doing today?
        </label>
        <Textarea
          id="journal"
          placeholder="Write freely — Hinglish, fragments, anything. Saathi is listening..."
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") speechInput.stopListening();
          }}
          className="min-h-[140px] bg-saathi-cream/30"
          aria-busy={loading}
        />
        {!speechInput.isSupported && (
          <p className="mt-1 text-xs text-saathi-muted" role="status">
            Voice input works best in Chrome or Edge. You can still type.
          </p>
        )}
        {speechInput.errorMessage && (
          <p className="mt-1 text-xs text-saathi-destructive" role="alert">
            {speechInput.errorMessage}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {speechInput.isSupported && (
          <Button
            type="button"
            variant={speechInput.isListening ? "default" : "outline"}
            onClick={() => {
              if (!speechInput.isListening) baseInputRef.current = content;
              speechInput.toggleListening();
            }}
            aria-label={speechInput.isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={speechInput.isListening}
          >
            {speechInput.isListening ? (
              <MicOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mic className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="flex-1"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saathi is reflecting...
            </>
          ) : (
            "Save & reflect"
          )}
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-saathi-destructive/20 bg-saathi-destructive/5 p-3 text-sm text-saathi-destructive"
        >
          {error}
        </p>
      )}

      {analysis && (
        <Card
          className={
            isCrisis ? "border-saathi-crisis/30 bg-saathi-destructive/5" : "bg-saathi-lavender/25"
          }
        >
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-saathi-sage-dark">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">Saathi&apos;s reflection</span>
              </div>
              {ttsSupported && !isCrisis && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Listen to reflection"
                  onClick={() => speak(analysis.reflection)}
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Listen
                </Button>
              )}
            </div>
            <p className="text-sm leading-relaxed text-saathi-ink">{analysis.reflection}</p>
            {analysis.themes?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full bg-white/80 px-3 py-1 text-xs text-saathi-muted"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}
            {analysis.microStep && (
              <p className="rounded-2xl bg-white/60 p-3 text-sm text-saathi-ink">
                <span className="font-medium">Tonight: </span>
                {analysis.microStep}
              </p>
            )}
            {analysis.invitationQuestion && (
              <p className="text-sm italic text-saathi-muted">{analysis.invitationQuestion}</p>
            )}
            {exercise && !isCrisis && (
              <Card className="border-saathi-sage/30 bg-saathi-sage-light/40">
                <CardContent className="space-y-2 p-4">
                  <p className="text-sm font-medium text-saathi-ink">
                    Recommended for you: {exercise.title}
                  </p>
                  <p className="text-xs text-saathi-muted">
                    {exercise.duration} min · matched to your themes
                  </p>
                  <Link href={`/calm-kit/${exercise.id}`}>
                    <Button variant="secondary" className="w-full">
                      Try {exercise.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            <p className="text-xs text-saathi-muted">{AI_DISCLAIMER}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
