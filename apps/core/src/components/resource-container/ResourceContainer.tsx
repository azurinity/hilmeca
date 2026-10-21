import styles from './ResourceContainer.module.css';
import clsx from 'clsx';

import { useTheme } from '../../theme/ThemeProvider';

import { ResolvableIcon, isValidResolvableIcon, type ResolvableIconInput } from '../icon';
import { ProgressBar } from '../progress-bar';
import {
  isProgressValue,
  newValue,
  getNormalizedProgress,
  type ProgressValue,
} from '../../utils/value';

const DEFAULT_WARNING_RATIO = 0.75;
const DEFAULT_DANGER_RATIO = 0.9;

export type ResourceValue = {
  progressValue?: ProgressValue;
  extraText?: string;
  valueText?: string;
  defaultValueTextToPercent?: boolean;
  warningValue?: number;
  dangerValue?: number;
};

export interface ResourceContainerProps {
  icon?: ResolvableIconInput;
  title?: string;
  subtitle?: string;
  resourceValues?: ResourceValue[];
  className?: string;
}

export function ResourceContainer({
  icon,
  title,
  subtitle,
  resourceValues,
  className,
}: ResourceContainerProps) {
  const { theme } = useTheme();

  const isIconValid = isValidResolvableIcon(icon);

  return (
    <div className={clsx(styles.root, className)}>
      <div className={clsx(styles.row, styles.rowTop)}>
        <div className={styles.column}>
          {isIconValid && (
            <ResolvableIcon
              icon={icon}
              size="calc(5 * var(--space-xs))"
              strokeWidth={2}
              color={theme.text.secondary}
              className={styles.icon}
            />
          )}
          {typeof title === 'string' && <p className={styles.title}>{title}</p>}
        </div>
        {typeof subtitle === 'string' && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      {Array.isArray(resourceValues) &&
        resourceValues.map((resource, index) => {
          if (typeof resource !== 'object') return null;
          if (!isProgressValue(resource?.progressValue)) return null;
          const key = `${title}-resource-${index}`;

          const progressValue = isProgressValue(resource?.progressValue)
            ? resource?.progressValue
            : newValue();
          const warnVl = Math.max(
            Math.min(
              typeof resource?.warningValue === 'number'
                ? resource.warningValue
                : DEFAULT_WARNING_RATIO * progressValue.max,
              1,
            ),
            0,
          );
          const dangerVl = Math.max(
            Math.min(
              typeof resource?.dangerValue === 'number'
                ? resource.dangerValue
                : DEFAULT_DANGER_RATIO * progressValue.max,
              1,
            ),
            0,
          );
          const percent = ((getNormalizedProgress(progressValue, true) ?? 0) * 100)?.toFixed(1);

          return (
            <div key={key} className={styles.resourceGroup}>
              <ProgressBar
                minValue={progressValue.min}
                value={progressValue.current}
                maxValue={progressValue.max}
                color={
                  progressValue.current > dangerVl
                    ? theme.status.error.solid
                    : progressValue.current > warnVl
                      ? theme.status.warning.solid
                      : theme.brand.primary
                }
                glowEnabled
              />
              <div className={clsx(styles.row, styles.rowBottom)}>
                <span className={styles.extraText}>
                  {typeof resource?.extraText === 'string' ? resource?.extraText : ''}
                </span>
                <span className={styles.valueText}>
                  {typeof resource?.valueText === 'string'
                    ? resource?.valueText
                    : resource?.defaultValueTextToPercent === true
                      ? `${percent}%`
                      : 0}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
}
