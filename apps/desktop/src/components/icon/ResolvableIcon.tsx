import React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { IconRegistry, ICON_ALIASES, type RegisteredIconName } from './iconRegistry';

export type ResolvableIconInput =
  | RegisteredIconName
  | LucideIcon
  | string // Covers remote URLs, local asset paths, and base64 strings
  | null
  | undefined;

export interface ResolvableIconProps extends Omit<LucideProps, 'style' | 'color'> {
  icon: ResolvableIconInput;
  color?: string;
  imageTintColor?: string;
  universalColor?: string;
  imageResizeMode?: React.CSSProperties['objectFit'];
  style?: React.CSSProperties;
  className?: string;
}

const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
const REACT_MEMO_TYPE = Symbol.for('react.memo');

const isRemoteOrAssetUrl = (value: string): boolean =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('data:image/') ||
  value.startsWith('/') ||
  value.startsWith('./') ||
  value.includes('.');

/**
 * Normalizes the input size into a standard CSS string or a number.
 * If given a raw number, it defaults to pixel units for standard web image consumption.
 */
const formatWebSize = (
  value: LucideProps['size'] | undefined,
  fallback = '26px',
): string | number => {
  if (value == null) return fallback;
  if (typeof value === 'number') return `${value}px`;
  return value; // Returns string units like "2rem", "100%", "24px" unchanged
};

export const isLucideIconComponent = (value: unknown): value is LucideIcon => {
  if (typeof value === 'function') return true;
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return (
      obj.$$typeof === REACT_FORWARD_REF_TYPE ||
      obj.$$typeof === REACT_MEMO_TYPE ||
      ('render' in obj && typeof obj.render === 'function')
    );
  }
  return false;
};

export function isValidResolvableIcon(icon: ResolvableIconInput): boolean {
  if (icon == null) return false;
  if (isLucideIconComponent(icon)) return true;

  if (typeof icon === 'string') {
    if (isRemoteOrAssetUrl(icon)) return true;
    const lookupName = ICON_ALIASES[icon] ?? icon;
    return lookupName in IconRegistry;
  }

  return false;
}

export function ResolvableIcon({
  icon,
  color,
  imageTintColor,
  universalColor,
  size = 26,
  strokeWidth = 1.5,
  imageResizeMode = 'contain',
  style,
  className,
  ...rest
}: ResolvableIconProps) {
  if (!icon) return null;

  const finalLucideColor = universalColor ?? color;
  const finalImageTintColor = universalColor ?? imageTintColor;

  // Format the size so it behaves correctly when applied to HTML inline style rules
  const webDimensions = formatWebSize(size, '26px');

  // 1. Explicit Lucide Component Instance or Reference
  if (isLucideIconComponent(icon)) {
    const Icon = icon;
    return (
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        color={finalLucideColor}
        style={style}
        className={className}
        {...(rest as any)}
      />
    );
  }

  // 2. String Evaluation (Registry Key vs Image URL/Path)
  if (typeof icon === 'string') {
    const lookupName = ICON_ALIASES[icon] ?? icon;
    const ResolvedLucideComponent = IconRegistry[lookupName as RegisteredIconName];

    // Case A: Matches an entry in the Lucide Registry
    if (ResolvedLucideComponent) {
      return (
        <ResolvedLucideComponent
          size={size}
          strokeWidth={strokeWidth}
          color={finalLucideColor}
          style={style}
          className={className}
          {...(rest as any)}
        />
      );
    }

    // Case B: Fallback to Image Path/URL string
    if (isRemoteOrAssetUrl(icon)) {
      // If imageTintColor is designated, apply a CSS mask to colorize the source image
      if (finalImageTintColor) {
        return (
          <div
            className={className}
            style={{
              width: webDimensions,
              height: webDimensions,
              backgroundColor: finalImageTintColor,
              maskImage: `url(${icon})`,
              WebkitMaskImage: `url(${icon})`,
              maskSize: imageResizeMode,
              WebkitMaskSize: imageResizeMode,
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              display: 'inline-block',
              ...style,
            }}
          />
        );
      }

      // Default clean standard image tag
      return (
        <img
          src={icon}
          alt="icon"
          className={className}
          style={{
            width: webDimensions,
            height: webDimensions,
            objectFit: imageResizeMode,
            ...style,
          }}
        />
      );
    }

    console.warn(`[ResolvableIcon]: Icon parsing failed for context string: "${icon}".`);
    return null;
  }

  return null;
}
