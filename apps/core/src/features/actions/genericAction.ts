import type { MouseEventHandler } from 'react';
import {
  isValidResolvableIcon,
  type ResolvableIconInput,
  type ResolvableIconConfig,
} from '../../components/icon';

export type ActionType = 'normal' | 'interactive';

export type ActionPriority = 'primary' | 'secondary' | 'active';

export type ActionConfig = {
  id?: string;
  type?: ActionType;
  icon?: ResolvableIconInput;
  iconProps?: ResolvableIconConfig;
  text?: string;
  extraIcon?: ResolvableIconInput;
  extraIconProps?: ResolvableIconConfig;
  extraText?: string;
  disabled?: boolean;
  highlighted?: boolean;
  priority?: ActionPriority;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onDoubleClick?: MouseEventHandler<HTMLButtonElement>;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
  onMouseOver?: MouseEventHandler<HTMLButtonElement>;
};

export type CreateActionOptions = {
  iconIfInvalid?: ResolvableIconInput;
  textIfInvalid?: string;
  extraIconIfInvalid?: ResolvableIconInput;
  extraTextIfInvalid?: string;
};

export type ValidateActionOptions = {
  nonEmptyTexts?: boolean;
};

export type FilterActionsOptions = {
  allowSingulars?: boolean;
  allowArrays?: boolean;
  allowRecords?: boolean;
};

export type ActionConfigInput =
  ActionConfig | ActionConfigInput[] | { [key: string]: ActionConfigInput };

export type NormalizedActionConfig =
  ActionConfig | NormalizedActionConfig[] | { [key: string]: NormalizedActionConfig };

export type FilteredActionConfig =
  ActionConfig | null | FilteredActionConfig[] | { [key: string]: FilteredActionConfig };

type ResolvedFilterActionsOptions = Required<FilterActionsOptions>;

const ACTION_CONFIG_KEYS = new Set([
  'id',
  'type',
  'icon',
  'iconProps',
  'text',
  'extraIcon',
  'extraIconProps',
  'extraText',
  'disabled',
  'highlighted',
  'priority',
  'onClick',
  'onDoubleClick',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseOver',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isActionConfigObject(
  value: Record<string, unknown>,
): value is Record<string, unknown> & ActionConfig {
  return Object.keys(value).every((key) => ACTION_CONFIG_KEYS.has(key));
}

function resolveFilterActionsOptions(
  options?: FilterActionsOptions,
  fallback?: ResolvedFilterActionsOptions,
): ResolvedFilterActionsOptions {
  return {
    allowSingulars:
      typeof options?.allowSingulars === 'boolean'
        ? options.allowSingulars
        : (fallback?.allowSingulars ?? true),

    allowArrays:
      typeof options?.allowArrays === 'boolean'
        ? options.allowArrays
        : (fallback?.allowArrays ?? true),

    allowRecords:
      typeof options?.allowRecords === 'boolean'
        ? options.allowRecords
        : (fallback?.allowRecords ?? true),
  };
}

export function createAction(props?: ActionConfig, options?: CreateActionOptions): ActionConfig {
  const pr: ActionConfig = props && typeof props === 'object' ? props : {};
  const pa: CreateActionOptions = options ?? {};

  return {
    ...pr,

    id: typeof pr.id === 'string' ? pr.id : undefined,

    type: pr.type === 'normal' || pr.type === 'interactive' ? pr.type : 'interactive',

    icon: isValidResolvableIcon(pr.icon)
      ? pr.icon
      : isValidResolvableIcon(pa.iconIfInvalid)
        ? pa.iconIfInvalid
        : undefined,

    iconProps: typeof pr.iconProps === 'object' ? pr.iconProps : undefined,

    text:
      typeof pr.text === 'string'
        ? pr.text
        : typeof pa.textIfInvalid === 'string'
          ? pa.textIfInvalid
          : undefined,

    extraIcon: isValidResolvableIcon(pr.extraIcon)
      ? pr.extraIcon
      : isValidResolvableIcon(pa.extraIconIfInvalid)
        ? pa.extraIconIfInvalid
        : undefined,

    extraIconProps: typeof pr.extraIconProps === 'object' ? pr.extraIconProps : undefined,

    extraText:
      typeof pr.extraText === 'string'
        ? pr.extraText
        : typeof pa.extraTextIfInvalid === 'string'
          ? pa.extraTextIfInvalid
          : undefined,

    disabled: typeof pr.disabled === 'boolean' ? pr.disabled : false,
    highlighted: typeof pr.highlighted === 'boolean' ? pr.highlighted : false,

    priority:
      pr.priority === 'active' || pr.priority === 'primary' || pr.priority === 'secondary'
        ? pr.priority
        : 'primary',

    onClick: typeof pr.onClick === 'function' ? pr.onClick : undefined,
    onDoubleClick: typeof pr.onDoubleClick === 'function' ? pr.onDoubleClick : undefined,
    onMouseEnter: typeof pr.onMouseEnter === 'function' ? pr.onMouseEnter : undefined,
    onMouseLeave: typeof pr.onMouseLeave === 'function' ? pr.onMouseLeave : undefined,
    onMouseOver: typeof pr.onMouseOver === 'function' ? pr.onMouseOver : undefined,
  };
}

function isValidSingleAction(props: ActionConfig, options: ValidateActionOptions): boolean {
  const hasIcon = isValidResolvableIcon(props.icon);
  const hasExtraIcon = isValidResolvableIcon(props.extraIcon);

  const hasText =
    typeof props.text === 'string' && (!options.nonEmptyTexts || props.text.trim().length > 0);

  const hasExtraText =
    typeof props.extraText === 'string' &&
    (!options.nonEmptyTexts || props.extraText.trim().length > 0);

  return hasIcon || hasExtraIcon || hasText || hasExtraText;
}

export function isValidAction(props?: ActionConfigInput, options?: ValidateActionOptions): boolean {
  const pa: ValidateActionOptions = options ?? {};

  if (Array.isArray(props)) {
    return props.every((pr) => isValidAction(pr, pa));
  }

  if (!isRecord(props)) return false;

  if (isActionConfigObject(props)) {
    return isValidSingleAction(props, pa);
  }

  return Object.values(props).every((pr) => isValidAction(pr as ActionConfigInput, pa));
}

export function normalizeActions(
  props?: ActionConfigInput,
  options?: CreateActionOptions,
): NormalizedActionConfig {
  const pa: CreateActionOptions = options ?? {};

  if (Array.isArray(props)) {
    return props.map((pr) => normalizeActions(pr, pa));
  }

  if (!isRecord(props)) {
    return createAction(undefined, pa);
  }

  if (isActionConfigObject(props)) {
    return createAction(props, pa);
  }

  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      normalizeActions(value as ActionConfigInput, pa),
    ]),
  );
}

function filterActionValue(
  props: ActionConfigInput | undefined,
  options: ResolvedFilterActionsOptions,
  itemOptions: ResolvedFilterActionsOptions,
): FilteredActionConfig {
  if (Array.isArray(props)) {
    if (!options.allowArrays) return null;

    return props.map((pr) => filterActionValue(pr, itemOptions, itemOptions));
  }

  if (!isRecord(props)) return null;

  if (isActionConfigObject(props)) {
    return options.allowSingulars ? props : null;
  }

  if (!options.allowRecords) return null;

  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [
      key,
      filterActionValue(value as ActionConfigInput, itemOptions, itemOptions),
    ]),
  );
}

export function filterActions(
  props?: ActionConfigInput,
  options?: FilterActionsOptions,
  itemOptions?: FilterActionsOptions,
): FilteredActionConfig {
  const pa = resolveFilterActionsOptions(options);
  const paItems = resolveFilterActionsOptions(itemOptions, pa);

  return filterActionValue(props, pa, paItems);
}
