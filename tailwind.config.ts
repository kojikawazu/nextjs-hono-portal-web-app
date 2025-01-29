import type { Config } from 'tailwindcss';

export default {
    darkMode: ['class'],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: '#4ADE80',
                    hover: '#86EFAC',
                    dark: '#22C55E',
                },
                secondary: {
                    DEFAULT: '#1E293B',
                    foreground: '#F8FAFC',
                },
                dark: {
                    DEFAULT: '#0F172A',
                    lighter: '#1E293B',
                },
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-slow': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.5s ease-out',
                'fade-in-slow': 'fade-in-slow 0.8s ease-out',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
} satisfies Config;
