import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });

  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team || team.coach_id !== session.coachId) {
    return NextResponse.json({ error: "Ikke funnet" }, { status: 404 });
  }

  await prisma.team.update({ where: { id }, data: { is_active: false } });
  return NextResponse.json({ message: "Slettet" });
}
