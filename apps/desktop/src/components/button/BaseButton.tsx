import {
  forwardRef,
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type Ref,
} from 'react';
import clsx from 'clsx';
import styles from './BaseButton.module.css';

import { useTheme } from '../../theme/ThemeProvider';
import { getRelativeLuminance } from '../../utils/colors';

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  colorTransition?: boolean;
  /** Overrides the luminance-based lighten/darken hover behavior with a fixed color. */
  hoverColor?: string;
  useAnchorInstead?: boolean;
}

type BaseButtonElement = HTMLButtonElement | HTMLAnchorElement;

const LUMINANCE_THRESHOLD = 0.5;

function setRefNode<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') ref(node);
  else (ref as React.RefObject<T | null>).current = node;
}

export const BaseButton = forwardRef<BaseButtonElement, BaseButtonProps>(
  (
    {
      children,
      className,
      style,
      colorTransition = true,
      hoverColor,
      useAnchorInstead = false,
      ...props
    },
    forwardedRef,
  ) => {
    const { theme } = useTheme();
    const innerRef = useRef<BaseButtonElement>(null);

    const setRef = useCallback(
      (node: BaseButtonElement | null) => {
        innerRef.current = node;
        setRefNode(forwardedRef, node);
      },
      [forwardedRef],
    );

    useLayoutEffect(() => {
      const node = innerRef.current;
      if (!node) return;

      if (!colorTransition || hoverColor) {
        delete node.dataset.tone;
        node.style.removeProperty('--button-bg');
        return;
      }

      delete node.dataset.tone;

      const resolvedBg = getComputedStyle(node).backgroundColor;
      node.style.setProperty('--button-bg', resolvedBg);

      const luminance = getRelativeLuminance(resolvedBg);
      node.dataset.tone = luminance > LUMINANCE_THRESHOLD ? 'light' : 'dark';
    }, [theme, style, className, colorTransition, hoverColor]);

    const mergedStyle = useMemo<CSSProperties | undefined>(() => {
      if (!hoverColor) return style;
      return { ...style, '--button-hover-color': hoverColor } as CSSProperties;
    }, [style, hoverColor]);

    if (useAnchorInstead === true) {
      return (
        <a
          ref={setRef}
          className={clsx(styles.button, className)}
          style={mergedStyle}
          {...(props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

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
