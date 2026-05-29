import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await params;

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
  });
  if (!trening) return NextResponse.json({ error: "Treningsøkt ikke funnet" }, { status: 404 });

  await prisma.trainingSession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
