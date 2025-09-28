import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				background: 'oklch(var(--background) / <alpha-value>)',
				foreground: 'oklch(var(--foreground) / <alpha-value>)',
				card: {
					DEFAULT: 'oklch(var(--card) / <alpha-value>)',
					foreground: 'oklch(var(--card-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'oklch(var(--popover) / <alpha-value>)',
					foreground: 'oklch(var(--popover-foreground) / <alpha-value>)'
				},
				surface: {
					DEFAULT: 'oklch(var(--surface) / <alpha-value>)',
					foreground: 'oklch(var(--surface-foreground) / <alpha-value>)',
					muted: 'oklch(var(--surface-muted) / <alpha-value>)',
					mutedForeground: 'oklch(var(--surface-muted-foreground) / <alpha-value>)',
					accent: 'oklch(var(--surface-accent) / <alpha-value>)',
					accentForeground: 'oklch(var(--surface-accent-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
					foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
				},
				border: {
					DEFAULT: 'oklch(var(--border) / <alpha-value>)',
					strong: 'oklch(var(--border-strong) / <alpha-value>)'
				},
				input: 'oklch(var(--input) / <alpha-value>)',
				ring: 'oklch(var(--ring) / <alpha-value>)',
				primary: {
					DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
					foreground: 'oklch(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
					foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
					foreground: 'oklch(var(--accent-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
					foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)'
				},
				success: {
					DEFAULT: 'oklch(var(--success) / <alpha-value>)',
					foreground: 'oklch(var(--success-foreground) / <alpha-value>)'
				},
				info: {
					DEFAULT: 'oklch(var(--info) / <alpha-value>)',
					foreground: 'oklch(var(--info-foreground) / <alpha-value>)'
				},
				warning: {
					DEFAULT: 'oklch(var(--warning) / <alpha-value>)',
					foreground: 'oklch(var(--warning-foreground) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)'
			},
			fontFamily: {
				sans: ['Inter Variable', ...defaultTheme.fontFamily.sans]
			},
			boxShadow: {
				'marketplace-sm':
					'0 1px 0 0 oklch(var(--border) / 0.6), 0 6px 16px -8px oklch(var(--border) / 0.45)',
				'marketplace-md':
					'0 1px 0 0 oklch(var(--border-strong) / 0.55), 0 14px 32px -20px oklch(var(--border-strong) / 0.7)',
				'marketplace-lg':
					'0 2px 0 0 oklch(var(--border-strong) / 0.55), 0 24px 48px -32px oklch(var(--border-strong) / 0.65)'
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem'
			},
			transitionTimingFunction: {
				'market-ease': 'cubic-bezier(0.32, 0.72, 0, 1)'
			},
			transitionDuration: {
				subtle: '150ms',
				default: '220ms',
				accent: '280ms'
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(12px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'fade-in': 'fade-in 200ms ease-out both',
				'slide-up': 'slide-up 220ms cubic-bezier(0.32, 0.72, 0, 1) both'
			}
		}
	}
} satisfies Config;

export default config;
