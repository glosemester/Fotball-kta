import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
        secondary: "bg-[#1E2D3D] text-[#94A3B8] border border-[#2E4057]",
        destructive: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
        outline: "text-[#94A3B8] border border-[#2E4057]",
        green: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
        yellow: "bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20",
        red: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
        blue: "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20",
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
