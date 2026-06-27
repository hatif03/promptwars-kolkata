"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguagePref } from "@/lib/types";
import {
  isSpeechInputSupported,
  languageToSpeechLocale,
  type SpeechInputStatus,
} from "@/lib/speech/speech-input";
import { useSpeechInputSupported } from "@/hooks/useBrowserMedia";

type SpeechRecognitionEventLike = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type UseSpeechInputOptions = {
  languagePref?: LanguagePref;
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (message: string) => void;
};

export function useSpeechInput({
  languagePref = "en",
  onTranscript,
  onError,
}: UseSpeechInputOptions) {
  const isSupported = useSpeechInputSupported();
  const [status, setStatus] = useState<SpeechInputStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus((s) => (s === "listening" ? "idle" : s));
  }, []);

  const startListening = useCallback(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setStatus("unsupported");
      const msg = "Voice input is not supported in this browser.";
      setErrorMessage(msg);
      onErrorRef.current?.(msg);
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new Recognition();
    recognition.lang = languageToSpeechLocale(languagePref);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalText) {
        onTranscriptRef.current(finalText.trim(), true);
      } else if (interim) {
        onTranscriptRef.current(interim.trim(), false);
      }
    };

    recognition.onerror = (event) => {
      const msg =
        event.error === "not-allowed"
          ? "Microphone permission denied."
          : "Voice input failed. Please try typing.";
      setErrorMessage(msg);
      setStatus("error");
      onErrorRef.current?.(msg);
    };

    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setErrorMessage(null);
      setStatus("listening");
    } catch {
      const msg = "Could not start voice input.";
      setErrorMessage(msg);
      setStatus("error");
      onErrorRef.current?.(msg);
    }
  }, [languagePref]);

  const toggleListening = useCallback(() => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    status,
    isListening: status === "listening",
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}

export { isSpeechInputSupported, languageToSpeechLocale };
