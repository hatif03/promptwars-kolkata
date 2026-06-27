export const AFFIRMATIONS = [
  "It is better to conquer yourself than to win a thousand battles.",
  "Rest is part of preparation — not the opposite of it.",
  "Your worth is not your rank.",
  "Showing up today, even tired, is courage.",
  "One mock does not define your journey.",
  "You are allowed to struggle and still be capable.",
  "Padhai important hai. Tum bhi important ho.",
];

export function getDailyQuote(seed?: string): string {
  const day = seed
    ? new Date(seed).getDate()
    : new Date().getDate();
  return AFFIRMATIONS[day % AFFIRMATIONS.length];
}
