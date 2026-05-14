import { motion, Variants } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle, Sparkles } from "lucide-react";
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

export default function Contact() {
  const { content, cmsMeta } = useContent();
  const location = useLocation();
  const { contact } = content;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const hero = contact?.hero || { title: "Contact Us", subtitle: "We'd love to hear from you." };
  const info = contact?.info || { email: "support@bethelmind.com", phone: "+234 812 345 6789", address: "Nigeria (Remote-friendly)" };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const leadId = getLeadId();
    const locale = getPreferredLocale(location.search);
    const stage = getLeadScore().stage;

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

    recordTouchpoint("contact_submit");
    trackEvent("contact_submit", { source: "contact_form", path: `${location.pathname}${location.search}` });
    trackEvent("whatsapp_click", { source: "contact_form", path: `${location.pathname}${location.search}` });

    const urls = getWhatsAppUrls({ phoneDigits, text: message });
    window.location.assign(urls.universal);
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <div className="bg-luxury-midnight text-luxury-champagne font-body">
      <Seo
        title={cmsMeta["/contact"]?.title ?? "Contact | Bethelmind Analytics"}
        description={
          cmsMeta["/contact"]?.description ??
          "Talk to Bethelmind Analytics. Chat on WhatsApp, book a free strategy call, or send us a message for websites, automation, and dashboards."
        }
        canonicalPath="/contact"
        robots={cmsMeta["/contact"]?.robots || undefined}
        og={{ type: "website", image: cmsMeta["/contact"]?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      <section className="relative overflow-hidden pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-luxury-charcoal text-luxury-champagne">
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

        <div className="relative lux-container">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
              <div className="lux-pill w-fit mx-auto">
                <Sparkles className="h-4 w-4 text-luxury-gold" />
                Get in touch
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-gold">
                {hero.title}
              </h1>
              <RichText html={hero.subtitle} className="mt-4 text-lg sm:text-xl text-luxury-ivory/80 leading-relaxed" />
              <div className="mt-7 flex flex-col sm:flex-row gap-4 justify-center">
                <WhatsAppCTA
                  source="contact_hero"
                  className="!bg-luxury-gold !text-luxury-midnight hover:!bg-luxury-gold/90"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </WhatsAppCTA>
                <Link
                  to="/booking"
                  className="lux-btn-secondary"
                >
                  <Phone className="h-5 w-5" />
                  Apply for Strategy Session
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-luxury-midnight">
        <div className="lux-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-luxury-charcoal/50 backdrop-blur-sm rounded-lux-2xl p-8 border border-luxury-gold/20"
            >
              <h2 className="text-3xl font-display font-bold text-luxury-gold">Contact Information</h2>
              <p className="mt-3 text-lg text-luxury-champagne/80">
                Reach out to us through any of the following channels. We're here to help you grow your business.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lux-lg bg-luxury-sapphire text-luxury-champagne">
                      <Mail className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-luxury-gold">Email</h3>
                    <a href={`mailto:${info.email}`} className="text-base text-luxury-sapphire hover:underline">
                      {info.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lux-lg bg-luxury-sapphire text-luxury-champagne">
                      <Phone className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-luxury-gold">Phone</h3>
                    <a href={`tel:${info.phone}`} className="text-base text-luxury-sapphire hover:underline">
                      {info.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lux-lg bg-luxury-sapphire text-luxury-champagne">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-luxury-gold">Address</h3>
                    <p className="text-base text-luxury-champagne/80">{info.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="bg-luxury-charcoal/50 backdrop-blur-sm rounded-lux-2xl p-8 border border-luxury-gold/20">
                <h2 className="text-3xl font-display font-bold text-luxury-gold">Send a Message</h2>
                <p className="mt-3 text-lg text-luxury-champagne/80">
                  Have a question or a project in mind? Fill out the form and we'll get back to you.
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-luxury-champagne">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="lux-input"
                        placeholder="e.g. Ada Eze"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-luxury-champagne">
                      Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="lux-input"
                        placeholder="e.g. ada.eze@business.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-luxury-champagne">
                      Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="lux-input"
                        placeholder="How can we help you achieve your goals?"
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full lux-btn-primary"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Send via WhatsApp
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
