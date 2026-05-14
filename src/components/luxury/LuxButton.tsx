import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LuxButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const LuxButton = forwardRef<HTMLButtonElement, LuxButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 focus:ring-offset-2 focus:ring-offset-luxury-midnight",
          {
            "bg-luxury-gold text-luxury-midnight hover:bg-luxury-gold/90": variant === "primary",
            "bg-white/10 text-luxury-champagne backdrop-blur-md border border-white/10 hover:bg-white/20": variant === "secondary",
            "border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10": variant === "outline",
            "text-luxury-champagne hover:text-luxury-gold": variant === "ghost",
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {variant === "primary" && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shimmer" />
        )}
      </motion.button>
    );
  }
);

LuxButton.displayName = "LuxButton";

export default LuxButton;
