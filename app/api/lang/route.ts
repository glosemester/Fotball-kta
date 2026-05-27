import { NextRequest, NextResponse } from "next/server";
import { isValidLang } from "@/lib/dict";

export async function POST(req: NextRequest) {
  const { lang } = await req.json();
  if (!isValidLang(lang)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("pitchplan-lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
