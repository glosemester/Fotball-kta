import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllAgeGroups } from "@/lib/rules-engine";
import { CalendarDays, Users, Dumbbell, Activity, ChevronRight, AlertTriangle } from "lucide-react";
import ageGroupsData from "@/lib/rules-engine/age-groups.json";
import type { AgeGroupKey } from "@/types";

const QUICK_LINKS = [
  { href: "/dashboard/treninger/ny", icon: Dumbbell, label: "Ny treningsøkt", color: "#4F7EFF", bg: "rgba(79,126,255,0.12)" },
  { href: "/dashboard/lag", icon: Users, label: "Lag & Spillere", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  { href: "/dashboard/ukesplan", icon: CalendarDays, label: "Ukesplan", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  { href: "/dashboard/velvare", icon: Activity, label: "Velvære", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
];

export default function DashboardPage() {
  const ageGroups = getAllAgeGroups();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">God dag, trener! 👋</h1>
        <p className="text-[#94A3B8] mt-1 text-sm">Her er en oversikt over dine lag og treninger.</p>
      </div>

      {/* Hurtiglenker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label, color, bg }) => (
          <Link key={href} href={href} className="group">
            <Card className="hover:border-white/[0.12] transition-all h-full hover:translate-y-[-2px]">
              <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-[#94A3B8] group-hover:text-white transition-colors leading-tight">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Velværepåminnelse */}
      <div className="bg-[#F59E0B]/8 border border-[#F59E0B]/20 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white">Velværeregistrering denne uken</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Husk å be spillere/foreldre registrere velvære før trening. Kun Grønn/Gul/Rød — ingen kroppsmål.
          </p>
        </div>
      </div>

      {/* Aldersgrupper */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Aldersspesifikke regler</h2>
          <span className="text-xs text-[#4E5A72]">NFF · SvFF · DBU</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ageGroups.map(({ key, label }) => (
            <Card key={key} className="hover:border-white/[0.12] transition-all cursor-pointer group hover:translate-y-[-1px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white text-sm">{label}</span>
                  <ChevronRight className="h-4 w-4 text-[#4E5A72] group-hover:text-[#4F7EFF] transition-colors" />
                </div>
                <AgeGroupSummary ageGroup={key as AgeGroupKey} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgeGroupSummary({ ageGroup }: { ageGroup: AgeGroupKey }) {
  const rules = ageGroupsData.age_groups_rules[ageGroup as keyof typeof ageGroupsData.age_groups_rules];
  if (!rules) return null;

  const headingVariant = rules.heading_rule === "forbidden" ? "red" : rules.heading_rule === "discouraged" ? "yellow" : "green";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{rules.recommended_game_form}</Badge>
        <Badge variant="secondary">Ball {rules.ball_size}</Badge>
        <Badge variant={headingVariant}>
          {rules.heading_rule === "forbidden" ? "⛔ Heading forbudt" : rules.heading_label}
        </Badge>
      </div>
      <p className="text-xs text-[#4E5A72]">Maks {rules.max_session_duration_minutes} min · {rules.sessions_per_week.min}–{rules.sessions_per_week.max} økt/uke</p>
    </div>
  );
}
