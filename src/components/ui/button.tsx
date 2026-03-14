import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:saturate-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-black/25 hover:bg-[hsl(var(--primary-hover))] active:bg-[hsl(var(--primary-active))]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm shadow-black/20 hover:bg-destructive/90",
        outline:
          "border border-input bg-card/40 text-foreground shadow-sm shadow-black/15 hover:bg-accent hover:border-primary/20",
        secondary: "bg-secondary text-secondary-foreground shadow-sm shadow-black/20 hover:bg-secondary/85",
        ghost: "text-foreground/90 hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-[hsl(var(--primary-hover))]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 rounded-md px-4",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
