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
        // Base surfaces — Premium Orange & Black theme
        canvas: "#0B0B0D", // Deep pitch black page background
        surface: "#151518", // Secondary card/panel background
        "surface-raised": "#1C1C22",
        border: "#26262E",
        "border-soft": "#1E1E26",

        // Text — White & light gray
        ink: "#FFFFFF",
        "ink-muted": "#E2E8F0",
        "ink-faint": "#94A3B8",

        // Brand Orange accents
        signal: "#FF6A00", // Primary orange
        "signal-light": "#FF9D2E", // Gradient accent light orange
        "signal-hover": "#E65F00",

        // Data-ink (reserved meanings)
        actual: "#38BDF8", // cool sky blue for historical actuals
        forecast: "#FF6A00", // primary orange for forecast
        band: "rgba(255, 106, 0, 0.2)", // translucent orange for CI bands
        good: "#10B981",
        warn: "#F59E0B",
        bad: "#EF4444",
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
        glow: "0 0 25px -5px rgba(255, 106, 0, 0.35)",
        "glow-lg": "0 0 45px -5px rgba(255, 106, 0, 0.45)",
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
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 220ms ease-out",
        "fade-in": "fade-in 150ms ease-out",
        ticker: "ticker 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
