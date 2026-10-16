import { forwardRef, type CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './ScaleButton.module.css';

import { BaseButton, type BaseButtonProps } from './BaseButton';

export interface ScaleButtonProps extends BaseButtonProps {
  scaleTransition?: boolean;
  scaleValue?: number;
}

export const ScaleButton = forwardRef<HTMLButtonElement, ScaleButtonProps>(
  ({ children, className, style, disabled, scaleTransition, scaleValue, ...props }, ref) => {
    const shouldScaleTransition =
      typeof scaleTransition === 'boolean' ? scaleTransition : !disabled;
    const dynamicStyle =
      scaleValue !== undefined
        ? ({ ...style, '--scale-active': scaleValue } as CSSProperties)
        : style;

    return (
      <BaseButton
        ref={ref}
        className={clsx(shouldScaleTransition && styles.scale, className)}
        style={dynamicStyle}
        disabled={disabled}
        {...props}
      >
        {children}
      </BaseButton>
    );
  },
);

ScaleButton.displayName = 'ScaleButton';
