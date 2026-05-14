import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animate?: boolean;
}

export default function GlassContainer({ 
  children, 
  className, 
  delay = 0,
  animate = true 
}: GlassContainerProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      whileInView={animate ? { opacity: 1, y: 0 } : false}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] glass border border-white/5 bg-white/[0.02] backdrop-blur-2xl",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Decorative Orbs inside the container for depth */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
    </motion.div>
  );
}
