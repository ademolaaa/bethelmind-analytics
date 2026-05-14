import { Users, Target, Heart } from "lucide-react";
import { useContent } from "../context/useContent";
import { motion, Variants } from "framer-motion";
import Seo from "@/components/Seo";
import RichText from "@/components/RichText";

export default function About() {
  const { content, cmsMeta } = useContent();
  const { about } = content;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  // Fallback if data is missing
  const hero = about?.hero || { title: "About Bethelmind Analytics", subtitle: "Mission to democratize data." };
  const mission = about?.mission || { 
    title: "Our Mission", 
    description: "Data is the lifeblood...", 
    values: [] 
  };

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case "Target": return <Target className="h-6 w-6" />;
      case "Users": return <Users className="h-6 w-6" />;
      case "Heart": return <Heart className="h-6 w-6" />;
      default: return <Target className="h-6 w-6" />;
    }
  };

  return (
    <div className="bg-luxury-midnight text-luxury-champagne font-body">
      <Seo
        title={cmsMeta["/about"]?.title ?? "About | Bethelmind Analytics"}
        description={
          cmsMeta["/about"]?.description ??
          "We build websites, automation, and analytics systems for Nigerian SMEs. Learn our mission, values, and how we deliver measurable growth."
        }
        canonicalPath="/about"
        robots={cmsMeta["/about"]?.robots || undefined}
        og={{ type: "website", image: cmsMeta["/about"]?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
      {/* Hero Section */}
      <div className="relative bg-luxury-charcoal text-luxury-champagne py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/images/lux-hero.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.03]"
            decoding="async"
          />
          <div className="lux-hero-grid" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute -top-48 right-0"
          >
            <div className="h-[38rem] w-[38rem] rounded-full bg-luxury-gold/10 blur-3xl" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="absolute top-24 -left-24"
          >
            <div className="h-[38rem] w-[38rem] rounded-full bg-luxury-sapphire/10 blur-3xl" />
          </motion.div>
        </div>
        <div className="lux-container text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-display font-bold tracking-tight text-luxury-gold sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <RichText html={hero.subtitle} className="mt-6 max-w-2xl mx-auto text-xl text-luxury-ivory/80" />
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 sm:py-24 bg-luxury-midnight relative">
        <div className="lux-container">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="bg-luxury-charcoal/50 backdrop-blur-sm rounded-lux-2xl p-8 border border-luxury-gold/20"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl font-display font-bold text-luxury-gold tracking-tight sm:text-4xl">
                {mission.title}
              </motion.h2>
              <motion.div variants={fadeInUp}>
                <RichText html={mission.description} className="mt-6 max-w-3xl text-lg text-luxury-champagne/80 leading-relaxed" />
              </motion.div>
            </motion.div>
            <motion.div 
              className="mt-12 lg:mt-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <div className="space-y-10">
                {mission.values.map((value, index) => (
                  <motion.div key={index} variants={fadeInUp} className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lux-lg bg-luxury-sapphire text-luxury-champagne">
                        {getIcon(value.icon)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-bold text-luxury-gold">{value.title}</h3>
                      <p className="mt-2 text-base text-luxury-champagne/80">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
