import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserRound } from "lucide-react";
import LeggTilSpillerForm from "./LeggTilSpillerForm";
import SlettSpillerKnapp from "./SlettSpillerKnapp";

const AGE_LABELS: Record<string, string> = {
  AGE_6_7: "6–7 år",
  AGE_8_9: "8–9 år",
  AGE_10_12: "10–12 år",
  AGE_13_14: "13–14 år",
  AGE_15_16: "15–16 år",
  AGE_17_18: "17–18 år",
};

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Keeper",
  DEFENDER: "Forsvarer",
  MIDFIELDER: "Midtbane",
  FORWARD: "Angriper",
  UNASSIGNED: "Ikke satt",
};

export default async function LagDetaljPage({
  params,
}: {
  params: Promise<{ lagId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { lagId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: lagId },
    include: {
      players: {
        where: { is_active: true },
        orderBy: { last_name: "asc" },
      },
    },
  });

  if (!team || team.coach_id !== session.coachId) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/lag" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-gray-500 text-sm">
            {team.club_name} · {AGE_LABELS[team.age_group]}
          </p>
        </div>
      </div>

      <LeggTilSpillerForm teamId={team.id} />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {team.players.length} {team.players.length === 1 ? "spiller" : "spillere"}
        </p>
        {team.players.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <UserRound className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Ingen spillere ennå — legg til den første!</p>
          </div>
        ) : (
          team.players.map((player) => (
            <Card key={player.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-1.5 rounded-full">
                    <UserRound className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Født {player.birth_year} · {POSITION_LABELS[player.position]}
                    </p>
                  </div>
                </div>
                <SlettSpillerKnapp playerId={player.id} teamId={team.id} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
