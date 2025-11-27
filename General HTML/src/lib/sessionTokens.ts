import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE_NAME = "chat-room-session";

const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
};

export const createSessionToken = async (user: SessionUser) =>
  new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecretKey());

export const verifySessionToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as SessionUser;
};

