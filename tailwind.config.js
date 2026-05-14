import { colors, fonts } from './src/lib/design-system';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      screens: {
        "lux-320": "320px",
        "lux-768": "768px",
        "lux-1024": "1024px",
        "lux-1440": "1440px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        ...colors,
        brand: {
          navy: "#0A0F1F",
          blue: "#0E2A6D",
          teal: "#14B8A6",
          gold: "#D4AF37",
          cream: "#F8F1E7",
          charcoal: "#111418",
        },
        primary: {
          DEFAULT: colors["luxury-midnight"],
          light: colors["luxury-sapphire"],
          dark: "#020c1b",
          foreground: colors["luxury-champagne"],
        },
        secondary: {
          DEFAULT: colors["luxury-gold"],
          light: "#E8B4B8", // Luxury Rose Gold
          dark: "#B87333", // Luxury Copper
          foreground: colors["luxury-midnight"],
        },
        accent: {
          DEFAULT: colors["luxury-champagne"],
          foreground: colors["luxury-midnight"],
        },
        muted: {
          DEFAULT: colors["luxury-graphite"],
          foreground: "#E5E7EB", // Luxury Platinum
        },
        card: {
          DEFAULT: "rgba(247, 243, 233, 0.95)", // Luxury Champagne with transparency
          foreground: colors["luxury-midnight"],
        },
      },
      fontFamily: {
        sans: [fonts.body, "ui-sans-serif", "system-ui", "sans-serif"],
        display: [fonts.heading, "ui-serif", "Georgia", "serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1.1" }],
        "9xl": ["8rem", { lineHeight: "1.1" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "lux-sm": "0.5rem",
        "lux-md": "1rem",
        "lux-lg": "1.5rem",
        "lux-xl": "2rem",
        "lux-2xl": "2.5rem",
        "lux-3xl": "3rem",
      },
      spacing: {
        "lux-xs": "0.25rem", // 4px
        "lux-sm": "0.5rem",  // 8px
        "lux-md": "1rem",    // 16px
        "lux-lg": "1.5rem",  // 24px
        "lux-xl": "2rem",    // 32px
        "lux-2xl": "3rem",   // 48px
        "lux-3xl": "4rem",   // 64px
        "lux-4xl": "6rem",   // 96px
        "lux-5xl": "8rem",   // 128px
        "lux-6xl": "12rem",  // 192px
      },
      boxShadow: {
        "lux-sm": "0 1px 2px 0 rgba(13, 17, 23, 0.05), 0 1px 3px 0 rgba(13, 17, 23, 0.1)",
        "lux-md": "0 4px 6px -1px rgba(13, 17, 23, 0.1), 0 2px 4px -1px rgba(13, 17, 23, 0.06)",
        "lux-lg": "0 10px 15px -3px rgba(13, 17, 23, 0.1), 0 4px 6px -2px rgba(13, 17, 23, 0.05)",
        "lux-xl": "0 20px 25px -5px rgba(13, 17, 23, 0.1), 0 10px 10px -5px rgba(13, 17, 23, 0.04)",
        "lux-2xl": "0 25px 50px -12px rgba(13, 17, 23, 0.25)",
        "lux-inner": "inset 0 2px 4px 0 rgba(13, 17, 23, 0.06)",
        "lux-glow": "0 0 40px -10px rgba(212, 175, 55, 0.3)",
        "lux-gold": "0 0 30px -5px rgba(212, 175, 55, 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0px rgba(212,175,55,0.0)" },
          "50%": { boxShadow: "0 0 24px rgba(212,175,55,0.35)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
