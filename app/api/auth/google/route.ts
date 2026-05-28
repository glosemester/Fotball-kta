import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth ikke konfigurert" }, { status: 500 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
  const scope = "openid email profile";
  const state = crypto.randomUUID();

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("oauth_state", state, { httpOnly: true, maxAge: 600, sameSite: "lax", path: "/" });
  return res;
}
