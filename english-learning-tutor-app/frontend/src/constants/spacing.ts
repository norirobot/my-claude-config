// Spacing system for consistent layouts (Google Material Design inspired)
export const Spacing = {
  // Base spacing unit (8px system)
  xs: 4,     // 0.25rem
  sm: 8,     // 0.5rem
  md: 16,    // 1rem
  lg: 24,    // 1.5rem
  xl: 32,    // 2rem
  '2xl': 48, // 3rem
  '3xl': 64, // 4rem
  '4xl': 80, // 5rem
  '5xl': 96, // 6rem
};

// Specific spacing for UI elements
export const ComponentSpacing = {
  // Screen margins and padding
  screen: {
    horizontal: Spacing.lg,  // 24px
    vertical: Spacing.xl,    // 32px
    top: Spacing.lg,         // 24px (below safe area)
    bottom: Spacing.lg,      // 24px (above tab bar)
  },
  
  // Card spacing
  card: {
    padding: Spacing.lg,     // 24px internal padding
    margin: Spacing.md,      // 16px external margin
    gap: Spacing.md,         // 16px between cards
  },
  
  // Button spacing
  button: {
    padding: {
      vertical: Spacing.md,   // 16px top/bottom
      horizontal: Spacing.xl, // 32px left/right
    },
    margin: Spacing.sm,      // 8px between buttons
    gap: Spacing.sm,         // 8px between icon and text
  },
  
  // Input spacing
  input: {
    padding: {
      vertical: Spacing.md,   // 16px
      horizontal: Spacing.lg, // 24px
    },
    margin: Spacing.sm,      // 8px between inputs
  },
  
  // List spacing
  list: {
    itemPadding: Spacing.lg, // 24px
    itemGap: Spacing.sm,     // 8px between items
    sectionGap: Spacing.xl,  // 32px between sections
  },
  
  // Modal/Dialog spacing
  modal: {
    padding: Spacing.xl,     // 32px
    margin: Spacing.lg,      // 24px from screen edges
    buttonGap: Spacing.md,   // 16px between buttons
  },
  
  // Header spacing
  header: {
    height: 64,              // Standard header height
    padding: Spacing.lg,     // 24px horizontal
    titleMargin: Spacing.md, // 16px from back button
  },
  
  // Tab bar spacing
  tabBar: {
    height: 80,              // Tab bar height
    padding: Spacing.sm,     // 8px internal padding
    iconSize: 24,            // Tab icon size
    labelMargin: Spacing.xs, // 4px between icon and label
  },
  
  // Progress bar spacing
  progress: {
    height: 8,               // Progress bar height
    margin: Spacing.md,      // 16px vertical margin
    borderRadius: 4,         // Half of height for rounded
  },
  
  // Learning specific spacing
  learning: {
    sessionPadding: Spacing.xl,    // 32px session container
    feedbackGap: Spacing.lg,       // 24px between feedback items
    scoreMargin: Spacing.md,       // 16px around scores
    hintPadding: Spacing.lg,       // 24px hint container
  },
};

// Border radius system
export const BorderRadius = {
  none: 0,
  sm: 4,     // Small elements
  md: 8,     // Standard elements
  lg: 12,    // Cards, modals
  xl: 16,    // Large cards
  '2xl': 24, // Extra large elements
  full: 9999, // Fully rounded (pills, circles)
};

// Shadow system (elevation)
export const Elevation = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};

// For backward compatibility - simplified spacing object
export const spacing = {
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.md,
  lg: Spacing.lg,
  xl: Spacing.xl,
  borderRadius: BorderRadius,
  elevation: Elevation
};