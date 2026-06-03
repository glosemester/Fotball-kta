import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { auth } from "@/auth";

const SECRET = process.env.JWT_SECRET!;

export interface SessionPayload {
  coachId: string;
  email: string;
  fullName: string;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  // Prøv NextAuth (Google) først
  const nextSession = await auth();
  if (nextSession?.user?.id) {
    return {
      coachId: nextSession.user.id,
      email: nextSession.user.email || "",
      fullName: nextSession.user.name || "Trener",
    };
  }

  // Fallback til den gamle manuelle innloggingen
  const cookieStore = await cookies();
  const token = cookieStore.get("fotball-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
