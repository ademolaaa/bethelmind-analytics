import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2 rounded-md border border-luxury-gold/20 bg-white/90 text-luxury-midnight placeholder-luxury-graphite/60 focus:outline-none focus:ring-2 focus:ring-luxury-sapphire",
        className
      )}
      {...props}
    />
  );
});
