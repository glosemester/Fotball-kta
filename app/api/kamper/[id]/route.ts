import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match || match.coach_id !== session.coachId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.match.update({
    where: { id },
    data: {
      ...(body.date !== undefined && { date: new Date(body.date) }),
      ...(body.opponent !== undefined && { opponent: body.opponent }),
      ...(body.is_home !== undefined && { is_home: body.is_home }),
      ...(body.location !== undefined && { location: body.location || null }),
      ...(body.competition !== undefined && { competition: body.competition || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.player_ids !== undefined && { player_ids: body.player_ids }),
      ...(body.team_id !== undefined && { team_id: body.team_id || null }),
    },
    include: { team: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match || match.coach_id !== session.coachId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.match.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
