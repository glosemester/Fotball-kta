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
    <div className="min-h-screen flex flex-col">
      {/* Toppbar */}
      <header className="bg-green-800 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">⚽</span>
          <span>Fotball-KTA</span>
        </Link>
        <div className="flex items-center gap-3">
          {session && (
            <span className="text-xs text-green-200 hidden sm:block">{session.fullName}</span>
          )}
          <LoggUtKnapp />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidemeny (skjult på mobil) */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 py-6 gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-800 rounded-lg mx-2 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </aside>

        {/* Hovedinnhold */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl">
          {children}
        </main>
      </div>

      {/* Bunnmeny (kun mobil) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-green-700 px-2 py-1"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
