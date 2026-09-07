import {
  forwardRef,
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type Ref,
} from 'react';
import clsx from 'clsx';
import styles from './BaseButton.module.css';

import { useTheme } from '../../theme/ThemeProvider';
import { getRelativeLuminance } from '../../features/colors';

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  colorTransition?: boolean;
  /** Overrides the luminance-based lighten/darken hover behavior with a fixed color. */
  hoverColor?: string;
}

const LUMINANCE_THRESHOLD = 0.5;

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ children, className, style, colorTransition = true, hoverColor, ...props }, forwardedRef) => {
    const { theme } = useTheme();
    const innerRef = useRef<HTMLButtonElement>(null);
    const setRef = useCallback(mergeRefs(innerRef, forwardedRef), [forwardedRef]);

    useLayoutEffect(() => {
      const node = innerRef.current;
      if (!node) return;

      if (!colorTransition || hoverColor) {
        delete node.dataset.tone;
        return;
      }

      const resolvedBg = getComputedStyle(node).backgroundColor;
      const luminance = getRelativeLuminance(resolvedBg);
      node.dataset.tone = luminance > LUMINANCE_THRESHOLD ? 'light' : 'dark';
    }, [theme, style, colorTransition, hoverColor]);

    const mergedStyle = useMemo<CSSProperties | undefined>(() => {
      if (!hoverColor) return style;
      return { ...style, '--button-hover-color': hoverColor } as CSSProperties;
    }, [style, hoverColor]);

    return (
      <button
        ref={setRef}
        className={clsx(styles.button, className)}
        style={mergedStyle}
        {...props}
      >
        {children}
      </button>
    );
  },
);

BaseButton.displayName = 'BaseButton';
