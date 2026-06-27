export function loadApiKeys(): string[] {
  const keys: string[] = [];
  const numbered = process.env.GROQ_API_KEYS?.split(",").map((k) => k.trim()).filter(Boolean);
  if (numbered?.length) keys.push(...numbered);

  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GROQ_API_KEY_${i}`];
    if (key?.trim()) keys.push(key.trim());
  }

  const single = process.env.GROQ_API_KEY?.trim();
  if (single) keys.push(single);

  return [...new Set(keys)];
}

export function hasGroqKeys(): boolean {
  return loadApiKeys().length > 0;
}
