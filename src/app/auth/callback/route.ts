import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/account";
  const dest = new URL(next, url.origin);
  url.searchParams.forEach((v, k) => {
    if (k !== "next") dest.searchParams.set(k, v);
  });
  return NextResponse.redirect(dest);
}
