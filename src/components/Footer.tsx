import { Twitter, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useContent } from "../context/useContent";
import BrandLogo from "@/components/BrandLogo";
import RichText from "@/components/RichText";

export default function Footer() {
  const { content } = useContent();
  
  // Fallback to ensure no crashes if content isn't fully loaded yet
  const footerData = content.footer || {
     companyName: "Bethelmind",
     description: "Empowering businesses with data-driven insights and advanced analytics solutions.",
     copyright: `© ${new Date().getFullYear()} Bethelmind Analytics. All rights reserved.`,
     columns: [
       { title: "Product", links: [] },
       { title: "Company", links: [] }
     ]
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <footer className="bg-luxury-midnight text-luxury-champagne border-t border-white/10 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-32 h-[34rem] w-[34rem] rounded-full bg-luxury-sapphire/10 blur-3xl" />
        <div className="absolute top-10 right-0 h-[30rem] w-[30rem] rounded-full bg-luxury-gold/10 blur-3xl" />
        <div className="lux-hero-grid opacity-[0.03]" />
      </div>

      <div className="lux-container relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
              <BrandLogo showWordmark={false} />
              <span className="font-display font-semibold text-xl text-luxury-champagne">{footerData.companyName}</span>
            </Link>
            <RichText html={footerData.description} className="text-luxury-champagne/70 text-sm leading-relaxed mb-6 max-w-xs" />
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full text-luxury-champagne/70 hover:text-luxury-champagne bg-white/5 hover:bg-white/10 transition-all border border-luxury-gold/15">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full text-luxury-champagne/70 hover:text-luxury-champagne bg-white/5 hover:bg-white/10 transition-all border border-luxury-gold/15">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full text-luxury-champagne/70 hover:text-luxury-champagne bg-white/5 hover:bg-white/10 transition-all border border-luxury-gold/15">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
          
          {footerData.columns && footerData.columns.map((col, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h3 className="text-sm font-semibold text-luxury-champagne tracking-wider uppercase mb-6">{col.title}</h3>
              <ul className="space-y-4">
                {col.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    {link.href.startsWith('/') ? (
                      <Link to={link.href} className="text-luxury-champagne/70 hover:text-luxury-champagne text-sm transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-luxury-gold/40 group-hover:bg-luxury-gold transition-colors" />
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-luxury-champagne/70 hover:text-luxury-champagne text-sm transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-luxury-gold/40 group-hover:bg-luxury-gold transition-colors" />
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-luxury-champagne tracking-wider uppercase mb-6">Stay Updated</h3>
            <p className="text-sm text-luxury-champagne/70 mb-4">
              Get occasional insights on growth systems, automation, and conversion.
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="lux-input"
                />
              </div>
              <button 
                type="submit"
                className="lux-button w-full"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-luxury-champagne/60">
            {footerData.copyright}
          </p>
          <div className="flex gap-6 text-sm text-luxury-champagne/60">
            <Link to="/privacy" className="hover:text-luxury-champagne transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-luxury-champagne transition-colors">Terms of Service</Link>
            <button
              type="button"
              className="hover:text-luxury-champagne transition-colors"
              onClick={() => window.dispatchEvent(new Event("bm_open_consent"))}
            >
              Cookie Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
