/**
 * Theme configuration for the RhythmBond app
 * This file contains color schemes, spacing, and other design tokens
 */

export const colors = {
  // Primary brand colors
  primary: {
    light: '#6366f1', // Indigo-500
    DEFAULT: '#4f46e5', // Indigo-600
    dark: '#4338ca', // Indigo-700
  },
  
  // Secondary accent colors
  secondary: {
    light: '#f472b6', // Pink-400
    DEFAULT: '#ec4899', // Pink-500
    dark: '#db2777', // Pink-600
  },
  
  // Background colors
  background: {
    light: '#1e1e2a', // Slightly lighter than dark
    DEFAULT: '#121220', // Main background
    dark: '#0c0c14', // Darker areas
    card: '#1a1a28', // Card backgrounds
    elevated: '#252536', // Elevated elements
  },
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#a5a6ba',
    tertiary: '#6c6d80',
    disabled: '#4a4b5c',
  },
  
  // Status colors
  success: '#10b981', // Green-500
  warning: '#f59e0b', // Amber-500
  error: '#ef4444', // Red-500
  info: '#3b82f6', // Blue-500
  
  // Gradient presets
  gradients: {
    primary: 'linear-gradient(to right, #4f46e5, #6366f1)',
    secondary: 'linear-gradient(to right, #ec4899, #f472b6)',
    dark: 'linear-gradient(to right, #0c0c14, #121220)',
    card: 'linear-gradient(135deg, #1a1a28, #252536)',
  },
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  xxl: '3rem',   // 48px
};

export const borderRadius = {
  sm: '0.25rem', // 4px
  md: '0.5rem',  // 8px
  lg: '1rem',    // 16px
  xl: '1.5rem',  // 24px
  full: '9999px', // Fully rounded
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
};

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    xxl: '1.5rem',   // 24px
    xxxl: '2rem',    // 32px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

export const animations = {
  transition: {
    fast: 'all 0.15s ease',
    medium: 'all 0.3s ease',
    slow: 'all 0.5s ease',
  },
};

const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  breakpoints,
  animations,
};

export default theme;
