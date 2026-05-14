import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default:
    "inline-flex items-center rounded-full bg-luxury-sapphire text-white px-3 py-1 text-xs font-semibold",
  secondary:
    "inline-flex items-center rounded-full bg-white/10 text-luxury-champagne px-3 py-1 text-xs font-semibold border border-white/15",
  destructive:
    "inline-flex items-center rounded-full bg-luxury-burgundy text-white px-3 py-1 text-xs font-semibold",
  outline:
    "inline-flex items-center rounded-full bg-transparent text-luxury-champagne px-3 py-1 text-xs font-semibold border border-white/20",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = "default", ...props },
  ref
) {
  return <span ref={ref} className={cn(variantClasses[variant], className)} {...props} />;
});
