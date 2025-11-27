import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/types";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
} from "@/lib/sessionTokens";

export const getUserFromCookies = async (): Promise<SessionUser | null> => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
};

export const requireUser = async () => {
  const user = await getUserFromCookies();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw new Error("Forbidden");
  }
  return user;
};

export { SESSION_COOKIE_NAME, createSessionToken, verifySessionToken };

