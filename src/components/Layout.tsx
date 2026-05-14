import { ReactNode } from "react";
import LuxNavbar from "./luxury/LuxNavbar";
import LuxFooter from "./luxury/LuxFooter";
import WhatsAppButton from "./WhatsAppButton";
import ExitIntentPopup from "./ExitIntentPopup";
import CookieConsentBanner from "./CookieConsentBanner";
import { useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import SmoothScroll from "./SmoothScroll";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-luxury-midnight text-luxury-champagne relative overflow-x-hidden selection:bg-luxury-gold/30 selection:text-luxury-champagne">
        <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.10),transparent_55%),radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.14),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.10),transparent_50%)]" />
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="fixed top-[-10%] left-[-10%] w-[44%] h-[44%] bg-luxury-gold/5 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[44%] h-[44%] bg-luxury-sapphire/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <a className="lux-skip-link relative z-50" href="#main-content">
          Skip to content
        </a>
        <LuxNavbar />
        
        <main id="main-content" className="flex-grow relative z-10 w-full" tabIndex={-1}>
          <LayoutGroup>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${location.pathname}${location.search}`}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>
        </main>
        
        <LuxFooter />
        
        <WhatsAppButton />
        <ExitIntentPopup />
        <CookieConsentBanner />
      </div>
    </SmoothScroll>
  );
}
