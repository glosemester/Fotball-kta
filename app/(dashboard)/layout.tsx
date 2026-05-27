import Link from "next/link";
import { CalendarDays, Users, Dumbbell, LayoutDashboard, Activity, Settings } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import LoggUtKnapp from "./LoggUtKnapp";
import LangSwitcher from "./LangSwitcher";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const lang = await getLang();
  const dict = await getDictionary(lang);

  const coach = session
    ? await prisma.coach.findUnique({
        where: { id: session.coachId },
        select: { features: true },
      })
    : null;

  const enabledFeatures = coach?.features ?? [];

  const navItems = [
    { href: "/dashboard",           label: dict.nav.overview,  icon: LayoutDashboard },
    { href: "/dashboard/treninger", label: dict.nav.training,  icon: Dumbbell },
    { href: "/dashboard/lag",       label: dict.nav.teams,     icon: Users },
    { href: "/dashboard/ukesplan",  label: dict.nav.weekplan,  icon: CalendarDays },
    ...(enabledFeatures.includes("wellbeing")
      ? [{ href: "/dashboard/velvare", label: dict.nav.wellbeing, icon: Activity }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#F0EEFF] flex flex-col">
      <header className="bg-white border-b border-[#E4E2F5] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-[#1A1A2E]">
          <span className="text-2xl">⚽</span>
          <span>Pitch<span className="text-[#6D28D9]">Plan</span></span>
        </Link>
        <div className="flex items-center gap-1">
          {session && (
            <span className="text-xs text-[#94A3B8] hidden sm:block mr-2">{session.fullName}</span>
          )}
          <LangSwitcher current={lang} />
          <Link
            href="/dashboard/innstillinger"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#94A3B8] hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition-colors"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <LoggUtKnapp label={dict.nav.logout} />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-2xl w-full mx-auto pb-52">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E2F5] flex justify-around py-1.5 z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 text-[#94A3B8] hover:text-[#6D28D9] px-3 py-1 transition-colors min-w-0"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-semibold truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
