import React, { ButtonHTMLAttributes, useCallback } from 'react';
import clsx from 'clsx';
import styles from './RibbonButton.module.css';

import { useTheme } from '../theme/ThemeProvider';
import { ContentScaleButton } from '../components/button';
import {
  ResolvableIcon,
  isValidResolvableIcon,
  type ResolvableIconInput,
} from '../components/icon';

export interface RibbonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ResolvableIconInput;
  text?: string;
  selected?: boolean;
}

export function RibbonButton({
  children,
  icon,
  text,
  selected,
  onMouseEnter,
  onMouseLeave,
  onClick,
  className,
  ...props
}: RibbonButtonProps) {
  const { theme } = useTheme();

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onMouseEnter?.(e),
    [onMouseEnter],
  );
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onMouseLeave?.(e),
    [onMouseLeave],
  );
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClick?.(e),
    [onClick],
  );

  if (!isValidResolvableIcon(icon) && (typeof text !== 'string' || text?.length < 1)) return;

  return (
    <ContentScaleButton
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={clsx(styles.ribbonButton, className)}
      {...props}
    >
      {isValidResolvableIcon(icon) && (
        <ResolvableIcon
          icon={icon}
          size="var(--space-lg)"
          strokeWidth={2}
          color={theme.text.disabled}
          className={styles.ribbonIcon}
        />
      )}
      {typeof text === 'string' && text.length >= 1 && (
        <span className={styles.ribbonText}>{`${text}`}</span>
      )}
    </ContentScaleButton>
  );
}
