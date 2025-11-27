import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { forceResetSession } from "@/lib/sessionManager";

export async function POST() {
  try {
    await requireAdmin();
    const session = await forceResetSession();
    return NextResponse.json({ session });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to reset chat." },
      { status: 500 }
    );
  }
}

