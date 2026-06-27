export type CalmExercise = {
  id: string;
  title: string;
  titleHi: string;
  duration: number;
  category: "anxiety" | "overwhelm" | "sleep" | "motivation" | "anger" | "focus";
  tags: string[];
  description: string;
  steps: string[];
};

export const CALM_KIT_EXERCISES: CalmExercise[] = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    titleHi: "Box Breathing",
    duration: 3,
    category: "anxiety",
    tags: ["mock test", "panic", "physics"],
    description: "4-4-4-4 breathing to calm your nervous system before studying.",
    steps: [
      "Sit comfortably. Place one hand on your belly.",
      "Breathe in through your nose for 4 counts.",
      "Hold gently for 4 counts.",
      "Exhale slowly for 4 counts.",
      "Hold empty for 4 counts. Repeat 4 times.",
    ],
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    titleHi: "5-4-3-2-1 Grounding",
    duration: 4,
    category: "overwhelm",
    tags: ["overwhelmed", "panic", "burnout"],
    description: "Pull your mind back to the present when everything feels too much.",
    steps: [
      "Name 5 things you can see around you.",
      "Name 4 things you can touch.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell.",
      "Name 1 thing you can taste or one thing you're grateful for.",
    ],
  },
  {
    id: "good-enough-study",
    title: "Good Enough Study Permission",
    titleHi: "Aaj ke liye kaafi hai",
    duration: 3,
    category: "motivation",
    tags: ["guilt", "break", "perfectionism"],
    description: "Permission to stop chasing perfect — for students who feel guilty taking breaks.",
    steps: [
      "Say aloud: 'I am preparing for a marathon, not a sprint.'",
      "Name one thing you DID learn today — however small.",
      "Set a realistic goal for the next 45 minutes only.",
      "Remind yourself: rest is part of preparation, not betrayal.",
    ],
  },
  {
    id: "parent-boundary",
    title: "Before the Parent Call",
    titleHi: "Phone se pehle",
    duration: 5,
    category: "anxiety",
    tags: ["family", "comparison", "sunday"],
    description: "Prepare emotionally before a call that usually triggers stress.",
    steps: [
      "Write one sentence you want them to understand (don't have to say it).",
      "Take 3 slow breaths. Roll your shoulders back.",
      "Decide one boundary: 'I won't discuss mock scores today.'",
      "After the call, journal 2 lines — no analysis, just what you felt.",
    ],
  },
  {
    id: "cognitive-reframe",
    title: "Thought Reframe",
    titleHi: "Soch badlo, thoda",
    duration: 5,
    category: "anxiety",
    tags: ["failure", "negative self-talk", "rank"],
    description: "Gently examine a harsh thought — CBT-inspired, not preachy.",
    steps: [
      "Write the thought exactly as it appears: 'I will fail NEET.'",
      "Ask: What evidence supports this? What evidence contradicts it?",
      "Ask: What would I tell a friend who said this?",
      "Write a softer, honest alternative — not fake positivity.",
    ],
  },
  {
    id: "self-compassion-rank",
    title: "Rank Anxiety Release",
    titleHi: "Rank ka bojh",
    duration: 4,
    category: "anxiety",
    tags: ["rank", "comparison", "coaching"],
    description: "For when rank, percentile, or batch position is eating you alive.",
    steps: [
      "Place hand on heart. Say: 'This pressure is real. So is my effort.'",
      "List 3 things about you that no rank can measure.",
      "Visualize your future self thanking you for not giving up today.",
      "Return to one small study task — just the next 20 minutes.",
    ],
  },
  {
    id: "pre-mock-calm",
    title: "Pre-Mock Calm",
    titleHi: "Mock se pehle",
    duration: 3,
    category: "focus",
    tags: ["mock test", "exam", "physics"],
    description: "Quick centering ritual before a mock test or difficult subject.",
    steps: [
      "Stand up. Shake out your hands for 10 seconds.",
      "Whisper: 'This mock is practice, not my future.'",
      "3 deep belly breaths.",
      "Open the paper when your shoulders drop, not before.",
    ],
  },
  {
    id: "sleep-wind-down",
    title: "Sleep Wind-Down",
    titleHi: "Neend ke liye",
    duration: 5,
    category: "sleep",
    tags: ["sleep", "racing thoughts", "night"],
    description: "When your mind races at 2 AM with 'what if I fail?'",
    steps: [
      "Write down every worry on paper — get it out of your head.",
      "Tell yourself: 'These thoughts can wait until tomorrow.'",
      "Progressive relaxation: tense and release feet, legs, stomach, shoulders.",
      "Focus on the feeling of the pillow. Nothing else required tonight.",
    ],
  },
  {
    id: "study-break-reset",
    title: "4-Hour Study Reset",
    titleHi: "Break le, sahi se",
    duration: 5,
    category: "overwhelm",
    tags: ["burnout", "frustration", "long study"],
    description: "When you've been at the desk too long and frustration is rising.",
    steps: [
      "Step away from the desk — physically leave the room.",
      "Drink water. Look out a window for 60 seconds.",
      "Stretch neck and wrists — your body is part of prep too.",
      "Decide: 10-min break or done for today? Both are valid.",
    ],
  },
  {
    id: "isolation-connect",
    title: "Hostel Loneliness",
    titleHi: "Akela mehsoos ho raha",
    duration: 4,
    category: "motivation",
    tags: ["isolation", "hostel", "homesick"],
    description: "For Kota/hostel students feeling disconnected from home.",
    steps: [
      "Acknowledge: 'Feeling alone here is valid. Many feel this.'",
      "Send one message to someone safe — no need to explain everything.",
      "Write one line about home that made you smile.",
      "Remember: needing connection doesn't make you weak.",
    ],
  },
];

export function getExerciseById(id: string): CalmExercise | undefined {
  return CALM_KIT_EXERCISES.find((e) => e.id === id);
}

export function recommendExercise(themes: string[], tags: string[] = []): CalmExercise {
  const combined = [...themes, ...tags].map((t) => t.toLowerCase());
  let best = CALM_KIT_EXERCISES[0];
  let bestScore = 0;

  for (const exercise of CALM_KIT_EXERCISES) {
    let score = 0;
    for (const tag of exercise.tags) {
      if (combined.some((c) => c.includes(tag) || tag.includes(c))) score += 2;
    }
    for (const tag of combined) {
      if (exercise.title.toLowerCase().includes(tag)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = exercise;
    }
  }

  return best;
}
