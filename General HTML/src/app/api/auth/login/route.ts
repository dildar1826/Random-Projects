import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
} from "@/lib/sessionTokens";
import type { SessionUser } from "@/lib/types";
import { ensureActiveSession } from "@/lib/sessionManager";

const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
  asAdmin: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, asAdmin } = LoginSchema.parse(body);

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, password, isAdmin")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, data.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    if (asAdmin && !data.isAdmin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const sessionUser: SessionUser = {
      id: data.id,
      username: data.username,
      isAdmin: data.isAdmin,
    };

    await ensureActiveSession();

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      user: sessionUser,
      redirectTo: sessionUser.isAdmin && asAdmin ? "/admin" : "/chat",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error occurred." },
      { status: 500 }
    );
  }
}

