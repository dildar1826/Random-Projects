"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { MessageList } from "@/components/message-list";
import { MessageComposer } from "@/components/message-composer";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type {
  DbChatHistory,
  DbMessage,
  DbSession,
  SessionUser,
} from "@/lib/types";

type ChatStateResponse = {
  user: SessionUser;
  session: DbSession;
  sessionExpiresAt: string;
  messages: DbMessage[];
  history: DbChatHistory[];
};

export default function ChatPage() {
  const router = useRouter();
  const [state, setState] = useState<ChatStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const loadState = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }
      try {
        const response = await fetch("/api/chat/state", { cache: "no-store" });
        if (response.status === 401) {
          router.replace("/");
          return;
        }
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load chat.");
        }
        setState(payload);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to load chat. Please refresh.");
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [router]
  );

  useEffect(() => {
    loadState();
  }, [loadState]);

  const sessionId = state?.session.id;

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    const supabase = getBrowserSupabase();
    const channel = supabase
      .channel(`messages-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          loadState({ silent: true });
        }
      )
      .subscribe();

    const sessionChannel = supabase
      .channel("sessions-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sessions",
        },
        (payload) => {
          if (
            payload.new.id !== sessionId &&
            payload.new.start_time > (state?.session.start_time ?? "")
          ) {
            loadState({ silent: true });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, loadState, state?.session.start_time]);

  const handleSend = useCallback(
    async (text: string) => {
      setIsSending(true);
      setError("");
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error ?? "Unable to send message.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to send message.");
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  const mainContent = useMemo(() => {
    if (isLoading || !state) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
          Loading chat...
        </div>
      );
    }

    return (
      <>
        <ChatHeader sessionExpiresAt={state.sessionExpiresAt} />
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <MessageList
            messages={state.messages}
            currentUserId={state.user.id}
          />
        </div>
        <MessageComposer onSend={handleSend} isSending={isSending} />
      </>
    );
  }, [handleSend, isLoading, isSending, state]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {state && (
        <ChatSidebar
          username={state.user.username}
          history={state.history}
          onSelectHistory={(item) => {
            if (!item.saved_data) return;
            const transcript = item.saved_data.messages
              .map(
                (message) =>
                  `${message.sender_username ?? "User"}: ${message.text}`
              )
              .join("\n");
            if (typeof navigator !== "undefined" && navigator.clipboard) {
              navigator.clipboard.writeText(transcript).catch(() => undefined);
            }
          }}
          onLogout={handleLogout}
        />
      )}

      <section className="flex-1 flex flex-col bg-[var(--background-primary)]">
        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-200 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {mainContent}
      </section>
    </div>
  );
}

