import { useCallback, type ElementType, type MouseEventHandler } from 'react';
import styles from './ActionButton.module.css';
import clsx from 'clsx';

import { useTheme } from '../../theme/ThemeProvider';

import {
  isValidAction,
  filterActions,
  createAction,
  type ActionConfig,
} from '../../features/actions';

import {
  isValidResolvableIcon,
  ResolvableIcon,
  type ResolvableIconConfig,
} from '../../components/icon';
import { ScaleButton } from '../../components/button';

export interface ActionButtonProps {
  component?: ElementType;
  key?: string;
  actionConfig?: ActionConfig;

  className?: string;
  iconProps?: ResolvableIconConfig;
  iconClassName?: string;
  textClassName?: string;
  extraIconProps?: ResolvableIconConfig;
  extraIconClassName?: string;
  extraTextClassName?: string;
}

export function ActionButton({
  component,
  key,
  actionConfig,
  className,
  iconProps,
  iconClassName,
  textClassName,
  extraIconProps,
  extraIconClassName,
  extraTextClassName,
}: ActionButtonProps) {
  const { theme } = useTheme();

  if (!isValidAction(actionConfig)) return null;

  const filtered = filterActions(actionConfig, {
    allowSingulars: true,
    allowArrays: false,
    allowRecords: false,
  });

  if (!filtered) return null;

  const actConfig = createAction(actionConfig);
  const finalKey: string = typeof key === 'string' ? key : 'aRandomKey'
  const isIconValid = isValidResolvableIcon(actConfig?.icon) && actConfig.icon !== null;
  const isExtraIconValid =
    isValidResolvableIcon(actConfig?.extraIcon) && actConfig.extraIcon !== null;
  const isTextValid = typeof actConfig?.text === 'string' && actConfig.text.trim().length > 0;
  const isExtraTextValid =
    typeof actConfig?.extraText === 'string' && actConfig.extraText.trim().length > 0;
  const isOnlySingularIcon =
    !isTextValid &&
    !isExtraTextValid &&
    (isIconValid || isExtraIconValid) &&
    !(isIconValid && isExtraIconValid);
  const collectedMouseEvents: Record<string, MouseEventHandler<HTMLButtonElement> | undefined> = {
    onClick: actConfig?.onClick,
    onDoubleClick: actConfig?.onDoubleClick,
    onMouseEnter: actConfig?.onMouseEnter,
    onMouseLeave: actConfig?.onMouseLeave,
    onMouseOver: actConfig?.onMouseOver,
  };

  const Component = component ?? (actConfig.type === 'interactive' ? ScaleButton : 'div');

  return (
    <Component
      key={finalKey}
      className={clsx(
        styles.button,
        isOnlySingularIcon ? styles.buttonSingularIcon : styles.buttonMultipleElements,
        actConfig?.highlighted === true && styles.buttonHighlighted,
        className,
      )}
      disabled={actConfig?.disabled === true}
      {...(actConfig?.type === 'interactive' ? collectedMouseEvents : {})}
    >
      {isIconValid && (
        <ResolvableIcon
          icon={actConfig.icon}
          size="90%"
          strokeWidth={2}
          color={actConfig?.disabled ? theme.text.disabled : theme.text.primary}
          {...iconProps}
          {...actConfig?.iconProps}
          className={clsx(
            styles.buttonIcon,
            iconProps?.className,
            iconClassName,
            actConfig?.iconProps?.className,
          )}
        />
      )}
      {isTextValid && (
        <span
          className={clsx(
            styles.buttonText,
            styles.buttonNormalText,
            actConfig?.disabled
              ? styles.buttonNormalTextDisabled
              : actConfig?.priority === 'primary'
                ? styles.buttonNormalTextPrimary
                : actConfig?.priority === 'secondary'
                  ? styles.buttonNormalTextSecondary
                  : actConfig?.priority === 'active'
                    ? styles.buttonNormalTextActive
                    : styles.buttonNormalTextPrimary,
            textClassName,
          )}
        >
          {actConfig.text}
        </span>
      )}
      {isExtraIconValid && (
        <ResolvableIcon
          icon={actConfig.extraIcon}
          size="75%"
          strokeWidth={2}
          color={actConfig?.disabled ? theme.text.muted : theme.text.disabled}
          {...extraIconProps}
          {...actConfig?.extraIconProps}
          className={clsx(
            styles.buttonIcon,
            extraIconProps?.className,
            extraIconClassName,
            actConfig?.extraIconProps?.className,
          )}
        />
      )}
      {isExtraTextValid && (
        <span
          className={clsx(
            styles.buttonText,
            styles.buttonExtraText,
            actConfig?.disabled && actConfig?.priority === 'active'
              ? styles.buttonExtraTextActive
              : styles.buttonExtraTextNormal,
            extraTextClassName,
          )}
        >
          {actConfig.extraText}
        </span>
      )}
    </Component>
  );
}
