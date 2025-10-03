import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				surface: {
					DEFAULT: 'var(--surface)',
					foreground: 'var(--surface-foreground)',
					muted: 'var(--surface-muted)',
					mutedForeground: 'var(--surface-muted-foreground)',
					accent: 'var(--surface-accent)',
					accentForeground: 'var(--surface-accent-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				border: {
					DEFAULT: 'var(--border)',
					strong: 'var(--border-strong)'
				},
				input: 'var(--input)',
				ring: 'var(--ring)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
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
					'0 1px 0 0 color-mix(in oklch, var(--border) 60%, transparent), 0 6px 16px -8px color-mix(in oklch, var(--border) 45%, transparent)',
				'marketplace-md':
					'0 1px 0 0 color-mix(in oklch, var(--border-strong) 55%, transparent), 0 14px 32px -20px color-mix(in oklch, var(--border-strong) 70%, transparent)',
				'marketplace-lg':
					'0 2px 0 0 color-mix(in oklch, var(--border-strong) 55%, transparent), 0 24px 48px -32px color-mix(in oklch, var(--border-strong) 65%, transparent)',
				'neo-sm': '2px 2px 0px rgba(0, 0, 0, 0.4)',
				neo: '4px 4px 0px rgba(0, 0, 0, 0.4)',
				'neo-lg': '6px 6px 0px rgba(0, 0, 0, 0.4)',
				'neo-active': '4px 4px 0px rgba(0, 0, 0, 0.4), 0 0 20px rgba(199, 255, 120, 0.3)'
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
