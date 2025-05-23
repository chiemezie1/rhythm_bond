/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5', // Indigo-600
          dark: '#4338ca',    // Indigo-700
          light: '#6366f1',   // Indigo-500
        },
        secondary: {
          DEFAULT: '#ec4899', // Pink-500
          dark: '#db2777',    // Pink-600
          light: '#f472b6',   // Pink-400
        },
        background: {
          DEFAULT: '#121220', // Main background
          dark: '#0c0c14',    // Darker areas
          light: '#1e1e2a',   // Slightly lighter than dark
          card: '#1a1a28',    // Card backgrounds
          elevated: '#252536', // Elevated elements
        },
        text: {
          primary: '#ffffff',
          secondary: '#a5a6ba',
          tertiary: '#6c6d80',
          disabled: '#4a4b5c',
        },
        success: '#10b981', // Green-500
        warning: '#f59e0b', // Amber-500
        error: '#ef4444',   // Red-500
        info: '#3b82f6',    // Blue-500

        // Legacy colors for compatibility
        dark: {
          DEFAULT: '#121220',
          lighter: '#1a1a28',
          lightest: '#252536',
        },
        light: {
          DEFAULT: '#FFFFFF',
          darker: '#F7F7F7',
          darkest: '#EEEEEE',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      gridTemplateColumns: {
        'dashboard': '1fr 3fr 1fr', // For the 3-column dashboard layout
      },
      height: {
        'player': '70px', // Height for the player bar
        'topbar': '56px', // Height for the top navigation bar
      },
      padding: {
        'topbar': '56px', // Padding for the top navigation bar
        'player': '70px', // Padding for the player bar
        'footer': '200px', // Padding for the footer
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode with class instead of media query
}
