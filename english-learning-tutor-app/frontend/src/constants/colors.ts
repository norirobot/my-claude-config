// Color palette based on UI/UX design guidelines
export const Colors = {
  // Primary Colors (동기부여 & 성장)
  primary: '#00C853',      // Primary Green (성공, 성장, 긍정)
  accent: '#2196F3',       // Accent Blue (신뢰, 안정, 학습)
  warm: '#FF9800',         // Warm Orange (에너지, 열정, 도전)
  
  // Secondary Colors (지원 & 안정)
  lightGray: '#F5F5F5',    // Soft Gray (배경, 중립)
  darkGray: '#424242',     // Deep Gray (텍스트, 정보)
  lightBlue: '#E3F2FD',    // Light Blue (정보 배경)
  
  // Feedback Colors (즉시 인지)
  success: '#4CAF50',      // Success (정답, 성취)
  warning: '#FF9800',      // Warning (주의, 개선점)
  error: '#F44336',        // Error (오류, 재도전)
  
  // Semantic Colors
  background: '#FFFFFF',
  surface: '#FAFAFA',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  
  // Gradients
  gradients: {
    primary: ['#00C853', '#69F0AE'],
    accent: ['#2196F3', '#81D4FA'],
    warm: ['#FF9800', '#FFD54F'],
    success: ['#4CAF50', '#A5D6A7'],
  },
  
  // Shadows
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Transparent overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
};

// Color usage guidelines
export const ColorUsage = {
  // Button colors
  button: {
    primary: Colors.primary,
    secondary: Colors.accent,
    warning: Colors.warm,
    success: Colors.success,
    danger: Colors.error,
  },
  
  // Status colors
  status: {
    active: Colors.success,
    inactive: Colors.darkGray,
    pending: Colors.warm,
    error: Colors.error,
  },
  
  // Learning progress colors
  progress: {
    beginner: '#FF9800',     // Orange
    intermediate: '#2196F3', // Blue  
    advanced: '#4CAF50',     // Green
    expert: '#9C27B0',       // Purple
  },
  
  // Score colors (pronunciation, fluency, etc.)
  score: {
    excellent: Colors.success,  // 90-100%
    good: Colors.primary,       // 70-89%
    fair: Colors.warm,          // 50-69%
    poor: Colors.error,         // 0-49%
  },
};

// For backward compatibility - simplified colors object
export const colors = {
  primary: Colors,
  background: {
    primary: Colors.background,
    secondary: Colors.surface,
    tertiary: Colors.lightGray
  },
  text: Colors.text,
  status: ColorUsage.status,
  accent: {
    main: Colors.accent,
    light: Colors.lightBlue
  }
};