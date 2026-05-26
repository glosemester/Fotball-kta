import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/15",
        secondary: "bg-[#F1F5F9] text-[#64748B] border border-[#E4E2F5]",
        destructive: "bg-[#DC2626]/8 text-[#DC2626] border border-[#DC2626]/15",
        outline: "text-[#64748B] border border-[#E4E2F5]",
        green: "bg-[#16A34A]/8 text-[#16A34A] border border-[#16A34A]/15",
        yellow: "bg-[#D97706]/8 text-[#D97706] border border-[#D97706]/15",
        red: "bg-[#DC2626]/8 text-[#DC2626] border border-[#DC2626]/15",
        blue: "bg-[#2563EB]/8 text-[#2563EB] border border-[#2563EB]/15",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
