import Link from "next/link";
import { CalendarDays, Users, Dumbbell, LayoutDashboard, Activity } from "lucide-react";
import { getSession } from "@/lib/auth";
import LoggUtKnapp from "./LoggUtKnapp";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Oversikt", icon: LayoutDashboard },
  { href: "/dashboard/treninger", label: "Treningsøkter", icon: Dumbbell },
  { href: "/dashboard/lag", label: "Lag & Spillere", icon: Users },
  { href: "/dashboard/ukesplan", label: "Ukesplan", icon: CalendarDays },
  { href: "/dashboard/velvare", label: "Velvære", icon: Activity },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col">
      {/* Toppbar */}
      <header className="bg-[#0B0F1A]/80 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white">
          <span className="text-2xl">⚽</span>
          <span>Fotball<span className="text-[#4F7EFF]">KTA</span></span>
        </Link>
        <div className="flex items-center gap-3">
          {session && (
            <span className="text-xs text-[#4E5A72] hidden sm:block">{session.fullName}</span>
          )}
          <LoggUtKnapp />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidemeny (skjult på mobil) */}
        <aside className="hidden md:flex flex-col w-56 border-r border-white/[0.06] py-5 gap-1 shrink-0">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-white/[0.05] hover:text-white rounded-xl mx-2 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </aside>

        {/* Hovedinnhold */}
        <main className="flex-1 p-4 md:p-8 max-w-4xl pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Bunnmeny (kun mobil) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F1320]/95 backdrop-blur border-t border-white/[0.06] flex justify-around py-2 z-20">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 text-[#4E5A72] hover:text-white px-2 py-1 transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
