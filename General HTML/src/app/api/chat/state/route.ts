import { NextResponse } from "next/server";
import { ensureActiveSession } from "@/lib/sessionManager";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { DbMessage, DbChatHistory } from "@/lib/types";

const serializeMessages = (rows: any[]): DbMessage[] =>
  rows.map((row) => ({
    id: row.id,
    sender_id: row.sender_id,
    text: row.text,
    created_at: row.created_at,
    session_id: row.session_id,
    sender_username: row.users?.username ?? null,
  }));

const serializeHistory = (rows: DbChatHistory[]) =>
  rows
    .map((row) => ({
      ...row,
      saved_data: row.saved_data,
    }))
    .sort((a, b) => {
      const aTime = a.saved_data?.archived_at
        ? new Date(a.saved_data.archived_at).getTime()
        : 0;
      const bTime = b.saved_data?.archived_at
        ? new Date(b.saved_data.archived_at).getTime()
        : 0;
      return bTime - aTime;
    });

export async function GET() {
  try {
    const user = await requireUser();
    const session = await ensureActiveSession();
    const supabase = getServerSupabase();

    const { data: messagesRows, error: messagesError } = await supabase
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

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    const { data: historyRows, error: historyError } = await supabase
      .from("chat_history")
      .select("id, session_id, saved_data");

    if (historyError) {
      throw new Error(historyError.message);
    }

    return NextResponse.json({
      user,
      session,
      sessionExpiresAt: new Date(
        new Date(session.start_time).getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
      messages: serializeMessages(messagesRows ?? []),
      history: serializeHistory((historyRows as DbChatHistory[]) ?? []),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load chat state." },
      { status: 500 }
    );
  }
}

