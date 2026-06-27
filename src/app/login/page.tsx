"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AI_DISCLAIMER } from "@/lib/safety/crisis";

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

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
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

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex rounded-2xl bg-saathi-cream/60 p-1">
            <button
              type="button"
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
              onClick={() => {
                setMode("signup");
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
              <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}

            {message && (
              <p className="rounded-2xl bg-saathi-sage/10 p-3 text-sm text-saathi-ink">
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
