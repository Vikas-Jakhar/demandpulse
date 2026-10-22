import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-ink text-canvas hover:bg-ink/90 font-medium",
        signal:
          "bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-semibold shadow-md shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 hover:brightness-110 active:scale-[0.98] transition-all",
        outline:
          "border border-border bg-surface/80 text-ink hover:border-signal/50 hover:bg-surface-raised hover:text-white transition-all",
        ghost: "text-ink-muted hover:bg-surface-raised hover:text-white transition-colors",
        destructive: "bg-bad text-white hover:bg-bad/90 font-medium",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
