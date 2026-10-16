import { type CSSProperties } from 'react';
import styles from './ProgressBar.module.css';
import clsx from 'clsx';

import { useTheme } from '../../theme/ThemeProvider';

import { resolveProgressRange } from '../../utils/progress';

export interface ProgressBarProps {
  minValue?: number;
  value?: number;
  maxValue?: number;
  color?: string;
  backgroundColor?: string;
  glowEnabled?: boolean;
  glowColor?: string;
  glowSize?: string;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  minValue,
  value,
  maxValue,
  color,
  backgroundColor,
  glowEnabled,
  glowColor,
  glowSize,
  className,
  barClassName,
}: ProgressBarProps) {
  const { theme } = useTheme();

  const { progress } = resolveProgressRange({ minValue, value, maxValue });
  const progressPercent = progress * 100;

  const finalColor = typeof color === 'string' ? color : theme.brand.primary;
  const finalBgColor =
    typeof backgroundColor === 'string' ? backgroundColor : theme.background.surfaceVariant;
  const finalGlowEnabled = typeof glowEnabled === 'boolean' ? glowEnabled : false;
  const finalGlowColor = typeof glowColor === 'string' ? glowColor : finalColor;
  const finalGlowSize = typeof glowSize === 'string' ? glowSize : 'var(--space-lg)';

  const fillMainStyle: CSSProperties = {
    width: `${progressPercent}%`,
    color: finalColor,
  };
  const containerMainStyle: CSSProperties = {
    backgroundColor: finalBgColor,
  };
  const glowEffectStyle: CSSProperties = {
    boxShadow: `0 0 ${finalGlowSize} ${finalGlowColor}`,
  };

  return (
    <div className={clsx(styles.container, className)} style={{ ...containerMainStyle }}>
      <div
        className={clsx(styles.fill, barClassName)}
        style={{
          ...fillMainStyle,
          ...(finalGlowEnabled ? glowEffectStyle : {}),
        }}
      />
    </div>
  );
}
