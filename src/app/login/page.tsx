"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AI_DISCLAIMER } from "@/lib/safety/crisis";
import { DEMO_ACCOUNT } from "@/lib/demo-account";
import { SkipToMain } from "@/components/a11y/SkipToMain";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);
      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/home");
      router.refresh();
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Check your email to confirm, then sign in."
    );
    setMode("login");
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError(null);
    setMessage(null);
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setMode("login");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });

    setLoading(false);
    if (authError) {
      setError(
        `${authError.message} If this is a fresh deploy, ask the host to run npm run seed:aanya.`
      );
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <SkipToMain />
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-saathi-sage">
          Saathi
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-saathi-ink">
          Exam prep ka saathi
        </h1>
        <p className="mt-2 text-sm text-saathi-muted italic">
          Sunno. Samjho. Saans lo.
        </p>
      </div>

      <Card className="mb-4 border-saathi-sage/40 bg-gradient-to-br from-saathi-sage-light via-saathi-surface to-saathi-lavender/40">
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-saathi-sage text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-saathi-ink">Try without signing up</p>
              <p className="mt-1 text-xs leading-relaxed text-saathi-muted">
                {DEMO_ACCOUNT.description}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-saathi-border bg-saathi-surface/80 px-3 py-2 text-xs text-saathi-ink">
            <p>
              <span className="font-medium text-saathi-sage-dark">Email:</span>{" "}
              {DEMO_ACCOUNT.email}
            </p>
            <p className="mt-1">
              <span className="font-medium text-saathi-sage-dark">Password:</span>{" "}
              {DEMO_ACCOUNT.password}
            </p>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={loading}
            onClick={handleDemoLogin}
          >
            {loading ? "Opening demo..." : `Explore as ${DEMO_ACCOUNT.displayName}`}
          </Button>
        </CardContent>
      </Card>

      <Card id="main-content" tabIndex={-1}>
        <CardContent className="space-y-4 pt-6">
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="flex rounded-2xl bg-saathi-cream/60 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-white text-saathi-ink shadow-sm"
                  : "text-saathi-muted"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => {
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-white text-saathi-ink shadow-sm"
                  : "text-saathi-muted"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-saathi-ink">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-saathi-ink">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-2xl border border-saathi-destructive/20 bg-saathi-destructive/5 p-3 text-sm text-saathi-destructive"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-2xl bg-saathi-sage/10 p-3 text-sm text-saathi-ink"
              >
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-saathi-muted">{AI_DISCLAIMER}</p>
      <p className="mt-2 text-center text-xs text-saathi-muted">
        Your journal stays private. We never sell your data.
      </p>
    </div>
  );
}
