import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllAgeGroups } from "@/lib/rules-engine";
import { CalendarDays, Users, Dumbbell, Activity, ChevronRight, AlertTriangle } from "lucide-react";
import ageGroupsData from "@/lib/rules-engine/age-groups.json";
import type { AgeGroupKey } from "@/types";
import { getLang, getDictionary, type Dict } from "@/lib/dict";

export default async function DashboardPage() {
  const lang = await getLang();
  const dict = await getDictionary(lang);
  const d = dict.dashboard;
  const ageGroups = getAllAgeGroups();

  const QUICK_LINKS = [
    { href: "/dashboard/treninger/ny", icon: Dumbbell, label: d.quick_new_session, color: "#2563EB", bg: "#EFF6FF" },
    { href: "/dashboard/lag",          icon: Users,     label: d.quick_teams,       color: "#16A34A", bg: "#F0FDF4" },
    { href: "/dashboard/ukesplan",     icon: CalendarDays, label: d.quick_weekplan, color: "#6D28D9", bg: "#F5F3FF" },
    { href: "/dashboard/velvare",      icon: Activity,  label: d.quick_wellbeing,   color: "#D97706", bg: "#FFFBEB" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">{d.greeting}</h1>
        <p className="text-[#64748B] mt-1 text-sm">{d.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label, color, bg }) => (
          <Link key={href} href={href} className="group">
            <Card className="hover:shadow-md transition-all h-full active:scale-[0.98]">
              <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#1A1A2E] transition-colors leading-tight">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="bg-[#FFFBEB] border border-[#D97706]/20 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#1A1A2E]">{d.wellbeing_reminder_title}</p>
          <p className="text-xs text-[#64748B] mt-0.5">{d.wellbeing_reminder_body}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1A1A2E]">{d.age_rules_title}</h2>
          <span className="text-xs text-[#94A3B8]">NFF · SvFF · DBU</span>
        </div>
        <div className="space-y-2">
          {ageGroups.map(({ key, label }) => (
            <Card key={key} className="hover:shadow-sm transition-all active:scale-[0.99]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#1A1A2E] text-sm">{label}</span>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                </div>
                <AgeGroupSummary ageGroup={key as AgeGroupKey} dict={dict} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgeGroupSummary({ ageGroup, dict }: { ageGroup: AgeGroupKey; dict: Dict }) {
  const rules = ageGroupsData.age_groups_rules[ageGroup as keyof typeof ageGroupsData.age_groups_rules];
  if (!rules) return null;

  const headingVariant = rules.heading_rule === "forbidden" ? "red" : rules.heading_rule === "discouraged" ? "yellow" : "green";
  const d = dict.dashboard;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{rules.recommended_game_form}</Badge>
        <Badge variant="secondary">Ball {rules.ball_size}</Badge>
        <Badge variant={headingVariant}>
          {rules.heading_rule === "forbidden" ? d.heading_forbidden : rules.heading_label}
        </Badge>
      </div>
      <p className="text-xs text-[#94A3B8]">
        {d.max_duration} {rules.max_session_duration_minutes} {dict.common.min} · {rules.sessions_per_week.min}–{rules.sessions_per_week.max} {d.sessions_per_week}
      </p>
    </div>
  );
}
