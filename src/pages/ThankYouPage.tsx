import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import WhatsAppCTA from '@/components/WhatsAppCTA';
import Seo from "@/components/Seo";

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type'); // 'booking' or 'audit'

  return (
    <section className="relative overflow-hidden lux-hero-gradient">
      <Seo
        title="Thank You | Bethelmind Analytics"
        description="Thanks for reaching out. Next steps are on this page."
        canonicalPath="/thank-you"
        robots="noindex,follow"
      />
      <div className="absolute inset-0 pointer-events-none lux-hero-grid opacity-[0.03]" />

      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl w-full text-center">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="lux-card lux-card-dark p-8 sm:p-10"
          >
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-luxury-emerald/15 border border-luxury-emerald/20 mb-7">
              <CheckCircle className="h-10 w-10 text-luxury-emerald" />
            </div>

            <h1 className="text-4xl font-bold text-luxury-champagne sm:text-5xl mb-5">
              {type === 'booking' ? 'Booking Confirmed!' : "You're All Set!"}
            </h1>
            <p className="text-lg text-luxury-champagne/75 mb-9 max-w-2xl mx-auto">
              {type === 'booking'
                ? "We've added the call to our calendar. Check your email for the meeting link."
                : "We've sent the checklist to your email. It should arrive in the next 5 minutes."}
            </p>

            <div className="rounded-2xl p-7 border border-white/10 bg-white/5 backdrop-blur mb-9">
              <h3 className="text-lg font-bold text-luxury-champagne mb-2">While you wait...</h3>
              <p className="text-luxury-champagne/75 mb-6">
                {type === 'booking'
                  ? "Have specific questions? You can chat with us immediately."
                  : "Want to skip the DIY and discuss your project immediately?"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <WhatsAppCTA
                  source={type === "booking" ? "thank_you:booking" : "thank_you:audit"}
                  service={type === "booking" ? "Booked a call" : "Requested audit checklist"}
                  className="lux-button w-full sm:w-auto"
                  experimentKey="wa_invite_copy_v1"
                  variants={["A", "B"] as const}
                >
                  <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
                </WhatsAppCTA>

                {type !== 'booking' && (
                  <Link
                    to="/booking"
                    className="lux-button-secondary w-full sm:w-auto"
                  >
                    Book Free Strategy Call <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>

            <Link to="/" className="text-luxury-champagne/70 hover:text-luxury-champagne font-semibold">
              &larr; Back to Homepage
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
