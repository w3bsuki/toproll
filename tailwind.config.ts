import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const withAlpha = (variable: string) => `oklch(var(${variable}) / <alpha-value>)`;

/**
 * Design token driven Tailwind theme.
 * Tokens are expressed as CSS variables in src/app.css and surfaced here for utility classes.
 */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				neutral: {
					0: withAlpha('--color-neutral-0'),
					50: withAlpha('--color-neutral-50'),
					100: withAlpha('--color-neutral-100'),
					200: withAlpha('--color-neutral-200'),
					300: withAlpha('--color-neutral-300'),
					400: withAlpha('--color-neutral-400'),
					500: withAlpha('--color-neutral-500'),
					600: withAlpha('--color-neutral-600'),
					700: withAlpha('--color-neutral-700'),
					800: withAlpha('--color-neutral-800'),
					900: withAlpha('--color-neutral-900'),
					950: withAlpha('--color-neutral-950')
				},
				accent: {
					50: withAlpha('--color-accent-50'),
					100: withAlpha('--color-accent-100'),
					200: withAlpha('--color-accent-200'),
					300: withAlpha('--color-accent-300'),
					400: withAlpha('--color-accent-400'),
					500: withAlpha('--color-accent-500'),
					600: withAlpha('--color-accent-600'),
					700: withAlpha('--color-accent-700'),
					800: withAlpha('--color-accent-800'),
					900: withAlpha('--color-accent-900')
				},
				primary: {
					DEFAULT: withAlpha('--color-primary'),
					foreground: withAlpha('--color-on-primary')
				},
				success: {
					DEFAULT: withAlpha('--color-success'),
					foreground: withAlpha('--color-on-success')
				},
				warning: {
					DEFAULT: withAlpha('--color-warning'),
					foreground: withAlpha('--color-on-warning')
				},
				danger: {
					DEFAULT: withAlpha('--color-danger'),
					foreground: withAlpha('--color-on-danger')
				},
				background: withAlpha('--color-background'),
				foreground: withAlpha('--color-foreground'),
				muted: {
					DEFAULT: withAlpha('--color-muted'),
					foreground: withAlpha('--color-on-muted')
				},
				surface: {
					DEFAULT: withAlpha('--color-surface'),
					foreground: withAlpha('--color-on-surface'),
					raised: withAlpha('--color-surface-raised'),
					subdued: withAlpha('--color-surface-subdued')
				},
				border: {
					DEFAULT: withAlpha('--color-border'),
					strong: withAlpha('--color-border-strong')
				},
				input: withAlpha('--color-input'),
				ring: withAlpha('--color-ring'),
				focus: withAlpha('--color-focus')
			},
			borderRadius: {
				xs: 'var(--radius-xs)',
				sm: 'var(--radius-sm)',
				md: 'var(--radius-md)',
				lg: 'var(--radius-lg)',
				xl: 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)'
			},
			boxShadow: {
				'elevated-sm': 'var(--shadow-sm)',
				'elevated-md': 'var(--shadow-md)',
				'elevated-lg': 'var(--shadow-lg)'
			},
			fontFamily: {
				sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans]
			},
			fontSize: {
				xs: ['var(--font-size-xs)', 'var(--font-line-xs)'],
				sm: ['var(--font-size-sm)', 'var(--font-line-sm)'],
				base: ['var(--font-size-base)', 'var(--font-line-base)'],
				lg: ['var(--font-size-lg)', 'var(--font-line-lg)'],
				xl: ['var(--font-size-xl)', 'var(--font-line-xl)'],
				'2xl': ['var(--font-size-2xl)', 'var(--font-line-2xl)'],
				'3xl': ['var(--font-size-3xl)', 'var(--font-line-3xl)'],
				'4xl': ['var(--font-size-4xl)', 'var(--font-line-4xl)'],
				'5xl': ['var(--font-size-5xl)', 'var(--font-line-5xl)']
			},
			spacing: {
				'3xs': 'var(--space-3xs)',
				'2xs': 'var(--space-2xs)',
				xs: 'var(--space-xs)',
				sm: 'var(--space-sm)',
				md: 'var(--space-md)',
				lg: 'var(--space-lg)',
				xl: 'var(--space-xl)',
				'2xl': 'var(--space-2xl)',
				'3xl': 'var(--space-3xl)'
			},
			zIndex: {
				base: 'var(--z-base)',
				header: 'var(--z-header)',
				overlay: 'var(--z-overlay)',
				popover: 'var(--z-popover)'
			},
			transitionTimingFunction: {
				'ease-snappy': 'var(--easing-snappy)',
				'ease-relaxed': 'var(--easing-relaxed)'
			},
			transitionDuration: {
				swift: 'var(--duration-swift)',
				default: 'var(--duration-default)',
				gentle: 'var(--duration-gentle)'
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.96)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				}
			},
			animation: {
				'fade-in': 'fade-in var(--duration-default) ease-out both',
				'scale-in': 'scale-in var(--duration-gentle) var(--easing-relaxed) both'
			}
		}
	}
} satisfies Config;

export default config;
