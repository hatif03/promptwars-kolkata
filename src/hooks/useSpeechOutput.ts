"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguagePref } from "@/lib/types";
import { languageToSpeechLocale } from "@/lib/speech/speech-input";
import { getVoicePreferences, type VoicePreferences } from "@/lib/speech/voice-preferences";

export function isSpeechOutputSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export type UseSpeechOutputOptions = {
  languagePref?: LanguagePref;
};

export function useSpeechOutput({ languagePref = "en" }: UseSpeechOutputOptions = {}) {
  const [speaking, setSpeaking] = useState(false);
  const [preferences, setPreferences] = useState<VoicePreferences>(() =>
    typeof window !== "undefined" ? getVoicePreferences() : { ttsEnabled: true, autoRead: false }
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, options?: { force?: boolean }) => {
      if (!text.trim()) return;
      if (!isSpeechOutputSupported()) return;
      if (!options?.force && !preferences.ttsEnabled) return;

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageToSpeechLocale(languagePref);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [languagePref, preferences.ttsEnabled, stopSpeaking]
  );

  const updatePreferences = useCallback((next: Partial<VoicePreferences>) => {
    setPreferences((prev) => {
      const merged = { ...prev, ...next };
      if (typeof window !== "undefined") {
        localStorage.setItem("saathi-voice-prefs", JSON.stringify(merged));
      }
      return merged;
    });
  }, []);

  useEffect(() => {
    return () => {
      utteranceRef.current = null;
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    speak,
    stopSpeaking,
    speaking,
    isSupported: isSpeechOutputSupported(),
    preferences,
    updatePreferences,
  };
}
