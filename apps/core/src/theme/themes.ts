// apps/desktop/src/theme/themes.ts
import type { Theme } from './types';

export const lightTheme: Theme = {
  mode: 'light',
  brand: {
    primary: '#2563EB',
    primaryMuted: '#2563EB29',
    onPrimary: '#FFFFFF',
  },
  status: {
    success: {
      solid: '#16A34A',
      surface: '#F0FDF4',
      border: '#10B981',
      text: '#16A34A',
    },
    warning: {
      solid: '#D97706',
      surface: '#FEF3C7',
      border: '#F59E0B',
      text: '#D97706',
    },
    error: {
      solid: '#DC2626',
      surface: '#FEE2E2',
      border: '#EF4444',
      text: '#FF5573',
    },
  },
  background: {
    canvas: '#EBECEE', // Muted neutral-cool backdrop
    surface: '#F5F6F8', // Soft off-white main surface
    surfaceVariant: '#EEF0F4', // Low-chroma container/input background
    surfaceRaised: '#FFFFFF', // Clean floating panels & modals
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    disabled: '#A2ACB9',
    muted: '#B2BAC5',
  },
  border: {
    default: '#D1D5DB', // Subtle desaturated border
    loading: '#60A5FA',
  },
  components: {
    button: {
      primary: {
        gradientStart: '#0085FF',
        gradientEnd: '#0047AB',
        text: '#FFFFFF',
      },
      disabled: {
        background: '#E2E8F0',
        text: '#94A3B8',
      },
    },
    loader: {
      active: '#FFFFFF',
      disabled: '#94A3B8',
    },
    toast: {
      success: {
        background: '#ECFDF5',
        border: '#10B981',
      },
      error: {
        background: '#FEF2F2',
        border: '#EF4444',
      },
    },
    skeleton: {
      base: '#E2E8F0',
      shimmer: '#F1F5F9',
    },
  },
  interaction: {
    ripple: {
      color: 'rgba(0, 0, 0, 0.05)',
      borderless: false,
      foreground: true,
    },
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  brand: {
    primary: '#3B82F6',
    primaryMuted: '#3B82F64D',
    onPrimary: '#FFFFFF',
  },
  status: {
    success: {
      solid: '#4ADE80',
      surface: '#064E3B',
      border: '#34D399',
      text: '#4ADE80',
    },
    warning: {
      solid: '#FBBF24',
      surface: '#78350F',
      border: '#FBBF24',
      text: '#FDE68A',
    },
    error: {
      solid: '#F87171',
      surface: '#7F1D1D',
      border: '#F87171',
      text: '#FDA4AF',
    },
  },
  background: {
    canvas: '#090A0C', // Deep neutral dark backdrop
    surface: '#101215', // Low-saturation main panel
    surfaceVariant: '#1A1D22', // Muted inset container for inputs/headers
    surfaceRaised: '#22262E', // Comfortable elevated floating surfaces
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    disabled: '#5E6269',
    muted: '#4E5258',
  },
  border: {
    default: '#22262E', // Toned-down dark border
    loading: '#3B82F6',
  },
  components: {
    button: {
      primary: {
        gradientStart: '#3B82F6',
        gradientEnd: '#1D4ED8',
        text: '#FFFFFF',
      },
      disabled: {
        background: '#1E293B',
        text: '#475569',
      },
    },
    loader: {
      active: '#FFFFFF',
      disabled: '#475569',
    },
    toast: {
      success: {
        background: '#064E3B',
        border: '#34D399',
      },
      error: {
        background: '#450A0A',
        border: '#F87171',
      },
    },
    skeleton: {
      base: '#171E27',
      shimmer: '#374151',
    },
  },
  interaction: {
    ripple: {
      color: 'rgba(255, 255, 255, 0.3)',
      borderless: false,
      foreground: true,
    },
  },
};
