import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSpeechInput } from "./useSpeechInput";

class MockSpeechRecognition {
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => {
    this.onend?.();
  });
  abort = vi.fn();
}

describe("useSpeechInput", () => {
  beforeEach(() => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);
    vi.stubGlobal("webkitSpeechRecognition", MockSpeechRecognition);
  });

  it("reports supported when SpeechRecognition exists", () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() =>
      useSpeechInput({ languagePref: "en", onTranscript })
    );
    expect(result.current.isSupported).toBe(true);
  });

  it("toggles listening state", () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() =>
      useSpeechInput({ languagePref: "hi", onTranscript })
    );

    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });
    expect(result.current.isListening).toBe(false);
  });
});
