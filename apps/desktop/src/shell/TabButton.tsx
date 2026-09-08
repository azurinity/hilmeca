import React, { useState, useCallback, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './TabButton.module.css';

import { useTheme } from '../theme/ThemeProvider';
import { ScaleButton, ContentScaleButton } from '../components/button';
import {
  ResolvableIcon,
  isValidResolvableIcon,
  type ResolvableIconInput,
} from '../components/icon';

export interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ResolvableIconInput;
  text?: string;
  selected?: boolean;
  onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function TabButton({
  icon,
  text,
  selected,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onClose,
  className,
  ...props
}: TabButtonProps) {
  const { theme } = useTheme();

  const [isHoveringClose, setIsHoveringClose] = useState(false);

  const finalSelected = !!selected;

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
  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose?.(e),
    [onClose],
  );
  const handleHoverClose = useCallback(() => setIsHoveringClose(true), []);
  const handleLeaveClose = useCallback(() => setIsHoveringClose(false), []);

  return (
    <ContentScaleButton
      colorTransition={true}
      scaleTransition={!isHoveringClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={clsx(styles.tabButton, className, finalSelected && styles.tabButtonSelected)}
      {...props}
    >
      {isValidResolvableIcon(icon) && (
        <ResolvableIcon
          icon={icon}
          size="var(--space-lg)"
          strokeWidth={2}
          color={theme.text.disabled}
          className={styles.tabIcon}
        />
      )}
      {typeof text === 'string' && text.length >= 1 && (
        <span
          className={clsx(styles.tabText, finalSelected && styles.tabTextSelected)}
        >{`${text}`}</span>
      )}
      <ScaleButton
        scaleValue={0.92}
        onMouseEnter={handleHoverClose}
        onMouseLeave={handleLeaveClose}
        onClick={handleClose}
        className={clsx(styles.tabCloseButton, finalSelected && styles.tabCloseButtonSelected)}
        useAnchorInstead={true}
      >
        <ResolvableIcon
          icon="X"
          size="calc(var(--space-lg) - var(--space-xxs))"
          strokeWidth={2.5}
          color={finalSelected ? theme.text.primary : theme.text.disabled}
        />
      </ScaleButton>
    </ContentScaleButton>
  );
}
