"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/saathi/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/lib/types";
import { AI_DISCLAIMER } from "@/lib/safety/crisis";
import { LogOut, Download } from "lucide-react";
import { VoiceSettings } from "@/components/a11y/VoiceSettings";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [journalCount, setJournalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { count } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setProfile(p);
      setJournalCount(count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function exportJournal() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saathi-journal-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleNudges() {
    if (!profile) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .update({ nudge_enabled: !profile.nudge_enabled })
      .eq("id", profile.id)
      .select()
      .single();
    if (data) setProfile(data);
  }

  if (loading) {
    return (
      <AppShell title="Profile">
        <p className="text-sm text-saathi-muted">Loading...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-2 pt-5">
            <p className="text-lg font-semibold text-saathi-ink">
              {profile?.display_name ?? "Student"}
            </p>
            <p className="text-sm text-saathi-muted">
              Preparing for {profile?.exam_type ?? "NEET"}
              {profile?.exam_year ? ` ${profile.exam_year}` : ""}
            </p>
            <p className="text-sm text-saathi-muted capitalize">
              Language: {profile?.language_pref ?? "hinglish"}
            </p>
            {profile?.days_to_exam && (
              <p className="text-sm text-saathi-muted">
                {profile.days_to_exam} days to exam
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-saathi-lavender/10">
          <CardContent className="pt-5">
            <p className="text-2xl font-semibold text-saathi-sage-dark">
              {journalCount}
            </p>
            <p className="text-sm text-saathi-muted">journal entries</p>
            {journalCount >= 10 && (
              <p className="mt-2 text-sm text-saathi-ink">
                You&apos;ve been showing up for yourself. That&apos;s real progress.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-saathi-ink">Gentle nudges</p>
                <p className="text-xs text-saathi-muted">Warm check-ins, max 1–2/day</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile?.nudge_enabled ?? false}
                aria-label="Gentle nudges"
                onClick={toggleNudges}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  profile?.nudge_enabled
                    ? "bg-saathi-sage text-white"
                    : "bg-saathi-cream text-saathi-ink"
                }`}
              >
                {profile?.nudge_enabled ? "On" : "Off"}
              </button>
            </div>
          </CardContent>
        </Card>

        <VoiceSettings languagePref={profile?.language_pref ?? "hinglish"} />

        <Button variant="outline" className="w-full" onClick={exportJournal}>
          <Download className="h-4 w-4" />
          Export journal
        </Button>

        <Card className="border-saathi-sage/10">
          <CardContent className="pt-5">
            <p className="text-xs leading-relaxed text-saathi-muted">{AI_DISCLAIMER}</p>
            <p className="mt-2 text-xs text-saathi-muted">
              Your data stays private. We never sell your information.
            </p>
          </CardContent>
        </Card>

        <Button variant="ghost" className="w-full" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </AppShell>
  );
}
