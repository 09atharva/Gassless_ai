/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // SGIP Design Tokens
        neon: {
          blue:   '#3b82f6',
          cyan:   '#22d3ee',
          purple: '#8b5cf6',
          emerald:'#34d399',
          pink:   '#ec4899',
        },
        cyber: {
          dark:   '#030712',
          darker: '#020609',
          navy:   '#0f172a',
          card:   '#0d1b2a',
        },
        sgip: {
          primary:   '#3b82f6',
          secondary: '#22d3ee',
          accent:    '#8b5cf6',
          success:   '#34d399',
          warning:   '#fbbf24',
          error:     '#f87171',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'neon-blue':   '0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.15)',
        'neon-cyan':   '0 0 20px rgba(34,211,238,0.4), 0 0 40px rgba(34,211,238,0.15)',
        'neon-purple': '0 0 20px rgba(139,92,246,0.4), 0 0 40px rgba(139,92,246,0.15)',
        'glass':       '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.15)',
      },
      keyframes: {
        "accordion-down": { from: { height: 0 }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: 0 } },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(59,130,246,0.3)" },
          "50%":       { boxShadow: "0 0 35px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.3)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        "sgip-beam": {
          "0%":   { left: "-100%" },
          "100%": { left:  "200%" },
        },
        "count-up": {
          "from": { opacity: 0, transform: "translateY(10px)" },
          "to":   { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "float":          "float 3s ease-in-out infinite",
        "pulse-glow":     "pulse-glow 2s ease-in-out infinite",
        "shimmer":        "shimmer 3s linear infinite",
        "sgip-beam":      "sgip-beam 2s linear infinite",
        "count-up":       "count-up 0.6s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
