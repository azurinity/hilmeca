import { forwardRef, type CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './ContentScaleButton.module.css';

import { BaseButton, type BaseButtonProps } from './BaseButton';

export interface ContentScaleButtonProps extends BaseButtonProps {
  scaleTransition?: boolean;
  scaleValue?: number;
}

export const ContentScaleButton = forwardRef<HTMLButtonElement, ContentScaleButtonProps>(
  ({ children, className, style, scaleTransition = true, scaleValue, ...props }, ref) => {
    const dynamicStyle =
      scaleValue !== undefined
        ? ({ ...style, '--scale-active': scaleValue } as CSSProperties)
        : style;

    return (
      <BaseButton
        ref={ref}
        className={clsx(styles.host, className)}
        style={dynamicStyle}
        {...props}
      >
        <span className={clsx(scaleTransition && styles.content)}>{children}</span>
      </BaseButton>
    );
  },
);

ContentScaleButton.displayName = 'ContentScaleButton';
