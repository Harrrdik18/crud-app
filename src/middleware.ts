import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSessionCookie } from "@/lib/crypto";

export const runtime = "nodejs";

const AUTH_COOKIE = "jh_session";
const AUTH_SECRET = process.env.AUTH_SECRET;

function getAuthSecret(): string {
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET is not set");
  return AUTH_SECRET;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for marketing routes, auth routes, static files, api
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = decodeSessionCookie(cookie, getAuthSecret());
  if (!token) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  // Token exists and signature valid - let the route handlers verify the session in DB
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - marketing pages (/, /features, /privacy)
     * - auth pages (/login, /register)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|register|features|privacy|api|$).*)",
  ],
};