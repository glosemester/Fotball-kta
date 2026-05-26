import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const coach = await prisma.coach.findUnique({
    where: { id: session.coachId },
    select: { features: true },
  });

  return NextResponse.json({ features: coach?.features ?? [] });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { feature, enabled } = await req.json();
  if (!feature) return NextResponse.json({ error: "Mangler feature" }, { status: 400 });

  const coach = await prisma.coach.findUnique({
    where: { id: session.coachId },
    select: { features: true },
  });

  const current = coach?.features ?? [];
  const updated = enabled
    ? [...new Set([...current, feature])]
    : current.filter((f) => f !== feature);

  await prisma.coach.update({
    where: { id: session.coachId },
    data: { features: updated },
  });

  return NextResponse.json({ features: updated });
}
