import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  logoClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
};

export default function BrandLogo({
  className,
  logoClassName,
  wordmarkClassName,
  showWordmark = true,
}: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!imageError ? (
        <img
          src="/logo.svg"
          alt="Bethelmind"
          className={cn("h-8 w-auto", logoClassName)}
          loading="eager"
          decoding="async"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60">
          <BarChart3 className="h-6 w-6 text-brand-blue" />
        </div>
      )}

      {showWordmark && (
        <span className={cn("font-display font-bold text-xl tracking-tight", wordmarkClassName)}>
          Bethelmind
        </span>
      )}
    </div>
  );
}

