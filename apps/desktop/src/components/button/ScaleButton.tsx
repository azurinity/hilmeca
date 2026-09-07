import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './ScaleButton.module.css';

import { BaseButton, type BaseButtonProps } from './BaseButton';

export interface ScaleButtonProps extends BaseButtonProps {
  scaleTransition?: boolean;
}

export const ScaleButton = forwardRef<HTMLButtonElement, ScaleButtonProps>(
  ({ children, className, scaleTransition = true, ...props }, ref) => (
    <BaseButton ref={ref} className={clsx(scaleTransition && styles.scale, className)} {...props}>
      {children}
    </BaseButton>
  ),
);

ScaleButton.displayName = 'ScaleButton';
