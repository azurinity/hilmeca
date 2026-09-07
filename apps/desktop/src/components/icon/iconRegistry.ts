import {
  ChevronLeft,
  Ellipsis,
  House,
  Settings,
  Search,
  Plus,
  Minus,
  Minimize2,
  Maximize2,
  X,
  Check,
  Menu,
  TextAlignJustify,
} from 'lucide-react';

/**
 * Add explicitly used icons here to map string identifiers to component definitions.
 * This guarantees safe explicit lookups while letting your bundler optimize remaining exports.
 */
export const IconRegistry = {
  ChevronLeft,
  Ellipsis,
  House,
  Settings,
  Search,
  Plus,
  Minus,
  Minimize2,
  Maximize2,
  X,
  Check,
  Menu,
  TextAlignJustify,
  // Add more icons here as you need them
} as const;

export type RegisteredIconName = keyof typeof IconRegistry;

export const ICON_ALIASES: Record<string, RegisteredIconName> = {
  EllipsisHorizontal: 'Ellipsis',
};
