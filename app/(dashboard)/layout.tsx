import Link from "next/link";
import { CalendarDays, Users, Dumbbell, LayoutDashboard, Activity } from "lucide-react";
import { getSession } from "@/lib/auth";
import LoggUtKnapp from "./LoggUtKnapp";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Oversikt", icon: LayoutDashboard },
  { href: "/dashboard/treninger", label: "Treninger", icon: Dumbbell },
  { href: "/dashboard/lag", label: "Lag", icon: Users },
  { href: "/dashboard/ukesplan", label: "Ukesplan", icon: CalendarDays },
  { href: "/dashboard/velvare", label: "Velvære", icon: Activity },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#F0EEFF] flex flex-col">
      {/* Toppbar */}
      <header className="bg-white border-b border-[#E4E2F5] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-[#1A1A2E]">
          <span className="text-2xl">⚽</span>
          <span>Fotball<span className="text-[#6D28D9]">KTA</span></span>
        </Link>
        <div className="flex items-center gap-3">
          {session && (
            <span className="text-xs text-[#94A3B8] hidden sm:block">{session.fullName}</span>
          )}
          <LoggUtKnapp />
        </div>
      </header>

      {/* Hovedinnhold */}
      <main className="flex-1 p-4 md:p-6 max-w-2xl w-full mx-auto pb-36">
        {children}
      </main>

      {/* Fast bunnmeny — app-stil for alle skjermstørrelser */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E2F5] flex justify-around py-2 z-20 safe-area-pb shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 text-[#94A3B8] hover:text-[#6D28D9] px-3 py-1.5 transition-colors min-w-0"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-semibold truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
