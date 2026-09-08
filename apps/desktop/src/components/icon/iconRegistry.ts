import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  EllipsisVertical,
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
  MessagesSquare,
  MessageSquareText,
  SquarePen,
  Waypoints,
  LibraryBig,
  BookMarked,
  Star,
  Wrench,
  Power,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

/**
 * Add explicitly used icons here to map string identifiers to component definitions.
 * This guarantees safe explicit lookups while letting your bundler optimize remaining exports.
 */
export const IconRegistry = {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  EllipsisVertical,
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
  MessagesSquare,
  MessageSquareText,
  SquarePen,
  Waypoints,
  LibraryBig,
  BookMarked,
  Star,
  Wrench,
  Power,
  PanelLeftClose,
  PanelLeftOpen,
  // Add more icons here as you need them
} as const;

export type RegisteredIconName = keyof typeof IconRegistry;

export const ICON_ALIASES: Record<string, RegisteredIconName> = {
  EllipsisHorizontal: 'Ellipsis',
};
