import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			fontFamily: {
				sans: [...fontFamily.sans]
			},
			animation: {
				"fade-in": "fadeIn 0.3s ease-in-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
			},
		}
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#1e40af",
					"primary-content": "#ffffff",
					"secondary": "#f3f4f6",
					"secondary-content": "#1f2937",
					"accent": "#4b5563",
					"accent-content": "#ffffff",
					"neutral": "#e5e7eb",
					"neutral-content": "#1f2937",
					"base-100": "#ffffff",
					"base-200": "#f9fafb",
					"base-300": "#f3f4f6",
					"base-content": "#1f2937",
					"info": "#3b82f6",
					"info-content": "#ffffff",
					"success": "#10b981",
					"success-content": "#ffffff",
					"warning": "#f59e0b",
					"warning-content": "#ffffff",
					"error": "#ef4444",
					"error-content": "#ffffff",
					"--rounded-box": "0.5rem",
					"--rounded-btn": "0.3rem",
					"--rounded-badge": "0.3rem",
					"--animation-btn": "0.3s",
					"--animation-input": "0.2s",
					"--btn-focus-scale": "0.95",
					"--border-btn": "1px",
					"--tab-border": "1px",
					"--tab-radius": "0.3rem",
				},
				dark: {
					"primary": "#e5e7eb", // Light grey for primary elements
					"primary-content": "#121212", // Dark text on primary buttons
					"secondary": "#374151", // Darker grey for secondary elements
					"secondary-content": "#f9fafb", // Light text on secondary elements
					"accent": "#94a3b8", // Medium grey for accents
					"accent-content": "#121212", // Dark text on accent elements
					"neutral": "#1f2937", // Dark grey for neutral elements
					"neutral-content": "#f9fafb", // Light text on neutral elements
					"base-100": "#121212", // Very dark background
					"base-200": "#1a1a1a", // Slightly lighter dark background
					"base-300": "#242424", // Lighter dark background for hover effects
					"base-content": "#f3f4f6", // Light grey text
					"info": "#a5b4fc", // Light indigo for info
					"info-content": "#121212", // Dark text on info
					"success": "#86efac", // Light green for success
					"success-content": "#121212", // Dark text on success
					"warning": "#fcd34d", // Amber for warning
					"warning-content": "#121212", // Dark text on warning
					"error": "#f87171", // Light red for error
					"error-content": "#121212", // Dark text on error
					"--rounded-box": "0.5rem",
					"--rounded-btn": "0.3rem",
					"--rounded-badge": "0.3rem",
					"--animation-btn": "0.3s",
					"--animation-input": "0.2s",
					"--btn-focus-scale": "0.95",
					"--border-btn": "1px",
					"--tab-border": "1px",
					"--tab-radius": "0.3rem",
				}
			}
		],
		darkTheme: "dark",
		base: true,
		styled: true,
		utils: true,
		prefix: "",
		logs: false,
		themeRoot: ":root",
	},
};

export default config;
