"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
  isSidebar?: boolean;
}

export default function NavLink({ href, label, icon, isSidebar = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  if (isSidebar) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors min-w-0 ${
          isActive ? "bg-[#0A84FF]/10 text-[#0A84FF] font-semibold" : "text-[#8E8E93] hover:text-[#FFFFFF] hover:bg-[#2C2C2E]"
        }`}
      >
        {icon}
        <span className="text-sm font-medium truncate">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors min-w-0 ${
        isActive ? "text-[#0A84FF]" : "text-[#8E8E93] hover:text-[#0A84FF]"
      }`}
    >
      {icon}
      <span className="text-[10px] font-semibold truncate">{label}</span>
    </Link>
  );
}
