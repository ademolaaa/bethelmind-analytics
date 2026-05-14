import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { luxTransition, luxTransitionFast, luxTransitionSlow } from "@/lib/motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(
    () => [
      { name: "Solutions", path: "/solutions" },
      { name: "Free Audit", path: "/free-audit" },
      { name: "Pricing", path: "/pricing" },
      { name: "Playbooks", path: "/blog" }, // Playbooks maps to Blog for now
      { name: "About", path: "/about" },
      { name: "Contact", path: "/contact" },
    ],
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if (e.key !== "Tab") return;
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
        return;
      }
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav
        className={cn(
          "relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled 
            ? "lux-nav bg-luxury-midnight/70 backdrop-blur-xl border-b border-white/5 shadow-2xl py-3" 
            : "bg-transparent border-b border-transparent py-6"
        )}
      >
        <div className="lux-container">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group relative z-50" aria-label="Go to homepage">
              <BrandLogo className="h-8 w-auto text-white" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  (location.pathname.startsWith(`${link.path}/`) && link.path !== "/");
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "group relative text-sm font-semibold tracking-wide transition-colors after:absolute after:-bottom-2 after:left-1/2 after:h-px after:w-8 after:-translate-x-1/2 after:bg-gradient-to-r after:from-transparent after:via-luxury-gold after:to-transparent after:transition-opacity",
                      isActive
                        ? "text-luxury-champagne after:opacity-100"
                        : "text-luxury-champagne/70 hover:text-luxury-champagne after:opacity-0 group-hover:after:opacity-100"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/30 bg-luxury-gold/15 px-5 py-2.5 text-sm font-semibold text-luxury-champagne shadow-lg shadow-black/25 hover:bg-luxury-gold/20 transition-colors"
              >
                Book Call <ArrowRight className="h-4 w-4 text-luxury-gold" />
              </Link>
              <WhatsAppCTA
                source="navbar_primary"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-luxury-champagne hover:bg-white/10 transition-colors"
                showFallbackLink={false}
              >
                Chat on WhatsApp
              </WhatsAppCTA>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden p-2 text-luxury-champagne hover:bg-white/5 rounded-full transition-colors relative z-50"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-luxury-midnight/95 lg:hidden pt-24 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 items-center text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-2xl font-display font-semibold text-luxury-champagne hover:text-luxury-gold transition-colors",
                      location.pathname === link.path ? "text-luxury-gold" : ""
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-4 w-full mt-8"
              >
                 <WhatsAppCTA
                  source="navbar_mobile"
                  className="w-full inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-4 font-semibold text-luxury-champagne text-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Chat on WhatsApp
                </WhatsAppCTA>
                <Link
                  to="/booking"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center rounded-2xl border border-luxury-gold/30 bg-luxury-gold/15 px-5 py-4 font-semibold text-luxury-champagne text-lg hover:bg-luxury-gold/20 transition-colors"
                >
                  Book Free Strategy Call
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
