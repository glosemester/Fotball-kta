import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; spillerId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const { spillerId } = await params;
  const player = await prisma.player.findUnique({
    where: { id: spillerId },
    include: { team: true },
  });

  if (!player || player.team.coach_id !== session.coachId) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  await prisma.player.update({ where: { id: spillerId }, data: { is_active: false } });
  return NextResponse.json({ message: "Fjernet" });
}
