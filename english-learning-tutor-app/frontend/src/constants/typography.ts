// Typography system following Google-style minimalism
export const Typography = {
  // Font families
  fontFamily: {
    regular: 'system',
    medium: 'system',
    semiBold: 'system',
    bold: 'system',
  },
  
  // Font sizes (Google Material Design scale)
  fontSize: {
    xs: 12,    // Caption, labels
    sm: 14,    // Body 2, secondary text
    base: 16,  // Body 1, primary text
    lg: 18,    // Subtitle 2
    xl: 20,    // Subtitle 1
    '2xl': 24, // Headline 6
    '3xl': 28, // Headline 5
    '4xl': 32, // Headline 4
    '5xl': 36, // Headline 3
    '6xl': 40, // Headline 2
    '7xl': 48, // Headline 1
  },
  
  // Line heights (1.2x - 1.6x of font size for readability)
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Text styles for consistency
  textStyles: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 38,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 30,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
    },
    
    // Body text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 26,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    
    // UI elements
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 22,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 18,
    },
    
    // Learning app specific
    score: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 28,
    },
    points: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 24,
    },
    streak: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 20,
    },
    
    // Motivational text
    greeting: {
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 26,
    },
    achievement: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    encouragement: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
    },
  },
};

// Text weight mapping
export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Letter spacing (for better readability)
export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
};

// For backward compatibility - simplified typography object
export const typography = {
  h1: Typography.presets.h1,
  h2: Typography.presets.h2,
  h3: Typography.presets.h3,
  body: Typography.presets.body,
  caption: Typography.presets.caption,
  button: Typography.presets.button
};