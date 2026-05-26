import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ChevronRight } from "lucide-react";
import OpprettLagForm from "./OpprettLagForm";

const AGE_LABELS: Record<string, string> = {
  AGE_6_7: "6–7 år",
  AGE_8_9: "8–9 år",
  AGE_10_12: "10–12 år",
  AGE_13_14: "13–14 år",
  AGE_15_16: "15–16 år",
  AGE_17_18: "17–18 år",
};

export default async function LagPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const teams = await prisma.team.findMany({
    where: { coach_id: session.coachId, is_active: true },
    include: { _count: { select: { players: { where: { is_active: true } } } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lag & Spillere</h1>
        <p className="text-gray-500 mt-1">Administrer dine lag og spillere.</p>
      </div>

      <OpprettLagForm />

      <div className="space-y-3">
        {teams.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Ingen lag ennå — opprett ditt første lag!</p>
          </div>
        ) : (
          teams.map((team) => (
            <Link key={team.id} href={`/dashboard/lag/${team.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{team.name}</p>
                      <p className="text-sm text-gray-500">
                        {team.club_name} · {AGE_LABELS[team.age_group]} · {team._count.players} spillere
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
