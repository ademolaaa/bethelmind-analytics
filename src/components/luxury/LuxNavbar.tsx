import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/BrandLogo";

export default function LuxNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Solutions", path: "/solutions" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-500 ease-in-out",
          scrolled ? "pt-2" : "pt-6"
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-between transition-all duration-700",
            scrolled
              ? "w-full max-w-5xl rounded-full py-2.5 px-8 glass shadow-gold/20 border-white/10"
              : "w-full max-w-7xl rounded-[2rem] bg-transparent border-transparent py-4 px-6 shadow-none"
          )}
        >
          {/* Subtle Glow Overlay when scrolled */}
          {scrolled && (
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl -z-10 animate-pulse" />
          )}
          {/* Logo */}
          <Link to="/" className="relative z-10 flex items-center gap-2 group">
            <BrandLogo className="h-7 w-auto transition-transform duration-300 group-hover:scale-110" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[13px] font-semibold uppercase tracking-widest transition-all duration-300 hover:text-primary relative py-2 group",
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground/70"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 w-full h-[2px] bg-primary transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100",
                  location.pathname === link.path && "scale-x-100"
                )} />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/booking">
              <button className="lux-button lux-button-primary !px-6 !py-2 !text-xs !min-h-[40px]">
                Book Call <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-10 p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-primary-navy/95 backdrop-blur-2xl flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-12">
               <BrandLogo className="h-7 w-auto" />
               <button onClick={() => setIsOpen(false)} className="p-2 glass rounded-full">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <nav className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-4xl font-bold hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    {link.name}
                    <ArrowRight className="w-8 h-8 opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-auto"
            >
              <Link to="/booking" onClick={() => setIsOpen(false)}>
                <button className="lux-button lux-button-primary w-full text-lg py-6">
                  Book Strategy Call
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
