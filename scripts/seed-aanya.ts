/**
 * Seed Aanya Sharma demo account — idempotent, run via: npm run seed:aanya
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error("Could not read .env.local");
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Narrative = typeof import("../supabase/seed/aanya-narrative.json");

const narrative: Narrative = JSON.parse(
  readFileSync(resolve(process.cwd(), "supabase/seed/aanya-narrative.json"), "utf8")
);

const { email, password } = narrative.credentials;

function isoDate(dateStr: string, hour = 22, minute = 30): string {
  const d = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`);
  return d.toISOString();
}

function daysAgoIso(days: number, hour = 22): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

type JournalRow = {
  content: string;
  ai_reflection: string;
  themes: string[];
  micro_step: string;
  invitation_question: string;
  created_at: string;
};

function buildJournalEntries(): JournalRow[] {
  const entries: JournalRow[] = [];
  const key = narrative.keyJournals;

  entries.push({
    content: key.day1.content,
    ai_reflection: key.day1.ai_reflection,
    themes: key.day1.themes,
    micro_step: key.day1.micro_step,
    invitation_question: key.day1.invitation_question,
    created_at: isoDate(key.day1.date, 21, 0),
  });

  const week1Templates = [
    {
      content: "Physics mock diya aaj. 42/180. Bohot bura. Lagta hai main NEET ke liye bani hi nahi.",
      themes: ["physics", "mock test", "self-doubt"],
      reflection: "Mock scores can feel like they define you — they don't. One test is one snapshot.",
    },
    {
      content: "Aaj physics notes khole hi nahi. Avoidance ho rahi hai. Kal se pakka padhungi.",
      themes: ["physics", "avoidance"],
      reflection: "Avoidance is your brain trying to protect you from more pain. That's understandable.",
    },
    {
      content: "Coaching mein sab fast solve kar rahe the. Main peeche reh gayi. Uff yaar.",
      themes: ["coaching", "comparison"],
      reflection: "Comparing your pace to others in a room of hundreds — that's an unfair fight.",
    },
    {
      content: "Maa ne WhatsApp pe cousin ka score bheja. 650. Mera last mock 480 tha. Mann kharab.",
      themes: ["parental comparison", "family"],
      reflection: "Family pressure through comparison hits different when you're already struggling.",
    },
    {
      content: "Raat ko 2 baje tak chemistry padhi kyunki guilt ho rahi thi break lene ki.",
      themes: ["guilt", "burnout"],
      reflection: "Guilt-driven studying rarely sticks — rest is part of prep, not betrayal.",
    },
    {
      content: "Pre-mock breathing try ki aaj. Thoda better feel hua before physics. Surprised.",
      themes: ["physics", "coping"],
      reflection: "Small rituals before hard subjects — you noticed it helped. That's worth repeating.",
    },
    {
      content: "Sunday nahi hai but ghar yaad aa raha hai. Jaipur ki yaadein. Lonely feel.",
      themes: ["isolation", "homesick"],
      reflection: "Missing home while grinding in Kota — so many students feel this and don't say it.",
    },
  ];

  for (let i = 0; i < week1Templates.length; i++) {
    const t = week1Templates[i];
    entries.push({
      content: t.content,
      ai_reflection: t.reflection,
      themes: t.themes,
      micro_step: "Take 3 breaths before your next study block.",
      invitation_question: "Does this feel true to you?",
      created_at: isoDate(addDays(key.day1.date, i + 1)),
    });
  }

  const weeks23Templates = [
    { content: "Physics chapter 5 — electrostatics. Mock mein sab galat. Failure feel ho raha hai.", themes: ["physics", "failure"] },
    { content: "Papa ne phone kiya. 'Beta rank kya aayegi?' — same question. Can't answer.", themes: ["parental comparison", "family"] },
    { content: "Hostel roommate ne 680 score bataya. Main chup rahi. Andar se toot rahi thi.", themes: ["comparison", "isolation"] },
    { content: "Aaj physics avoid ki puri din. Kal mock hai. Anxiety badh rahi hai.", themes: ["physics", "avoidance", "anxiety"] },
    { content: "Mock ke baad ro liya bathroom mein. Koi nahi dekha. Chalo padhai.", themes: ["mock test", "isolation"] },
    { content: "Maa ko nahi bataya mock score. Jhoot bol diya 'theek tha'. Guilt.", themes: ["family", "guilt"] },
    { content: "Physics mein thoda improve — 52/180. Still bad but not zero.", themes: ["physics", "progress"] },
    { content: "Coaching test mein neend aa rahi thi. 5 ghante sone ke baad bhi tired.", themes: ["burnout", "sleep"] },
    { content: "Sunday call se pehle anxiety. Pata hai kya hoga — rank, cousins, future.", themes: ["sunday stress", "family"] },
    { content: "Call ke baad journal likh rahi hu. Rona aa gaya phir se.", themes: ["sunday stress", "family", "isolation"] },
    { content: "Weekend pe bhi padhai. Kota mein koi weekend nahi hota.", themes: ["burnout", "coaching"] },
    { content: "Physics numericals — 2 ghante, 5 solve hue. Slow but trying.", themes: ["physics", "progress"] },
    { content: "Friend ne break suggest kiya. Maine mana kar diya. Guilt agar rest lu.", themes: ["guilt", "burnout"] },
    { content: "Negative self-talk bahut hai. 'Tu fail hogi' — dimaag mein repeat.", themes: ["self-doubt", "failure"] },
  ];

  const startWeeks23 = addDays(key.day1.date, 8);
  for (let i = 0; i < weeks23Templates.length; i++) {
    const t = weeks23Templates[i];
    entries.push({
      content: t.content,
      ai_reflection: "I hear the weight in this. You're carrying a lot without many places to put it down.",
      themes: t.themes,
      micro_step: "One small thing tonight — not everything.",
      invitation_question: "Does this feel true to you?",
      created_at: isoDate(addDays(startWeeks23, i)),
    });
  }

  const week4Start = addDays(key.day1.date, 22);
  for (let i = 0; i < 6; i++) {
    const isSunday = i === 6;
    entries.push({
      content: isSunday
        ? "Saturday night — kal Sunday call hai. Already dreading it."
        : `Week 4 day ${i + 1}. ${i % 2 === 0 ? "Physics stress continues." : "Trying to keep going."}`,
      ai_reflection: isSunday
        ? "The dread before Sunday calls — your body already knows what's coming."
        : "Still showing up to journal. That matters.",
      themes: isSunday ? ["sunday stress", "family"] : ["physics", "stress"],
      micro_step: isSunday ? "Write one boundary before tomorrow's call." : "3 breaths before studying.",
      invitation_question: "Does this feel true?",
      created_at: isoDate(addDays(week4Start, i)),
    });
  }

  entries.push({
    content: key.week4_sunday.content,
    ai_reflection: key.week4_sunday.ai_reflection,
    themes: key.week4_sunday.themes,
    micro_step: key.week4_sunday.micro_step,
    invitation_question: key.week4_sunday.invitation_question,
    created_at: isoDate(key.week4_sunday.date, 21, 45),
  });

  const mayTemplates = [
    "Call se pehle journal — feeling anxious but prepared.",
    "Call ke baad — better than last month. Boundary set: no rank talk.",
    "Physics mock — 98/180. Best yet. Breathing ritual helped.",
    "Break liya 30 min. Bina guilt ke. World nahi ruka.",
    "Sunday dread kam hua thoda. Call short rakhi.",
    "Coaching mein focus better. Less comparison today.",
    "Sleep 6 hours. Improvement.",
    "Negative self-talk catch kiya — 'failure' word use nahi kiya aaj.",
    "Pre-call journal + post-call journal = game changer.",
    "Mock test anxiety manageable with breathing.",
    "Maa ne praise kiya — pehli baar in months. Felt good.",
    "Physics chapter complete. Slow but done.",
    "Hostel loneliness — messaged school friend. Felt lighter.",
    "Rest day liya. Guilt thodi thi but okay.",
    "Rank anxiety still there but not consuming.",
    "Good enough study permission exercise try ki.",
    "Sunday call — 20 min only. Boundary worked.",
    "Revision mode. Tired but steady.",
    "Self-compassion when mock went average.",
    "Break ke baad productivity better — note to self.",
    "Family call positive for once. Progress.",
    "Exam feels closer. Mixed feelings.",
  ];

  const mayStart = "2026-05-01";
  for (let i = 0; i < mayTemplates.length; i++) {
    entries.push({
      content: mayTemplates[i],
      ai_reflection: "You're building new patterns — boundaries, breaks, breathing. That's real work.",
      themes: i % 7 === 0 ? ["sunday stress", "family"] : ["progress", "coping"],
      micro_step: "Keep what's working.",
      invitation_question: "Can you feel the shift from last month?",
      created_at: isoDate(addDays(mayStart, i * 1)),
    });
  }

  const juneTemplates = [
    "June start — 3 weeks to NEET. Scared but prepared-ish.",
    "Breathing before mock — routine now. Helps.",
    "Less 'failure' in my vocabulary. Noticing.",
    "Break liya. Productive after.",
    "Physics theek hai ab — focus on overall revision.",
    "Sunday call — short, no rank. Boundary holding.",
    "Sleep better this week.",
    "Mock anxiety — used tools, didn't spiral.",
    "Grateful for journaling habit.",
    "Coaching pressure high but managing.",
    "Self-talk gentler. 'Main try kar rahi hu' instead of 'main fail hu'.",
    "Pre-exam nerves starting. Normal?",
    "Revision heavy day. Tired but okay.",
    "Friend support — talked about stress. Helped.",
    "Dar lag raha hai but maine breathing ki.",
    "Final week approaching. Mixed terror and readiness.",
  ];

  const juneStart = "2026-06-01";
  for (let i = 0; i < juneTemplates.length; i++) {
    entries.push({
      content: juneTemplates[i],
      ai_reflection: "Exam pressure is real — and you're meeting it with tools you didn't have in March.",
      themes: ["exam anxiety", "progress", "coping"],
      micro_step: "Trust your rituals.",
      invitation_question: "What helped most today?",
      created_at: isoDate(addDays(juneStart, i * 1 + 1)),
    });
  }

  entries.push({
    content: key.examDay.content,
    ai_reflection: key.examDay.ai_reflection,
    themes: key.examDay.themes,
    micro_step: key.examDay.micro_step,
    invitation_question: key.examDay.invitation_question,
    created_at: isoDate(key.examDay.date, 6, 15),
  });

  return entries.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function buildMoodCheckins(journals: JournalRow[]) {
  const moods: Array<{
    mood: string;
    tags: string[];
    created_at: string;
  }> = [];

  for (let i = 0; i < journals.length; i++) {
    const j = journals[i];
    if (i % 5 === 4) continue;
    const date = new Date(j.created_at);
    const isSunday = date.getDay() === 0;
    const themes = j.themes;

    let mood = "anxious";
    if (themes.includes("progress") || themes.includes("coping")) mood = "calm";
    if (themes.includes("isolation") || isSunday) mood = "sad";
    if (themes.includes("burnout")) mood = "tired";
    if (themes.includes("exam anxiety") || themes.includes("NEET")) mood = "overwhelmed";

    const tags: string[] = [];
    if (themes.includes("physics") || themes.includes("mock test")) tags.push("Physics", "Mock test");
    if (themes.includes("family") || themes.includes("sunday stress")) tags.push("Family", "Comparison");
    if (themes.includes("burnout")) tags.push("Burnout");
    if (themes.includes("coaching")) tags.push("Coaching");

    moods.push({
      mood,
      tags: [...new Set(tags)],
      created_at: j.created_at,
    });
  }

  return moods;
}

async function findOrCreateUser(): Promise<string> {
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = listData?.users?.find((u) => u.email === email);

  if (existing) {
    console.log(`Found existing user: ${existing.id}`);
    await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: "Aanya Sharma" },
    });
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Aanya Sharma" },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create user: ${error?.message}`);
  }

  console.log(`Created user: ${data.user.id}`);
  return data.user.id;
}

async function clearUserData(userId: string) {
  const tables = [
    "chat_messages",
    "chat_sessions",
    "crisis_events",
    "exercise_completions",
    "coping_preferences",
    "weekly_insights",
    "journal_entries",
    "mood_checkins",
  ] as const;

  for (const table of tables) {
    if (table === "chat_messages") {
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", userId);
      if (sessions?.length) {
        await supabase
          .from("chat_messages")
          .delete()
          .in(
            "session_id",
            sessions.map((s) => s.id)
          );
      }
      continue;
    }
    if (table === "chat_sessions") {
      await supabase.from("chat_sessions").delete().eq("user_id", userId);
      continue;
    }
    await supabase.from(table).delete().eq("user_id", userId);
  }
}

async function main() {
  console.log("🌱 Seeding Aanya Sharma demo account...\n");

  const userId = await findOrCreateUser();
  await clearUserData(userId);

  const profile = narrative.profile;
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: profile.display_name,
    exam_type: profile.exam_type,
    exam_year: profile.exam_year,
    language_pref: profile.language_pref,
    days_to_exam: profile.days_to_exam,
    trust_level: profile.trust_level,
    nudge_enabled: profile.nudge_enabled,
    onboarding_complete: profile.onboarding_complete,
    created_at: profile.created_at,
    updated_at: new Date().toISOString(),
  });

  if (profileError) throw new Error(`Profile: ${profileError.message}`);

  const journals = buildJournalEntries();
  const journalRows = journals.map((j) => ({ ...j, user_id: userId }));

  const { error: journalError } = await supabase.from("journal_entries").insert(journalRows);
  if (journalError) throw new Error(`Journals: ${journalError.message}`);
  console.log(`✓ ${journalRows.length} journal entries`);

  const moods = buildMoodCheckins(journals);
  const moodRows = moods.map((m) => ({ ...m, user_id: userId }));
  const { error: moodError } = await supabase.from("mood_checkins").insert(moodRows);
  if (moodError) throw new Error(`Moods: ${moodError.message}`);
  console.log(`✓ ${moodRows.length} mood check-ins`);

  const insightRows = narrative.weeklyInsights.map((ins) => ({
    user_id: userId,
    week_start: ins.week_start,
    summary: ins.summary,
    patterns: ins.patterns,
    evidence_quotes: ins.patterns.map((p) => p.evidenceQuote),
    invitation_question: ins.invitation_question,
    created_at: isoDate(ins.week_start, 20, 0),
  }));

  const { error: insightError } = await supabase.from("weekly_insights").insert(insightRows);
  if (insightError) throw new Error(`Insights: ${insightError.message}`);
  console.log(`✓ ${insightRows.length} weekly insights`);

  for (const session of narrative.chatSessions) {
    const { data: sess, error: sessError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        title: session.title,
        created_at: session.created_at,
        updated_at: session.created_at,
      })
      .select("id")
      .single();

    if (sessError || !sess) throw new Error(`Chat session: ${sessError?.message}`);

    const msgRows = session.messages.map((m, i) => ({
      session_id: sess.id,
      role: m.role,
      content: m.content,
      created_at: new Date(
        new Date(session.created_at).getTime() + i * 60000
      ).toISOString(),
    }));

    const { error: msgError } = await supabase.from("chat_messages").insert(msgRows);
    if (msgError) throw new Error(`Chat messages: ${msgError.message}`);
  }
  console.log(`✓ ${narrative.chatSessions.length} chat sessions`);

  const exerciseRows = narrative.exerciseCompletions.map((e) => ({
    user_id: userId,
    exercise_id: e.exercise_id,
    helpful_rating: e.helpful_rating,
    trigger_context: "seed",
    created_at: daysAgoIso(e.days_ago),
  }));

  const { error: exError } = await supabase.from("exercise_completions").insert(exerciseRows);
  if (exError) throw new Error(`Exercises: ${exError.message}`);
  console.log(`✓ ${exerciseRows.length} exercise completions`);

  const prefRows = narrative.copingPreferences.map((p) => ({
    user_id: userId,
    exercise_id: p.exercise_id,
    effectiveness_score: p.effectiveness_score,
    use_count: p.use_count,
    updated_at: new Date().toISOString(),
  }));

  const { error: prefError } = await supabase.from("coping_preferences").insert(prefRows);
  if (prefError) throw new Error(`Coping prefs: ${prefError.message}`);
  console.log(`✓ ${prefRows.length} coping preferences`);

  console.log("\n✅ Aanya demo account ready!");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Login:    http://localhost:3000/login\n`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
