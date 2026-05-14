import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, Link } from "react-router-dom";
import { useContent } from "../context/useContent";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getPreferredLocale } from "@/lib/i18n";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getLeadScore, recordTouchpoint } from "@/lib/leadScore";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { buildWhatsAppMessage, getWhatsAppUrls, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import Seo from "@/components/Seo";
import RichText from "@/components/RichText";
import GlassContainer from "@/components/luxury/GlassContainer";
import { supabase } from "@/lib/supabase";

export default function Contact() {
  const { content, cmsMeta } = useContent();
  const location = useLocation();
  const { contact } = content;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hero = contact?.hero || { title: "Contact Us", subtitle: "We'd love to hear from you." };
  const info = contact?.info || { email: "support@bethelmind.com", phone: "+234 812 345 6789", address: "Nigeria (Remote-friendly)" };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const leadId = getLeadId();
    const locale = getPreferredLocale(location.search);
    const stage = getLeadScore().stage;

    try {
      // 1. Capture in Supabase
      await supabase.from('leads').insert([{
        email: formData.email,
        full_name: formData.name,
        source: 'contact_form',
        data: { 
          message: formData.message,
          first_touch: getFirstTouch(),
          last_touch: getLastTouch(),
          lead_id: leadId,
          stage
        }
      }]);

      // 2. Track Analytics
      recordTouchpoint("contact_submit");
      trackEvent("contact_submit", { source: "contact_form" });

      // 3. Prepare WhatsApp Redirect
      const phoneDigits = normalizeWhatsAppPhone(info.phone || "+234 812 345 6789");
      const message = buildWhatsAppMessage({
        locale,
        leadId,
        source: "contact_form",
        stage,
        extraLines: [
          `Name: ${formData.name}`,
          `Email: ${formData.email}`,
          "Message:",
          formData.message,
        ],
        firstTouch: getFirstTouch(),
        lastTouch: getLastTouch(),
      });

      setSubmitted(true);
      
      // Delay redirect to show success state
      setTimeout(() => {
        const urls = getWhatsAppUrls({ phoneDigits, text: message });
        window.location.assign(urls.universal);
      }, 1500);

    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary-navy text-foreground selection:bg-primary/30 min-h-screen mesh-gradient">
      <Seo
        title={cmsMeta["/contact"]?.title ?? "Contact | Bethelmind Analytics"}
        description={cmsMeta["/contact"]?.description ?? "Talk to Bethelmind Analytics."}
        canonicalPath="/contact"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-accent/10 rounded-full blur-[160px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="lux-badge mb-8 mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6 text-gradient-gold">
              {hero.title}
            </h1>
            <RichText html={hero.subtitle} className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed" />
          </motion.div>
        </div>
      </section>

      <section className="pb-32 px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-8"
          >
            <GlassContainer className="p-10 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Direct Channels</h2>
                <p className="text-foreground/50">Experience priority support through our dedicated business lines.</p>
              </div>

              <div className="space-y-8">
                {[
                  { icon: Mail, label: "Email", val: info.email, href: `mailto:${info.email}` },
                  { icon: Phone, label: "Phone", val: info.phone, href: `tel:${info.phone}` },
                  { icon: MapPin, label: "Headquarters", val: info.address, href: "#" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-5 group">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-foreground/30 mb-1">{item.label}</div>
                      <a href={item.href} className="text-lg font-medium hover:text-primary transition-colors">{item.val}</a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5">
                <WhatsAppCTA source="contact_sidebar" className="lux-button lux-button-primary w-full">
                  <MessageCircle className="w-5 h-5" />
                  Instant WhatsApp Support
                </WhatsAppCTA>
              </div>
            </GlassContainer>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <GlassContainer className="p-10">
              {submitted ? (
                <div className="py-20 text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-3xl font-bold">Message Received</h2>
                  <p className="text-foreground/60 max-w-sm mx-auto">
                    We've captured your inquiry in our system. Redirecting you to WhatsApp for an instant conversation...
                  </p>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-8">Send an Inquiry</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          className="lux-input w-full"
                          placeholder="e.g. Tunde Johnson"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          className="lux-input w-full"
                          placeholder="tunde@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Message</label>
                      <textarea
                        rows={5}
                        required
                        className="lux-input w-full resize-none"
                        placeholder="Tell us about your project or vision..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button 
                      disabled={loading}
                      className="lux-button lux-button-primary w-full group py-4 h-auto"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Submit & Continue to WhatsApp
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </GlassContainer>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
