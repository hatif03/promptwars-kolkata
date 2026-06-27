"use client";

import { useSyncExternalStore } from "react";
import { isSpeechInputSupported } from "@/lib/speech/speech-input";

function noopSubscribe() {
  return () => {};
}

/** SSR-safe speech input support — false on server, real value after hydration. */
export function useSpeechInputSupported(): boolean {
  return useSyncExternalStore(noopSubscribe, isSpeechInputSupported, () => false);
}

/** SSR-safe speech output support — false on server, real value after hydration. */
export function useSpeechOutputSupported(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false
  );
}
