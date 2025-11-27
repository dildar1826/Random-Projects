import { randomUUID } from "crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import type { DbSession, DbMessage, SavedHistoryPayload } from "@/lib/types";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const mapMessages = (messages: any[]): DbMessage[] =>
  messages.map((message) => ({
    id: message.id,
    sender_id: message.sender_id,
    text: message.text,
    created_at: message.created_at,
    session_id: message.session_id,
    sender_username: message.users?.username ?? null,
  }));

const fetchLatestSession = async () => {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbSession | null;
};

const createSession = async (): Promise<DbSession> => {
  const supabase = getServerSupabase();
  const newSession: DbSession = {
    id: randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    start_time: new Date().toISOString(),
  };

  const { error } = await supabase.from("sessions").insert(newSession);
  if (error) {
    throw new Error(error.message);
  }

  return newSession;
};

const archiveSession = async (session: DbSession) => {
  const supabase = getServerSupabase();
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `
        id,
        sender_id,
        text,
        created_at,
        session_id,
        users:sender_id (
          username
        )
      `
    )
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const payload: SavedHistoryPayload = {
    session,
    archived_at: new Date().toISOString(),
    messages: mapMessages(messages ?? []),
  };

  const { error: insertError } = await supabase
    .from("chat_history")
    .insert({ id: randomUUID(), session_id: session.id, saved_data: payload });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: deleteError } = await supabase
    .from("messages")
    .delete()
    .eq("session_id", session.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
};

export const ensureActiveSession = async (): Promise<DbSession> => {
  let session = await fetchLatestSession();
  if (!session) {
    session = await createSession();
    return session;
  }

  const sessionStart = new Date(session.start_time).getTime();
  const now = Date.now();
  const isExpired =
    now - sessionStart >= SESSION_DURATION_MS ||
    session.date !== new Date().toISOString().slice(0, 10);

  if (isExpired) {
    await archiveSession(session);
    session = await createSession();
  }

  return session;
};

export const forceResetSession = async (): Promise<DbSession> => {
  const currentSession = await fetchLatestSession();
  if (currentSession) {
    await archiveSession(currentSession);
  }
  return createSession();
};

