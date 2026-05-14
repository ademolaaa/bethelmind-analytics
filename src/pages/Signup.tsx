import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import { useContent } from "@/context/useContent";

export default function Signup() {
  const navigate = useNavigate();
  const { cmsMeta } = useContent();
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <section className="relative overflow-hidden bg-luxury-midnight min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <Seo
        title={cmsMeta["/signup"]?.title ?? "Client Portal Signup | Bethelmind Analytics"}
        description={
          cmsMeta["/signup"]?.description ??
          "Create a Bethelmind Analytics client portal account to manage your project. Prefer to start fast? Book a free strategy call."
        }
        canonicalPath="/signup"
        robots={cmsMeta["/signup"]?.robots || undefined}
        og={{ type: "website", image: cmsMeta["/signup"]?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Signup", path: "/signup" },
        ]}
      />
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/lux-hero.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.03]"
          decoding="async"
        />
        <div className="lux-hero-grid" />
        <div className="absolute -top-48 right-0 h-[34rem] w-[34rem] rounded-full bg-luxury-gold/10 blur-3xl" />
        <div className="absolute top-24 -left-24 h-[34rem] w-[34rem] rounded-full bg-luxury-sapphire/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center">
          <div className="lux-chip w-fit mx-auto">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            Client Portal
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-display font-bold tracking-tight text-luxury-champagne">
            Create your account
          </h1>
          <p className="mt-3 text-luxury-champagne/75">
            Already have a project in mind?{" "}
            <Link to="/booking" className="font-semibold text-luxury-gold hover:underline">
              Book a strategy call
            </Link>
            .
          </p>
        </div>

        <div className="mt-8 lux-card lux-card-dark p-7 sm:p-9">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/booking");
            }}
          >
            <div>
              <label htmlFor="email" className="lux-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="lux-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="password" className="lux-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="lux-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>

            <button type="submit" className="w-full lux-button">
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-luxury-champagne/60">
            This portal is currently a lightweight demo. For now, the button takes you to booking.
          </p>
        </div>
      </div>
    </section>
  );
}
