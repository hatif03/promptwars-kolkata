export type ExamType =
  | "NEET"
  | "JEE"
  | "CUET"
  | "CAT"
  | "GATE"
  | "UPSC"
  | "BOARDS"
  | "OTHER";

export type LanguagePref = "en" | "hi" | "hinglish";

export type MoodType =
  | "happy"
  | "calm"
  | "anxious"
  | "angry"
  | "sad"
  | "tired"
  | "overwhelmed";

export type Profile = {
  id: string;
  display_name: string;
  exam_type: ExamType;
  exam_year: number | null;
  language_pref: LanguagePref;
  days_to_exam: number | null;
  trust_level: number;
  nudge_enabled: boolean;
  onboarding_complete: boolean;
  created_at: string;
};

export type JournalAnalysis = {
  reflection: string;
  themes: string[];
  microStep: string;
  invitationQuestion: string;
  recommendedExerciseId: string;
};

export type WeeklyInsight = {
  summary: string;
  patterns: Array<{
    observation: string;
    evidenceQuote: string;
    confidence: string;
  }>;
  invitationQuestion: string;
  focusForWeek: string;
};

export const MOOD_OPTIONS: Array<{
  id: MoodType;
  label: string;
  emoji: string;
}> = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😵" },
  { id: "angry", label: "Angry", emoji: "😠" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "tired", label: "Tired", emoji: "😴" },
];

export const MOOD_TAGS = [
  "Mock test",
  "Sleep",
  "Family",
  "Comparison",
  "Burnout",
  "Physics",
  "Coaching",
] as const;

export const EXAM_OPTIONS: ExamType[] = [
  "NEET",
  "JEE",
  "CUET",
  "CAT",
  "GATE",
  "UPSC",
  "BOARDS",
  "OTHER",
];
