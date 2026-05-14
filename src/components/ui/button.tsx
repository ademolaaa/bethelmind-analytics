import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default:
    "lux-button",
  secondary:
    "lux-button-secondary",
  outline:
    "inline-flex items-center justify-center rounded-2xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-luxury-champagne hover:bg-white/5 transition",
  ghost:
    "inline-flex items-center justify-center rounded-2xl bg-transparent px-3 py-2 text-sm font-semibold text-luxury-champagne hover:bg-white/5 transition",
  destructive:
    "inline-flex items-center justify-center rounded-2xl bg-luxury-burgundy text-white px-4 py-2.5 text-sm font-semibold hover:brightness-110 transition",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm py-2 px-3",
  md: "text-sm py-2.5 px-4",
  lg: "text-base py-3.5 px-5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
});
