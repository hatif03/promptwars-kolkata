export const CRISIS_KEYWORDS = [
  "suicide",
  "suicidal",
  "kill myself",
  "killing myself",
  "end my life",
  "want to die",
  "don't want to live",
  "dont want to live",
  "self harm",
  "self-harm",
  "hurt myself",
  "cut myself",
  "no reason to live",
  "better off dead",
  "mar jaunga",
  "mar jaungi",
  "jeena nahi",
  "marna chahta",
  "marna chahti",
  "khud ko khatam",
  "zinda nahi rehna",
];

export type CrisisCheckResult = {
  isCrisis: boolean;
  matchedTerms: string[];
  severity: "none" | "moderate" | "high";
};

export function checkCrisisContent(text: string): CrisisCheckResult {
  const normalized = text.toLowerCase();
  const matchedTerms = CRISIS_KEYWORDS.filter((term) =>
    normalized.includes(term.toLowerCase())
  );

  const highSeverityTerms = [
    "suicide",
    "suicidal",
    "kill myself",
    "end my life",
    "want to die",
    "mar jaunga",
    "mar jaungi",
    "khud ko khatam",
  ];

  const hasHigh = matchedTerms.some((t) =>
    highSeverityTerms.some((h) => t.includes(h) || h.includes(t))
  );

  return {
    isCrisis: matchedTerms.length > 0,
    matchedTerms,
    severity: hasHigh ? "high" : matchedTerms.length > 0 ? "moderate" : "none",
  };
}

export const CRISIS_RESOURCES = [
  {
    name: "Tele-MANAS",
    number: "14416",
    description: "National mental health helpline (24/7)",
    href: "tel:14416",
  },
  {
    name: "iCall",
    number: "9152987821",
    description: "Counselling helpline by TISS",
    href: "tel:9152987821",
  },
  {
    name: "Vandrevala Foundation",
    number: "9999666555",
    description: "24/7 mental health support",
    href: "tel:9999666555",
  },
  {
    name: "Emergency",
    number: "112",
    description: "National emergency number",
    href: "tel:112",
  },
] as const;

export const CRISIS_RESPONSE_TEMPLATE = `I'm really worried about you, and what you're going through sounds incredibly heavy. You deserve real support from someone who can be there with you right now.

Please reach out — you don't have to face this alone:
• Tele-MANAS: 14416 (24/7)
• iCall: 9152987821
• Emergency: 112

I'm an AI companion, not a therapist. If you're in immediate danger, please call emergency services or ask someone you trust to stay with you.

I'm still here if you want to talk — but your safety matters most.`;

export const AI_DISCLAIMER =
  "Saathi is an AI companion, not a therapist or doctor. For clinical care, please speak with a qualified professional.";
