import { useCallback, type HTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './NavigationCluster.module.css';

import appLogo from '../assets/icons/app/splash/icon-splash-standard.png';

import { useTheme } from '../theme/ThemeProvider';
import { ContentScaleButton } from '../components/button';
import { ResolvableIcon } from '../components/icon';

export interface NavigationCluster extends HTMLAttributes<HTMLDivElement> {
  onMajorClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onMinorClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function NavigationCluster({ onMajorClick, onMinorClick, className }: NavigationCluster) {
  const { theme } = useTheme();

  const handleMajorClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onMajorClick?.(e),
    [onMajorClick],
  );
  const handleMinorClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onMinorClick?.(e),
    [onMinorClick],
  );

  return (
    <div className={clsx(styles.cluster, className)}>
      <ContentScaleButton
        scaleValue={0.92}
        hoverColor={theme.background.surfaceRaised}
        onClick={handleMajorClick}
        className={clsx(styles.button, styles.buttonMajor)}
      >
        <img src={appLogo} className={styles.majorIcon} />
      </ContentScaleButton>
      <ContentScaleButton
        scaleValue={0.92}
        hoverColor={theme.background.surfaceRaised}
        className={clsx(styles.button, styles.buttonMinor)}
        onClick={handleMinorClick}
      >
        <ResolvableIcon
          icon="ChevronRight"
          size="100%"
          strokeWidth={2}
          color={theme.text.secondary}
        />
      </ContentScaleButton>
    </div>
  );
}
