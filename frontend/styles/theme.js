// frontend/styles/theme.js - Design Tokens & Theme System
// Futuristic, professional, eye-comfortable color palette

export const theme = {
  // Color Palette - Futuristic but Professional
  colors: {
    // Primary Colors (Violet-based - no default blue)
    primary: '#7C3AED',        // Violet
    primaryLight: '#A78BFA',   // Light violet
    primaryDark: '#5B21B6',    // Dark violet
    
    // Secondary - Teal accent
    secondary: '#14B8A6',      // Teal
    secondaryLight: '#5EEAD4', // Light teal
    secondaryDark: '#0F766E',  // Dark teal
    
    // Background Colors
    background: {
      primary: '#0F172A',      // Dark slate (main bg)
      secondary: '#1E293B',    // Slate (cards)
      tertiary: '#334155',     // Lighter slate
      glass: 'rgba(30, 41, 59, 0.7)', // Glassmorphism surface
    },
    
    // Text Colors
    text: {
      primary: '#F8FAFC',      // Almost white
      secondary: '#94A3B8',   // Muted gray
      tertiary: '#64748B',     // Dimmer gray
      inverse: '#0F172A',      // Dark text on light bg
    },
    
    // Accent Colors
    accent: {
      success: '#10B981',     // Emerald green
      warning: '#F59E0B',     // Amber
      error: '#EF4444',        // Red
      info: '#06B6D4',         // Cyan
    },
    // Category Badge Colors
    badges: {
      government: '#7C3AED',  // Violet
      private: '#14B8A6',     // Teal
      banking: '#F59E0B',      // Amber
      it: '#3B82F6',          // Blue
      defence: '#EF4444',      // Red
      engineering: '#8B5CF6', // Purple
      marketing: '#EC4899',   // Pink
      finance: '#10B981',     // Green
      default: '#64748B',     // Gray
    },
    
    // Gradient combinations
    gradients: {
      hero: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%)',
      primary: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
      secondary: 'linear-gradient(135deg, #14B8A6 0%, #5EEAD4 100%)',
      card: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      heading: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing System (8px grid)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    glow: {
      primary: '0 0 20px rgba(124, 58, 237, 0.3)',
      secondary: '0 0 20px rgba(20, 184, 166, 0.3)',
    },
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  
  // Animation Durations
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Breakpoints (for responsive design)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Helper function to get badge color
export const getBadgeColor = (category) => {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('government') || categoryLower.includes('psc') || categoryLower.includes('ssc') || categoryLower.includes('upsc')) {
    return theme.colors.badges.government;
  }
  if (categoryLower.includes('private') || categoryLower.includes('it') || categoryLower.includes('software')) {
    return theme.colors.badges.private;
  }
  if (categoryLower.includes('banking') || categoryLower.includes('ibps') || categoryLower.includes('bank')) {
    return theme.colors.badges.banking;
  }
  if (categoryLower.includes('defence') || categoryLower.includes('army') || categoryLower.includes('drdo')) {
    return theme.colors.badges.defence;
  }
  if (categoryLower.includes('engineering') || categoryLower.includes('civil') || categoryLower.includes('mechanical')) {
    return theme.colors.badges.engineering;
  }
  if (categoryLower.includes('marketing') || categoryLower.includes('digital')) {
    return theme.colors.badges.marketing;
  }
  if (categoryLower.includes('finance') || categoryLower.includes('ca') || categoryLower.includes('account')) {
    return theme.colors.badges.finance;
  }
  
  return theme.colors.badges.default;
};

export default theme;
