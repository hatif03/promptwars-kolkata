export type VoicePreferences = {
  ttsEnabled: boolean;
  autoRead: boolean;
};

const STORAGE_KEY = "saathi-voice-prefs";

const DEFAULTS: VoicePreferences = {
  ttsEnabled: true,
  autoRead: false,
};

export function getVoicePreferences(): VoicePreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function setVoicePreferences(prefs: Partial<VoicePreferences>): VoicePreferences {
  const merged = { ...getVoicePreferences(), ...prefs };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }
  return merged;
}
