import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Twitter, Linkedin, Instagram } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const footerLinks = {
  product: [
    { name: "Solutions", href: "/solutions" },
    { name: "Pricing", href: "/pricing" },
    { name: "Case Studies", href: "/#case-studies" },
    { name: "Reviews", href: "/reviews" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
  ],
  social: [
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "GitHub", icon: Github, href: "#" },
  ],
};

export default function LuxFooter() {
  return (
    <footer className="relative bg-primary-navy pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-12">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-block mb-6">
              <BrandLogo className="h-8 w-auto text-neutral-white" />
            </Link>
            <p className="text-lg text-neutral-white/80 max-w-md leading-relaxed mb-6">
              Empowering Nigerian businesses with world-class digital infrastructure. 
              Built for speed, scale, and sophistication.
            </p>
            <div className="flex gap-3">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-white/60 hover:text-accent-gold hover:border-accent-gold/30 hover:bg-white/10 transition-all duration-300"
                  aria-label={item.name}
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg text-neutral-white mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-white/60 hover:text-accent-gold transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-white mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-white/60 hover:text-accent-gold transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold text-lg text-neutral-white mb-4">Stay Ahead</h3>
              <p className="text-sm text-neutral-white/60 mb-3">
                Join our newsletter for exclusive insights on digital growth.
              </p>
              <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="pro-input"
                />
                <button className="pro-button pro-button-primary pro-button-sm">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-white/40">
            &copy; {new Date().getFullYear()} Bethelmind Analytics. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-neutral-white/40 hover:text-neutral-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
