import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes: answer CORS preflights directly, otherwise let the route
  // handler run and rely on next.config.ts headers() to attach CORS to
  // its response.
  if (pathname.startsWith("/api/")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }
    return NextResponse.next();
  }

  // Auth callback route: pass through untouched.
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Everything else: let next-intl handle locale routing.
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/api/:path*",
    "/auth/:path*",
    "/(en|es|de|hi|ar)/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
