import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import Seo from "@/components/Seo";
import { useContent } from "@/context/useContent";
import GlassContainer from "@/components/luxury/GlassContainer";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function Signup() {
  const navigate = useNavigate();
  const { cmsMeta } = useContent();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signupError) throw signupError;
      
      // Redirect to booking as a next step for lead qualification
      navigate("/booking?signup=success");
    } catch (err: any) {
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden mesh-gradient">
      <Seo
        title={cmsMeta["/signup"]?.title ?? "Client Portal Signup | Bethelmind Analytics"}
        description={cmsMeta["/signup"]?.description ?? "Create your Bethelmind Analytics client portal account."}
        canonicalPath="/signup"
      />

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <div className="lux-badge mb-6 mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Intelligence Portal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-gradient-gold">
            Create Your Account
          </h1>
          <p className="text-foreground/60">
            Already have a project? {" "}
            <Link to="/booking" className="text-primary hover:underline font-medium">Book a strategy session</Link>
          </p>
        </div>

        <GlassContainer className="p-8 sm:p-10 !rounded-[2.5rem]">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Email Address</label>
              <input
                type="email"
                required
                className="lux-input w-full"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Password</label>
              <input
                type="password"
                required
                className="lux-input w-full"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  Create Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-foreground/40 uppercase tracking-widest font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Enterprise-Grade Security Encrypted
          </div>
        </GlassContainer>

        <p className="mt-8 text-center text-sm text-foreground/40">
          By signing up, you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </section>
  );
}
