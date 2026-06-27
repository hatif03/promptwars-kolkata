import { z } from "zod";

export const moodTypeSchema = z.enum([
  "happy",
  "calm",
  "anxious",
  "angry",
  "sad",
  "tired",
  "overwhelmed",
]);

export const journalAnalyzeRequestSchema = z.object({
  content: z.string().trim().min(1, "Content required").max(10000),
  mood: moodTypeSchema.optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
});

export const crisisCheckRequestSchema = z.object({
  text: z.string().trim().min(1, "Text required").max(10000),
});

export type JournalAnalyzeRequest = z.infer<typeof journalAnalyzeRequestSchema>;
export type CrisisCheckRequest = z.infer<typeof crisisCheckRequestSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
