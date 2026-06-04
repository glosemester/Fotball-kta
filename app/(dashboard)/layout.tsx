import Link from "next/link";
import { CalendarDays, Calendar, Users, Dumbbell, LayoutDashboard, Activity, Settings } from "lucide-react";
import PitchPlanLogo from "@/components/PitchPlanLogo";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import LoggUtKnapp from "./LoggUtKnapp";
import LangSwitcher from "./LangSwitcher";
import NavLink from "./NavLink";

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
    ...(enabledFeatures.includes("wellbeing")
      ? [{ href: "/dashboard/velvare", label: dict.nav.wellbeing, icon: Activity }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#000000] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#38383A] bg-[#1C1C1E] sticky top-0 h-screen z-20">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-[#FFFFFF]">
            <PitchPlanLogo size={32} />
            <span>Pitch<span className="text-[#0A84FF]">Plan</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} label={label} icon={<Icon className="h-5 w-5 shrink-0" />} isSidebar={true} />
          ))}
        </nav>

        <div className="p-4 border-t border-[#38383A]">
          <div className="flex items-center justify-between mb-4">
            <LangSwitcher current={lang} />
            <Link
              href="/dashboard/innstillinger"
              className="flex items-center justify-center w-8 h-8 rounded-full text-[#8E8E93] hover:text-[#0A84FF] hover:bg-[#2C2C2E] transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
          {session && (
            <div className="mb-4">
              <p className="text-xs text-[#8E8E93] font-medium uppercase tracking-wide">Innlogget som</p>
              <p className="text-sm text-[#FFFFFF] font-semibold truncate">{session.fullName}</p>
            </div>
          )}
          <LoggUtKnapp label={dict.nav.logout} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#1C1C1E] border-b border-[#38383A] px-4 py-3 flex items-center justify-between sticky top-0 z-20 glass-panel">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg text-[#FFFFFF]">
            <PitchPlanLogo size={28} />
            <span>Pitch<span className="text-[#0A84FF]">Plan</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <LangSwitcher current={lang} />
            <Link
              href="/dashboard/innstillinger"
              className="flex items-center justify-center w-8 h-8 rounded-full text-[#8E8E93] hover:text-[#0A84FF] hover:bg-[#2C2C2E] transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <LoggUtKnapp label="" />
          </div>
        </header>

        <main className="flex-1 px-4 pt-4 md:px-8 md:pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-[#38383A] flex justify-around py-1.5 z-20 pb-[env(safe-area-inset-bottom)]">
          {navItems.map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} label={label} icon={<Icon className="h-5 w-5 shrink-0" />} isSidebar={false} />
          ))}
        </nav>
      </div>
    </div>
  );
}
