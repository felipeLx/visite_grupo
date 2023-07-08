import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme.js'
import tailwindcssRadix from 'tailwindcss-radix'

export default {
	content: ['./app/**/*.{ts,tsx,jsx,js}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: {
					DEFAULT: 'hsl(var(--input))',
					invalid: 'hsl(var(--input-invalid))',
				},
				ring: {
					DEFAULT: 'hsl(var(--ring))',
					invalid: 'hsl(var(--foreground-danger))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				background: 'hsl(var(--color-background))',
				foreground: 'hsl(var(--color-foreground))',

				brand: {
					primary: {
						DEFAULT: 'hsl(var(--color-brand-primary))',
						muted: 'hsl(var(--color-brand-primary-muted))',
					},
					secondary: {
						DEFAULT: 'hsl(var(--color-brand-secondary))',
						muted: 'hsl(var(--color-brand-secondary-muted))',
					},
					tertiary: 'hsl(var(--color-brand-tertiary))',
				},
				danger: 'hsl(var(--color-danger))',
				day: {
					100: 'hsl(var(--color-day-100))',
					200: 'hsl(var(--color-day-200))',
					300: 'hsl(var(--color-day-300))',
					400: 'hsl(var(--color-day-400))',
					500: 'hsl(var(--color-day-500))',
					600: 'hsl(var(--color-day-600))',
					700: 'hsl(var(--color-day-700))',
				},
				night: {
					100: 'hsl(var(--color-night-100))',
					200: 'hsl(var(--color-night-200))',
					300: 'hsl(var(--color-night-300))',
					400: 'hsl(var(--color-night-400))',
					500: 'hsl(var(--color-night-500))',
					600: 'hsl(var(--color-night-600))',
					700: 'hsl(var(--color-night-700))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: [
					'Nunito Sans',
					'Nunito Sans Fallback',
					...defaultTheme.fontFamily.sans,
				],
			},
			fontSize: {
				// 1rem = 16px
				/** 80px size / 84px high / bold */
				mega: ['5rem', { lineHeight: '5.25rem', fontWeight: '700' }],
				/** 56px size / 62px high / bold */
				h1: ['3.5rem', { lineHeight: '3.875rem', fontWeight: '700' }],
				/** 40px size / 48px high / bold */
				h2: ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
				/** 32px size / 36px high / bold */
				h3: ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
				/** 28px size / 36px high / bold */
				h4: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
				/** 24px size / 32px high / bold */
				h5: ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
				/** 16px size / 20px high / bold */
				h6: ['1rem', { lineHeight: '1.25rem', fontWeight: '700' }],

				/** 32px size / 36px high / normal */
				'body-2xl': ['2rem', { lineHeight: '2.25rem' }],
				/** 28px size / 36px high / normal */
				'body-xl': ['1.75rem', { lineHeight: '2.25rem' }],
				/** 24px size / 32px high / normal */
				'body-lg': ['1.5rem', { lineHeight: '2rem' }],
				/** 20px size / 28px high / normal */
				'body-md': ['1.25rem', { lineHeight: '1.75rem' }],
				/** 16px size / 20px high / normal */
				'body-sm': ['1rem', { lineHeight: '1.25rem' }],
				/** 14px size / 18px high / normal */
				'body-xs': ['0.875rem', { lineHeight: '1.125rem' }],
				/** 12px size / 16px high / normal */
				'body-2xs': ['0.75rem', { lineHeight: '1rem' }],

				/** 18px size / 24px high / semibold */
				caption: ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
				/** 12px size / 16px high / bold */
				button: ['0.75rem', { lineHeight: '1rem', fontWeight: '700' }],
			},
		},
	},
	keyframes: {
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        contentShow: {
          from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
		slideUpAndFade: {
			from: { opacity: 0, transform: 'translateY(2px)' },
			to: { opacity: 1, transform: 'translateY(0)' },
		  },
		  slideRightAndFade: {
			from: { opacity: 0, transform: 'translateX(-2px)' },
			to: { opacity: 1, transform: 'translateX(0)' },
		  },
		  slideDownAndFade: {
			from: { opacity: 0, transform: 'translateY(-2px)' },
			to: { opacity: 1, transform: 'translateY(0)' },
		  },
		  slideLeftAndFade: {
			from: { opacity: 0, transform: 'translateX(2px)' },
			to: { opacity: 1, transform: 'translateX(0)' },
		  },
	},
	animation: {
	overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
	contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
	slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
	slideRightAndFade: 'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
	slideDownAndFade: 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
	slideLeftAndFade: 'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
	},
	plugins: [tailwindcssRadix],
} satisfies Config
