"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DbChatHistory } from "@/lib/types";
import { ChatHistoryList } from "@/components/chat-history-list";

type UserRow = {
  id: string;
  username: string;
  isAdmin: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [history, setHistory] = useState<DbChatHistory[]>([]);
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, historyRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/chat-history"),
      ]);

      if (!usersRes.ok) {
        const payload = await usersRes.json();
        throw new Error(payload.error ?? "Failed to load users.");
      }

      if (!historyRes.ok) {
        const payload = await historyRes.json();
        throw new Error(payload.error ?? "Failed to load history.");
      }

      const usersJson = await usersRes.json();
      const historyJson = await historyRes.json();
      setUsers(usersJson.users ?? []);
      setHistory(historyJson.history ?? []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load admin data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Remove this user?")) return;
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: id }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to delete user.");
      }
      loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete user.");
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset the current session immediately?")) return;
    setIsResetting(true);
    try {
      const response = await fetch("/api/admin/reset", { method: "POST" });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to reset session.");
      }
      loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to reset session.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[var(--background-primary)] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Dashboard Controls</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Manage users, inspect historical sessions, and force resets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold hover:bg-[var(--accent-muted)] disabled:opacity-50"
            >
              {isResetting ? "Resetting..." : "Reset Chat Now"}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--text-secondary)] hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/40 text-red-200 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-[var(--background-secondary)] rounded-3xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Registered Users</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {users.length} accounts
                </p>
              </div>
              <button
                onClick={loadData}
                className="text-xs text-[var(--text-secondary)] hover:text-white"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {isLoading ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Loading users...
                </p>
              ) : users.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  No users found.
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-[var(--background-tertiary)]/70 border border-white/5 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {user.isAdmin ? "Admin" : "Member"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-xs text-red-300 hover:text-red-100"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-3xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Chat History</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {history.length} sessions stored
                </p>
              </div>
            </div>
            <div className="max-h-[420px] overflow-y-auto pr-2">
              {isLoading ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Loading history...
                </p>
              ) : (
                <ChatHistoryList history={history} />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

