import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-sm font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#22C55E] text-[#0A0F14] hover:bg-[#16A34A] shadow-sm shadow-[#22C55E]/20",
        secondary: "border border-[#22C55E] text-[#22C55E] bg-transparent hover:bg-[#22C55E]/10 normal-case tracking-normal",
        destructive: "bg-[#EF4444] text-white hover:bg-[#DC2626]",
        outline: "border border-[#2E4057] bg-[#141D26] text-[#F8FAFC] hover:bg-[#1E2D3D] normal-case tracking-normal",
        ghost: "text-[#94A3B8] hover:bg-[#1E2D3D] hover:text-[#F8FAFC] normal-case tracking-normal",
        link: "text-[#22C55E] underline-offset-4 hover:underline normal-case tracking-normal",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-8 rounded-[6px] px-3 text-xs",
        lg: "h-12 rounded-[8px] px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
