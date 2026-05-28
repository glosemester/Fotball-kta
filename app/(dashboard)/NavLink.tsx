"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors min-w-0 ${
        isActive ? "text-[#22C55E]" : "text-[#94A3B8] hover:text-[#22C55E]"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-[10px] font-semibold truncate">{label}</span>
    </Link>
  );
}
