"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, asAdmin: isAdmin }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Unable to login.");
        return;
      }
      router.push(payload.redirectTo ?? "/chat");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[var(--background-primary)] px-4 py-10">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 bg-[var(--background-secondary)] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-10 bg-gradient-to-br from-[var(--background-tertiary)] to-black/30 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[var(--accent)]" size={32} />
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--text-secondary)]">
                Welcome to
              </p>
              <h1 className="text-3xl font-semibold text-white">Chat Room</h1>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Real-time, Supabase-powered conversations with daily resets and
            optional admin control. Log in to join the conversation.
          </p>
          <div className="mt-auto grid grid-cols-2 gap-4">
            {[
              "Real-time messaging",
              "Discord-inspired UI",
              "24h auto reset",
              "Admin controls",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-black/30 border border-white/5 px-4 py-3 text-sm text-white/80"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
              Login
            </p>
            <h2 className="text-2xl font-semibold text-white mt-2">
              Join today&apos;s session
            </h2>
          </div>

          <label className="flex flex-col gap-2 text-sm">
            Username
            <input
              className="rounded-2xl bg-[var(--background-tertiary)] border border-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-white"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              type="password"
              className="rounded-2xl bg-[var(--background-tertiary)] border border-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-white"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin((prev) => !prev)}
              className="accent-[var(--accent)] w-4 h-4"
            />
            Login as Admin
          </label>

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/40 text-red-200 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-muted)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 transition"
          >
            {isSubmitting ? "Authenticating..." : "Enter Chat"}
          </button>

          <p className="text-xs text-[var(--text-secondary)] text-center">
            Need an account? Ask an admin to create one in Supabase.
          </p>
        </form>
      </div>
    </section>
  );
}
