import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, isAdmin")
      .order("username", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load users." },
      { status: 500 }
    );
  }
}

const DeleteSchema = z.object({
  userId: z.string().uuid(),
});

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { userId } = DeleteSchema.parse(body);

    if (userId === admin.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to delete user." },
      { status: 500 }
    );
  }
}

