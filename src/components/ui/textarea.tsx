import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full px-3 py-2 rounded-md border border-luxury-gold/20 bg-white/90 text-luxury-midnight placeholder-luxury-graphite/60 focus:outline-none focus:ring-2 focus:ring-luxury-sapphire",
        className
      )}
      {...props}
    />
  );
});
