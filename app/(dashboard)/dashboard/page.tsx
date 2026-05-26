import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllAgeGroups } from "@/lib/rules-engine";
import { CalendarDays, Users, Dumbbell, Activity, ArrowRight, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const ageGroups = getAllAgeGroups();

  return (
    <div className="space-y-8">
      {/* Velkomst */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">God dag, trener! 👋</h1>
        <p className="text-gray-500 mt-1">Her er en oversikt over laget og kommende treninger.</p>
      </div>

      {/* Hurtiglenker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/treninger/ny" className="group">
          <Card className="hover:shadow-md transition-shadow border-green-100 bg-green-50 h-full">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <Dumbbell className="h-7 w-7 text-green-700 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-green-800">Ny treningsøkt</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/lag" className="group">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <Users className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-800">Lag & Spillere</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/ukesplan" className="group">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <CalendarDays className="h-7 w-7 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-800">Ukesplan</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/velvare" className="group">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <Activity className="h-7 w-7 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-800">Velvære</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Aldersgrupper oversikt */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Aldersspesifikke regler</h2>
          <span className="text-xs text-gray-500">Basert på NFF/SvFF/DBU-retningslinjer</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ageGroups.map(({ key, label }) => (
            <Link key={key} href={`/dashboard/regler/${key}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{label}</CardTitle>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-700 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <AgeGroupSummary ageGroup={key as "6-7" | "8-9" | "10-12" | "13-14" | "15-16" | "17-18"} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Viktig påminnelse */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Velværeregistrering denne uken</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Husk å be spillere/foreldre registrere velvære før trening. Ingen måling av kropper —
              kun Grønn/Gul/Rød.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import ageGroupsData from "@/lib/rules-engine/age-groups.json";
import type { AgeGroupKey } from "@/types";

function AgeGroupSummary({ ageGroup }: { ageGroup: AgeGroupKey }) {
  const rules = ageGroupsData.age_groups_rules[ageGroup as keyof typeof ageGroupsData.age_groups_rules];
  if (!rules) return null;

  const headingVariant =
    rules.heading_rule === "forbidden"
      ? "red"
      : rules.heading_rule === "discouraged"
      ? "yellow"
      : "green";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary">{rules.recommended_game_form}</Badge>
        <Badge variant="secondary">Ball {rules.ball_size}</Badge>
        <Badge variant="secondary">{rules.sessions_per_week.min === rules.sessions_per_week.max ? `${rules.sessions_per_week.min} økt/uke` : `${rules.sessions_per_week.min}–${rules.sessions_per_week.max} økt/uke`}</Badge>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant={headingVariant}>Heading: {rules.heading_label}</Badge>
      </div>
      <p className="text-xs text-gray-500">Maks {rules.max_session_duration_minutes} min per økt</p>
    </div>
  );
}
