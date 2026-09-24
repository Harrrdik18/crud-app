import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSessionCookie } from "@/lib/crypto";

const AUTH_COOKIE = "jh_session";
const AUTH_SECRET = process.env.AUTH_SECRET;

function getAuthSecret(): string {
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET is not set");
  return AUTH_SECRET;
}

function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ");
}

function buildSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  };
  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }
  return headers;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/robots") ||
    pathname === "/";

  // Attach security headers + a fresh CSP nonce to every rendered page.
  const nonce = randomUUID().replace(/-/g, "");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", buildCspHeader(nonce));
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", buildCspHeader(nonce));
  for (const [key, value] of Object.entries(buildSecurityHeaders())) {
    response.headers.set(key, value);
  }

  if (isPublicPath) return response;

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = decodeSessionCookie(cookie, getAuthSecret());
  if (!token) {
    const redirectRes = NextResponse.redirect(new URL("/login", request.url));
    redirectRes.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
    return redirectRes;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api).*)"],
};