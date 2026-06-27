import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSpeechOutput } from "./useSpeechOutput";

describe("useSpeechOutput", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor(public text: string) {}
      }
    );
    vi.stubGlobal("speechSynthesis", {
      speak: vi.fn(),
      cancel: vi.fn(),
    });
    localStorage.clear();
  });

  it("speaks when TTS enabled", () => {
    const { result } = renderHook(() => useSpeechOutput({ languagePref: "en" }));

    act(() => {
      result.current.speak("Hello from Saathi");
    });

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("respects disabled TTS preference", () => {
    localStorage.setItem(
      "saathi-voice-prefs",
      JSON.stringify({ ttsEnabled: false, autoRead: false })
    );

    const { result } = renderHook(() => useSpeechOutput({ languagePref: "en" }));

    act(() => {
      result.current.speak("Should not speak");
    });

    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });
});
