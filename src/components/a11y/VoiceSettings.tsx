"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useSpeechOutput } from "@/hooks/useSpeechOutput";
import type { LanguagePref } from "@/lib/types";

type VoiceSettingsProps = {
  languagePref?: LanguagePref;
};

export function VoiceSettings({ languagePref = "en" }: VoiceSettingsProps) {
  const { preferences, updatePreferences, isSupported } = useSpeechOutput({
    languagePref,
  });

  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div>
          <p className="text-sm font-medium text-saathi-ink">Voice assistance</p>
          <p className="text-xs text-saathi-muted">
            Dictate messages and listen to Saathi&apos;s responses. Works best in Chrome or Edge.
          </p>
        </div>

        {!isSupported && (
          <p className="text-xs text-saathi-muted" role="status">
            Read-aloud is not supported in this browser.
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-saathi-ink">Read responses aloud</span>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.ttsEnabled}
            aria-label="Read responses aloud"
            disabled={!isSupported}
            onClick={() => updatePreferences({ ttsEnabled: !preferences.ttsEnabled })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              preferences.ttsEnabled
                ? "bg-saathi-sage text-white"
                : "bg-saathi-cream text-saathi-ink"
            }`}
          >
            {preferences.ttsEnabled ? "On" : "Off"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-saathi-ink">Auto-read new chat replies</span>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.autoRead}
            aria-label="Auto-read new chat replies"
            disabled={!isSupported || !preferences.ttsEnabled}
            onClick={() => updatePreferences({ autoRead: !preferences.autoRead })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              preferences.autoRead
                ? "bg-saathi-sage text-white"
                : "bg-saathi-cream text-saathi-ink"
            }`}
          >
            {preferences.autoRead ? "On" : "Off"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
