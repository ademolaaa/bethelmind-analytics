import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Award, 
  Copy, 
  CheckCircle, 
  ShieldCheck, 
  Send, 
  ChevronRight, 
  ExternalLink,
  Zap,
  BookOpen,
  ShoppingBag
} from "lucide-react";
import Seo from "@/components/Seo";

export default function AffiliatesPage() {
  const [salesCount, setSalesCount] = useState(15);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    trafficChannel: "WhatsApp Status",
    experience: "Intermediate (Have an active audience)"
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Earnings calculation: avg commission ~ ₦12,500
  const estimatedEarnings = (salesCount * 12500).toLocaleString();

  const products = [
    {
      title: "Commercial CleanTech & Energy Decision Makers Vault",
      category: "B2B Intelligence & Institutional Data",
      price: "₦650,000",
      payout: "₦325,000",
      epc: "High-Ticket B2B",
      link: "https://selar.com/7f767345z8"
    },
    {
      title: "VidRush AI Video Production & YouTube Automation Suite",
      category: "AI & Video Automation",
      price: "₦150,000",
      payout: "₦75,000",
      epc: "High Demand",
      link: "https://selar.com/51211i3071"
    },
    {
      title: "10,000+ Faceless Channel Prompts & Retention Templates",
      category: "Content Creation OS",
      price: "₦85,000",
      payout: "₦42,500",
      epc: "Viral Converting",
      link: "https://selar.com/51211i3071"
    },
    {
      title: "Clinical Somatic & Vagus Nerve Healing Workbook",
      category: "Health & Somatic Psychology",
      price: "₦35,000",
      payout: "₦17,500",
      epc: "Evergreen",
      link: "https://selar.com/wce1n77927"
    },
    {
      title: "1688 China Direct Factory Procurement Blueprint",
      category: "E-Commerce & Importation",
      price: "₦15,000",
      payout: "₦7,500",
      epc: "Fast Turnover",
      link: "https://selar.com/u2971g17q2"
    },
    {
      title: "CapCut Smartphone Video Editing & Reels Creator Kit",
      category: "Creator Skills",
      price: "₦12,000",
      payout: "₦6,000",
      epc: "Mass Market",
      link: "https://selar.com/m/oyelakintosin"
    }
  ];

  const swipeCopy = [
    {
      title: "WhatsApp Status / Broadcast (High-Engagement)",
      text: "How ordinary smartphone users are earning in 2026 without showing their face:\n\nI found this verified step-by-step digital masterclass that breaks down everything from AI video automation to foreign client retainers.\n\nCheck the verified curriculum and grab it here before the price increases: [YOUR_AFFILIATE_LINK]"
    },
    {
      title: "Twitter / X Thread Hook",
      text: "Most people are paying monthly subscriptions for software they barely use.\n\nHere is the exact blueprint & verified prompt templates top creators use to cut SaaS fees and automate faceless video channels:\n\n👉 [YOUR_AFFILIATE_LINK]"
    },
    {
      title: "Email Newsletter / Community Announcement",
      text: "Subject: [Exclusive] The 2026 Commercial CleanTech & Digital Production Playbook\n\nHey friend,\n\nIf you're looking for verified, high-yield digital toolkits that deliver immediate results, Bethelmind Analytics just opened creator access to their 2026 flagship suites.\n\nFull details and instant download access are available here: [YOUR_AFFILIATE_LINK]\n\nTo your growth,\n[Your Name]"
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      <Seo 
        title="Bethelmind Analytics — 50% Partner & Creator Affiliate Network" 
        description="Earn 50% instant recurring commissions promoting high-demand digital masterclasses, AI video toolkits, and verified B2B intelligence. Weekly automated bank payouts."
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-8">
          <Zap className="w-4 h-4 text-emerald-400" />
          Official Bethelmind Creator Partner Network
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
          Partner With Us &amp; Earn <span className="text-emerald-400">50% Commission</span> On Every Sale
        </h1>

        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10">
          Promote verified high-converting B2B datasets, AI video production suites, and somatic health masterclasses. Get paid weekly directly to your Nigerian bank account via Selar automated payouts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="#apply" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            Apply to Become a Partner <ChevronRight className="w-5 h-5" />
          </a>
          <a 
            href="https://selar.com/affiliates" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-slate-900 border border-slate-700 hover:border-slate-500 text-white transition-all flex items-center justify-center gap-2"
          >
            Join Selar Affiliate Network <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </section>

      {/* Key Guarantees */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <DollarSign className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-sm">50% Flat Split</h4>
              <p className="text-xs text-slate-400 mt-1">Earn ₦6,000 to ₦325,000 per single buyer referral.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <TrendingUp className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-sm">Weekly Automated Payouts</h4>
              <p className="text-xs text-slate-400 mt-1">Instant credits straight to your bank account via Selar.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-sm">60-Day Cookie Window</h4>
              <p className="text-xs text-slate-400 mt-1">If your referral buys anytime within 60 days, you get paid.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/40 border border-slate-800">
            <Award className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-white text-sm">Turnkey Swipes</h4>
              <p className="text-xs text-slate-400 mt-1">Ready-made WhatsApp scripts, emails, and social hooks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Interactive Earnings Calculator</h2>
            <p className="text-slate-400 text-sm">Estimate your monthly payouts based on modest promotion.</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-300">Sales Referred Per Month:</span>
              <span className="text-2xl font-extrabold text-emerald-400">{salesCount} Sales</span>
            </div>

            <input 
              type="range" 
              min="2" 
              max="50" 
              value={salesCount} 
              onChange={(e) => setSalesCount(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-xs text-slate-500">
              <span>2 Sales (Casual)</span>
              <span>15 Sales (Active Creator)</span>
              <span>50 Sales (Scale)</span>
            </div>

            <div className="pt-6 border-t border-slate-800 text-center">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Estimated Monthly Commission Payout</p>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400">
                ₦{estimatedEarnings} <span className="text-sm font-medium text-slate-400">NGN / month</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Based on mixed catalog average. High-ticket CleanTech referrals pay ₦325,000 per single transaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Product Catalog */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-3">High-Converting Digital Products You Can Sell</h2>
          <p className="text-slate-400">Every product includes instant digital delivery and zero customer support burden on your part.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 mb-3">
                  {p.category}
                </span>
                <h3 className="text-lg font-bold text-white mb-2 leading-snug">{p.title}</h3>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Product Price:</span>
                  <span className="font-semibold text-slate-200">{p.price}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-400 mb-4">
                  <span>Your 50% Cut:</span>
                  <span>{p.payout}</span>
                </div>
                <a 
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> View Product on Selar
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ready-to-use Swipe Copy */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-3">Copy-Paste Promotional Swipe Kit</h2>
          <p className="text-slate-400 text-sm">Tested templates designed for high conversion. Just add your affiliate link.</p>
        </div>

        <div className="space-y-6">
          {swipeCopy.map((s, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-emerald-400">{s.title}</span>
                <button 
                  onClick={() => handleCopy(s.text, idx)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
                >
                  {copiedIndex === idx ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Swipe
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800/80">
                {s.text}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* 1-Click Application Form */}
      <section id="apply" className="py-20 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Apply to Become a Verified Partner</h2>
            <p className="text-sm text-slate-400">Zero fees. Instant approval for active creators and marketers.</p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Application Received!</h3>
              <p className="text-xs text-slate-300">
                Your partnership application has been staged. Please visit <a href="https://selar.com/affiliates" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">selar.com/affiliates</a> to link your payout bank account. Our desk will email your custom promo kit within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Samuel Adekunle"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+234 800 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Promotion Channel</label>
                <select 
                  value={formData.trafficChannel}
                  onChange={(e) => setFormData({...formData, trafficChannel: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
                >
                  <option>WhatsApp Status / Broadcast Groups</option>
                  <option>YouTube Channel / Shorts</option>
                  <option>TikTok / Instagram Reels</option>
                  <option>Email Newsletter</option>
                  <option>Twitter / X Audience</option>
                  <option>Paid Advertising (Facebook/Google)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-6"
              >
                {submitting ? "Submitting Application..." : "Submit Partner Application"} <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-900 text-xs text-slate-500">
        &copy; 2026 Bethelmind Analytics Lagos Desk. Partner Support: bethelmindrecruit@gmail.com
      </footer>
    </div>
  );
}
