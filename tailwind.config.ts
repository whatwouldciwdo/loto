import type { Config } from "tailwindcss"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                // Custom LOTO colors
                neon: {
                    DEFAULT: "#B9FF66",
                    50: "#F0FFE5",
                    100: "#E1FFCC",
                    200: "#D2FFB3",
                    300: "#C3FF99",
                    400: "#B9FF66",
                    500: "#A3FF33",
                    600: "#8AE600",
                    700: "#6BB300",
                    800: "#4C8000",
                    900: "#2D4D00",
                },
                dark: {
                    DEFAULT: "#191A23",
                    50: "#3A3B4A",
                    100: "#2F3041",
                    200: "#252638",
                    300: "#1F202F",
                    400: "#191A23",
                    500: "#13141A",
                    600: "#0D0E11",
                    700: "#070808",
                    800: "#000000",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
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
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "fade-in-up": {
                    from: { opacity: "0", transform: "translateY(20px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in-down": {
                    from: { opacity: "0", transform: "translateY(-20px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in-left": {
                    from: { opacity: "0", transform: "translateX(-30px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                "fade-in-right": {
                    from: { opacity: "0", transform: "translateX(30px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                "scale-in": {
                    from: { opacity: "0", transform: "scale(0.92)" },
                    to: { opacity: "1", transform: "scale(1)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-12px)" },
                },
                "pulse-neon": {
                    "0%, 100%": { boxShadow: "0 0 8px rgba(185, 255, 102, 0.3)" },
                    "50%": { boxShadow: "0 0 20px rgba(185, 255, 102, 0.6)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.5s ease-out both",
                "fade-in-up": "fade-in-up 0.6s ease-out both",
                "fade-in-down": "fade-in-down 0.6s ease-out both",
                "fade-in-left": "fade-in-left 0.6s ease-out both",
                "fade-in-right": "fade-in-right 0.6s ease-out both",
                "scale-in": "scale-in 0.5s ease-out both",
                "float": "float 4s ease-in-out infinite",
                "pulse-neon": "pulse-neon 2s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
