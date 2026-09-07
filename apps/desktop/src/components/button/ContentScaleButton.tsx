import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './ContentScaleButton.module.css';

import { BaseButton, type BaseButtonProps } from './BaseButton';

export interface ContentScaleButtonProps extends BaseButtonProps {
  scaleTransition?: boolean;
}

export const ContentScaleButton = forwardRef<HTMLButtonElement, ContentScaleButtonProps>(
  ({ children, className, scaleTransition = true, ...props }, ref) => (
    <BaseButton ref={ref} className={clsx(styles.host, className)} {...props}>
      <span className={clsx(scaleTransition && styles.content)}>{children}</span>
    </BaseButton>
  ),
);

ContentScaleButton.displayName = 'ContentScaleButton';
