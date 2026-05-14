import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface LuxBentoCardProps {
  key?: string | number;
  title: string;
  description: string;
  className?: string;
  icon?: React.ReactNode;
  image?: string;
  href?: string;
  tag?: string;
  variant?: "default" | "gold" | "glass";
}

export default function LuxBentoCard({
  title,
  description,
  className,
  icon,
  image,
  href,
  tag,
  variant = "default"
}: LuxBentoCardProps) {
  const CardContent = (
    <div className="h-full w-full flex flex-col justify-between">
      <div>
        {tag && (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/60 mb-4 border border-white/5">
            {tag}
          </span>
        )}
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              {icon}
            </div>
          )}
          {href && (
            <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-500">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-foreground/50 leading-relaxed max-w-[280px]">
          {description}
        </p>
      </div>
      
      {image && (
        <div className="mt-8 relative aspect-video rounded-xl overflow-hidden border border-white/5">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/80 to-transparent opacity-60" />
        </div>
      )}
    </div>
  );

  const containerClasses = cn(
    "group relative p-8 rounded-[2.5rem] overflow-hidden transition-all duration-500",
    variant === "default" && "glass border-white/5 hover:border-white/10 hover:bg-white/[0.05]",
    variant === "gold" && "lux-border-gradient hover:shadow-gold",
    variant === "glass" && "bg-white/5 backdrop-blur-xl border-white/10",
    className
  );

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={containerClasses}
    >
      {/* Liquid Shiny Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ x: "-100%", opacity: 0 }}
          whileHover={{ x: "100%", opacity: 0.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      
      {href ? (
        <Link to={href} className="block h-full">
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}
    </motion.div>
  );
}
