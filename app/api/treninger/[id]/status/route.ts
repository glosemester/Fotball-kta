import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const allowed = ["DRAFT", "ACTIVE", "COMPLETED"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
  });
  if (!trening) return NextResponse.json({ error: "Treningsøkt ikke funnet" }, { status: 404 });

  const updated = await prisma.trainingSession.update({
    where: { id },
    data: { status: status as never },
  });

  return NextResponse.json(updated);
}
