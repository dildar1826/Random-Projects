import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("chat_history")
      .select("id, session_id, saved_data");

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ history: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load chat history." },
      { status: 500 }
    );
  }
}

