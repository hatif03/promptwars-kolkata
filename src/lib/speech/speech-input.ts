import type { LanguagePref } from "@/lib/types";

export function languageToSpeechLocale(languagePref: LanguagePref): string {
  switch (languagePref) {
    case "hi":
    case "hinglish":
      return "hi-IN";
    default:
      return "en-IN";
  }
}

export type SpeechInputStatus = "idle" | "listening" | "error" | "unsupported";

export function isSpeechInputSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}
