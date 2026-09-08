import { forwardRef, type CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './ScaleButton.module.css';

import { BaseButton, type BaseButtonProps } from './BaseButton';

export interface ScaleButtonProps extends BaseButtonProps {
  scaleTransition?: boolean;
  scaleValue?: number;
}

export const ScaleButton = forwardRef<HTMLButtonElement, ScaleButtonProps>(
  ({ children, className, style, scaleTransition = true, scaleValue, ...props }, ref) => {
    const dynamicStyle =
      scaleValue !== undefined
        ? ({ ...style, '--scale-active': scaleValue } as CSSProperties)
        : style;

    return (
      <BaseButton
        ref={ref}
        className={clsx(scaleTransition && styles.scale, className)}
        style={dynamicStyle}
        {...props}
      >
        {children}
      </BaseButton>
    );
  },
);

ScaleButton.displayName = 'ScaleButton';
