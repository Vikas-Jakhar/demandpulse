import type { Config } from "tailwindcss";

// Design tokens for DemandPulse.
// Direction: an operations-console aesthetic (think control-room / trading-desk),
// not the generic pastel SaaS-card kit. Deep graphite base, a single signal-amber
// accent reserved for forecast/attention states, and a cool cyan reserved for
// "actuals" data ink so the two series are never ambiguous on a chart.
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        canvas: "#0C0F13", // page background, near-black graphite (not pure #000)
        surface: "#12161C", // card/panel background
        "surface-raised": "#171C24",
        border: "#232A34",
        "border-soft": "#1B212A",

        // Text
        ink: "#E8EAED",
        "ink-muted": "#8A93A1",
        "ink-faint": "#5B6472",

        // Data-ink (reserved meanings — do not reuse for chrome)
        actual: "#4FD1C5", // teal-cyan: historical actuals
        forecast: "#F5A623", // signal amber: forecast / projection
        band: "#F5A62333", // translucent amber for CI bands
        good: "#3FBF7F",
        warn: "#E0B94C",
        bad: "#E5584F",

        // Brand accent (sparingly, for one hero moment per screen)
        signal: "#F5A623",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset",
      },
      keyframes: {
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 220ms ease-out",
        "fade-in": "fade-in 150ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
