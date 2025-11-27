import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/sessionTokens";
import type { SessionUser } from "@/lib/types";

const PROTECTED_ROUTES = ["/chat", "/admin"];

const isProtected = (path: string) =>
  PROTECTED_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let user: SessionUser | null = null;

  try {
    user = await verifySessionToken(token);
  } catch (error) {
    console.error(error);
  }

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && !user.isAdmin) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/admin/:path*"],
};

