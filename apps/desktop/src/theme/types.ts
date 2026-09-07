// apps/desktop/src/theme/types.ts

export type ThemeMode = 'light' | 'dark' | 'system';

export interface StatusColors {
  solid: string;
  surface: string;
  border: string;
  text: string;
}

export interface Theme {
  mode: 'light' | 'dark';

  brand: {
    primary: string;
    primaryMuted: string;
    onPrimary: string;
  };

  status: {
    success: StatusColors;
    error: StatusColors;
  };

  background: {
    canvas: string;
    surface: string;
    surfaceRaised: string;
  };

  text: {
    primary: string;
    secondary: string;
    disabled: string;
    muted: string;
  };

  border: {
    default: string;
    loading: string;
  };

  components: {
    button: {
      primary: {
        gradientStart: string;
        gradientEnd: string;
        text: string;
      };
      disabled: {
        background: string;
        text: string;
      };
    };

    loader: {
      active: string;
      disabled: string;
    };

    toast: {
      success: {
        background: string;
        border: string;
      };
      error: {
        background: string;
        border: string;
      };
    };

    skeleton: {
      base: string;
      shimmer: string;
    };
  };

  interaction: {
    ripple: {
      color: string;
      borderless: boolean;
      foreground: boolean;
    };
  };
}
