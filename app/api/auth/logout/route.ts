import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logget ut" });
  response.cookies.set("fotball-token", "", { maxAge: 0, path: "/" });
  return response;
}
