import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, ChevronDown, Globe, ShieldCheck, Sparkles, Smartphone, Zap, Play } from "lucide-react";
import { useContent } from "@/context/useContent";
import Seo from "@/components/Seo";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import LuxBentoCard from "@/components/luxury/LuxBentoCard";
import RichText from "@/components/RichText";
import { resolveCmsIcon } from "@/lib/iconMap";
import { solutions, featuredSolutions } from "@/data/solutions";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const placeholderFrames = Array.from({ length: 24 }, (_, i) => (i % 2 === 0 ? "/images/lux-hero.svg" : "/images/lux-audit.svg"));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function Home() {
  const { content, isLoading, cmsMeta, cmsSolutions } = useContent();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-navy">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold" />
      </div>
    );
  }

  const featured =
    Array.isArray(cmsSolutions) && cmsSolutions.length > 0
      ? (cmsSolutions
          .filter((s) => s && typeof s === "object")
          .map((s) => {
            const anyS = s as Record<string, unknown>;
            const iconName = typeof anyS.iconName === "string" ? anyS.iconName : undefined;
            return { ...(anyS as unknown as typeof solutions[number]), icon: resolveCmsIcon(iconName) };
          })
          .filter((s) => (s as unknown as Record<string, unknown>).featured === true)
          .slice(0, 6) as unknown as typeof featuredSolutions)
      : featuredSolutions;

  return (
    <div className="bg-primary-navy text-foreground selection:bg-primary/30 selection:text-white overflow-hidden mesh-gradient">
      <Seo
        title={cmsMeta["/"]?.title ?? "Bethelmind Analytics | Premium Digital Solutions"}
        description={
          cmsMeta["/"]?.description ??
          "Elevating Nigerian businesses with world-class websites, automation, and data systems."
        }
        canonicalPath="/"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pro-section overflow-hidden">
        {/* Background Depth Orbs & Noise */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -40, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 -right-20 w-[60%] h-[60%] bg-accent/20 rounded-full blur-[160px]" 
          />
          {/* Grain/Noise Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="lux-badge mb-8 mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{content.socialProof.text}</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1] mb-8"
          >
            {content.hero.headlineStart} <br className="hidden sm:block" />
            <span className="text-gradient-gold">{content.hero.headlineEnd}</span>
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="mt-6 max-w-2xl mx-auto"
          >
            <RichText 
              html={content.hero.subheadline} 
              className="text-xl sm:text-2xl text-foreground/70 font-light leading-relaxed tracking-tight text-pretty" 
            />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <WhatsAppCTA source="home_hero_new">
              <button className="lux-button lux-button-primary group px-10">
                Start Transformation
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </WhatsAppCTA>
            <Link to="/booking">
              <button className="lux-button lux-button-secondary px-10 group">
                <Play className="w-4 h-4 fill-current mr-1 transition-transform group-hover:scale-110" />
                Apply for Strategy Session
              </button>
            </Link>
          </motion.div>
          
          {/* Hero UI Preview (Floating) */}
          <motion.div 
            variants={itemVariants}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden lux-border-gradient shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-primary-navy via-transparent to-transparent z-10" />
              <img 
                src="/images/lux-hero.svg" 
                alt="Elite Dashboard Preview" 
                className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-1000" 
              />
              
              {/* Floating Dashboard Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 z-20 glass p-5 rounded-2xl hidden md:block"
              >
                 <div className="flex items-center gap-3 mb-3">
                   <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Live Analytics</span>
                 </div>
                 <div className="text-2xl font-bold text-gradient-gold">₦2.4M</div>
                 <div className="text-[10px] text-foreground/40 font-medium">Conversion Value (24h)</div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 left-10 z-20 glass p-5 rounded-2xl hidden md:block"
              >
                 <div className="flex items-center gap-3 mb-1">
                   <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                     <Zap className="w-4 h-4 fill-current" />
                   </div>
                   <div>
                     <div className="text-xs font-bold uppercase">System Speed</div>
                     <div className="text-[10px] text-foreground/60">99.8th Percentile</div>
                   </div>
                 </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/40">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Scroll to Explore</span>
          <motion.div 
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </section>

      {/* Intro / Value Prop Section */}
      <section className="pro-section relative overflow-hidden">
        <div className="pro-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-6xl font-bold leading-[1.1] mb-8">
                Redefining Digital <br />
                <span className="text-gradient-gold">Standards in Nigeria</span>
              </h2>
              <p className="text-xl text-foreground/60 leading-relaxed mb-10 max-w-xl">
                We bridge the gap between local market realities and global digital standards. 
                Our solutions are built for speed, reliability, and elegance, ensuring your business stands out.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: ShieldCheck, title: "Enterprise Grade", desc: "Security and scalability built-in from day one." },
                  { icon: Globe, title: "Global Design", desc: "Aesthetics that compete on the international stage." },
                  { icon: Zap, title: "Lightning Fast", desc: "Optimized for Nigerian networks and devices." },
                  { icon: Smartphone, title: "Mobile First", desc: "Seamless experience across all screen sizes." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col gap-4 group aura-gold"
                  >
                    <div className="h-14 w-14 rounded-2xl glass flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-gold transition-all duration-500">
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1 tracking-tight text-gradient-silver group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-sm text-foreground/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
               <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[100px] transform rotate-12" />
               <div className="relative h-full w-full rounded-[3rem] overflow-hidden lux-border-gradient">
                 <img src="/images/lux-audit.svg" alt="Digital Excellence" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/80 to-transparent" />
                 
                 {/* Proof Element */}
                 <div className="absolute bottom-10 left-10 right-10">
                   <div className="glass p-6 rounded-2xl flex items-center justify-between">
                     <div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Impact Analysis</div>
                       <div className="text-2xl font-bold">400% Growth</div>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-navy">
                       <ArrowRight className="w-5 h-5" />
                     </div>
                   </div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solutions Showcase - Bento Grid Style */}
      <section className="pro-section relative">
        <div className="pro-container">
          <div className="max-w-3xl mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-6xl font-bold mb-6">Curated Solutions</h2>
              <p className="text-xl text-foreground/60 leading-relaxed">
                Tailored digital ecosystems designed for specific industry needs. From conversion funnels to enterprise CRM.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            {featured.map((solution, index) => {
              const isLarge = index === 0 || index === 3;
              return (
                <LuxBentoCard
                  key={solution.id}
                  title={solution.cardTitle}
                  description={solution.cardBenefit}
                  tag="Premium Edition"
                  href={`/solutions/${solution.id}`}
                  variant={isLarge ? "gold" : "default"}
                  className={cn(
                    isLarge ? "md:col-span-3 lg:col-span-6" : "md:col-span-3 lg:col-span-3"
                  )}
                  icon={solution.icon ? <solution.icon className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                  image="/images/lux-hero.svg"
                />
              );
            })}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
             <Link to="/solutions">
               <button className="lux-button lux-button-secondary px-12 group">
                 View All Solutions 
                 <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
             </Link>
          </motion.div>
        </div>
      </section>

      {/* Case Studies / Proof */}
      <section className="pro-section relative">
        <div className="pro-container">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
             <div className="lg:col-span-5">
               <motion.div
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 transition={{ duration: 1 }}
                 viewport={{ once: true }}
               >
                 <h2 className="text-4xl sm:text-6xl font-bold mb-8">Proven Impact</h2>
                 <p className="text-xl text-foreground/60 leading-relaxed mb-12">
                   Our partners experience tangible growth, streamlined operations, and enhanced brand perception.
                 </p>
                 <div className="flex flex-col gap-10">
                   <div className="flex flex-col">
                     <span className="text-6xl sm:text-8xl font-bold text-gradient-gold">100+</span>
                     <span className="text-xs uppercase tracking-[0.3em] font-bold text-foreground/40 mt-3">Projects Delivered</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-6xl sm:text-8xl font-bold text-gradient-gold">3x</span>
                     <span className="text-xs uppercase tracking-[0.3em] font-bold text-foreground/40 mt-3">Average ROI</span>
                   </div>
                 </div>
               </motion.div>
             </div>
             
             <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
               {content.caseStudies.items.slice(0, 4).map((study, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.8, delay: idx * 0.1 }}
                   viewport={{ once: true }}
                   className="p-8 rounded-[2.5rem] glass border-white/5 hover:border-primary/20 transition-all duration-700 hover:scale-[1.03] hover:bg-white/[0.04] relative group"
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-8">
                       <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl group-hover:scale-110 transition-transform duration-500">
                         {study.initial}
                       </div>
                       <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30">{study.industry}</span>
                     </div>
                     <p className="text-lg font-medium text-foreground/90 mb-8 leading-relaxed italic">"{study.quote}"</p>
                     <div className="flex items-center gap-3 text-primary text-sm font-bold uppercase tracking-[0.2em]">
                       <div className="h-px w-8 bg-primary/30" />
                       {study.result}
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative pro-section overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10 blur-[150px] transform translate-y-1/2" />
        <div className="pro-container">
          <div className="max-w-4xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter">
                Ready to <span className="text-gradient-gold">Elevate</span>?
              </h2>
              <p className="text-xl sm:text-2xl text-foreground/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed text-pretty">
                Join the elite circle of Nigerian businesses powered by Bethelmind Analytics. Let's build your legacy together.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <WhatsAppCTA source="home_cta_bottom">
                  <button className="lux-button lux-button-primary px-12 group">
                    Chat on WhatsApp
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </WhatsAppCTA>
                <Link to="/booking">
                  <button className="lux-button lux-button-secondary px-12">
                    Apply for Strategy Session
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
