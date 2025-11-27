import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { ensureActiveSession } from "@/lib/sessionManager";
import { getServerSupabase } from "@/lib/supabase/server";

const MessageSchema = z.object({
  text: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const session = await ensureActiveSession();
    const body = await request.json();
    const { text } = MessageSchema.parse(body);

    const supabase = getServerSupabase();
    const { error } = await supabase.from("messages").insert({
      id: randomUUID(),
      sender_id: user.id,
      text,
      session_id: session.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 500 }
    );
  }
}

