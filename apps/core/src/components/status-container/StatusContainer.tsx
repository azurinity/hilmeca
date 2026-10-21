import styles from './StatusContainer.module.css';
import clsx from 'clsx';

import { useTheme } from '../../theme/ThemeProvider';

import {
  ResolvableIcon,
  isValidResolvableIcon,
  type ResolvableIconInput,
} from '../../components/icon';

export type StatusType = 'default' | 'success' | 'warning' | 'error';

export interface StatusContainerProps {
  icon?: ResolvableIconInput;
  title?: string;
  subtitle?: string;
  text?: string;
  status?: StatusType;
  className?: string;
}

export function StatusContainer({
  icon,
  title,
  subtitle,
  text,
  status,
  className,
}: StatusContainerProps) {
  const { theme } = useTheme();

  const isIconValid = isValidResolvableIcon(icon);
  const finalStatus: StatusType =
    status === 'success' || status === 'warning' || status === 'error' ? status : 'default';

  return (
    <div className={clsx(styles.root, className)}>
      {isIconValid && (
        <div className={styles.iconsContainer}>
          <ResolvableIcon
            icon={icon}
            size="var(--space-xxl)"
            strokeWidth={2}
            color={theme.text.secondary}
            className={styles.icon}
          />
          {finalStatus === 'success' ? (
            <ResolvableIcon
              icon="Check"
              size="var(--space-xl)"
              strokeWidth={2.5}
              color={theme.status.success.solid}
              className={styles.statusIcon}
            />
          ) : finalStatus === 'warning' ? (
            <ResolvableIcon
              icon="TriangleAlert"
              size="var(--space-xl)"
              strokeWidth={2.5}
              color={theme.status.warning.solid}
              className={styles.statusIcon}
            />
          ) : finalStatus === 'error' ? (
            <ResolvableIcon
              icon="X"
              size="var(--space-xl)"
              strokeWidth={2.5}
              color={theme.status.error.solid}
              className={styles.statusIcon}
            />
          ) : null}
        </div>
      )}
      {typeof title === 'string' && <span className={styles.title}>{title}</span>}
      {typeof subtitle === 'string' && (
        <span
          className={clsx(
            styles.subtitle,
            finalStatus === 'success'
              ? styles.subtitleSuccess
              : finalStatus === 'warning'
                ? styles.subtitleWarning
                : finalStatus === 'error'
                  ? styles.subtitleError
                  : null,
          )}
        >
          {subtitle}
        </span>
      )}
      {typeof text === 'string' && <span className={styles.extraText}>{text}</span>}
    </div>
  );
}
