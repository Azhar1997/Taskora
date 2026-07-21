"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-semibold outline-none ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:translate-y-[-1px] hover:shadow-lg",
        secondary: "border bg-[var(--card-strong)] text-[var(--foreground)] hover:border-[var(--primary)]",
        ghost: "text-[var(--muted-foreground)] hover:bg-white/10 hover:text-[var(--foreground)]",
        danger: "bg-[var(--danger)] text-white hover:translate-y-[-1px]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);

Button.displayName = "Button";
