import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type CSSProperties,
  type TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import styles from './ChatInput.module.css';

import {
  isValidAction,
  createAction,
  ActionButton,
  type ActionConfig,
} from '../../features/actions';

export type DisplayMode = 'compact' | 'expanded';

export type DisplayModeParam = DisplayMode | 'auto';

export type ContextActionPosition = 'left' | 'right';

export type ContextActionProps = ActionConfig & {
  position?: ContextActionPosition;
};

export type ActionConfigList = ActionConfig | ActionConfig[];

export interface ChatInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  leftAction?: ActionConfigList;
  rightAction?: ActionConfigList;
  contextActions?: ContextActionProps[];
  displayMode?: DisplayModeParam;
  lines?: number;
  containerClassName?: string;
  onCompact?: () => void;
  onExpand?: () => void;
}

const DEFAULT_LINES = 4;

type CreateActionOptions = Parameters<typeof createAction>[1];

function resolveSideActions(
  input: ActionConfigList | undefined,
  options?: CreateActionOptions,
): ActionConfig[] {
  if (Array.isArray(input)) {
    return input.map((item) => createAction(item)).filter((action) => isValidAction(action));
  }

  const action = createAction(input, options);
  return isValidAction(action) ? [action] : [];
}

/**
 * Splits context actions by `position` ourselves instead of using `normalizeActions`:
 * `normalizeActions` treats any object with a key outside ACTION_CONFIG_KEYS (like `position`)
 * as a record of actions and mangles it.
 */
function splitContextActions(actions?: ContextActionProps[]) {
  const left: ActionConfig[] = [];
  const right: ActionConfig[] = [];

  if (!Array.isArray(actions)) return { left, right };

  for (const item of actions) {
    if (!item || typeof item !== 'object') continue;

    const { position, ...config } = item;
    const action = createAction(config);
    if (!isValidAction(action)) continue;

    (position === 'right' ? right : left).push(action);
  }

  return { left, right };
}

export function ChatInput({
  leftAction,
  rightAction,
  contextActions,
  displayMode,
  lines,
  onCompact,
  onExpand,
  containerClassName,
  className,

  value,
  onChange,
  placeholder,
  ...props
}: ChatInputProps) {
  const leftActs = resolveSideActions(leftAction);
  const rightActs = resolveSideActions(rightAction);
  const hasLeft = leftActs.length > 0;
  const hasRight = rightActs.length > 0;
  const { left: leftContext, right: rightContext } = splitContextActions(contextActions);

  const requestedMode: DisplayModeParam =
    displayMode === 'compact' || displayMode === 'expanded' || displayMode === 'auto'
      ? displayMode
      : 'auto';
  const isAuto = requestedMode === 'auto';

  const maxLines =
    typeof lines === 'number' && Number.isFinite(lines) && lines >= 1
      ? Math.floor(lines)
      : DEFAULT_LINES;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLTextAreaElement>(null);

  // True when the current text would NOT fit on one row in the compact layout.
  const [overflowsCompact, setOverflowsCompact] = useState(false);

  /**
   * Pushes the text into the hidden compact-width replica and checks whether it needs more
   * than one row. The replica is always laid out in compact geometry, independent of the
   * current mode, so the result does not change when the real textarea widens. That is what
   * makes compact <-> expanded reversible without flip-flopping.
   */
  const measure = useCallback((text: string) => {
    const probe = measureRef.current;
    if (!probe) return;

    if (probe.value !== text) probe.value = text;
    setOverflowsCompact(probe.scrollHeight > probe.clientHeight + 1);
  }, []);

  // Re-measure after every commit that changes the text (controlled) or the compact geometry.
  // Runs before paint, so the mode switch never flashes an intermediate frame.
  useLayoutEffect(() => {
    if (textareaRef.current) measure(textareaRef.current.value);
  }, [value, leftActs.length, rightActs.length, isAuto, measure]);

  // Re-measure when the compact width changes (window resize, button content change) or when
  // the custom font finishes loading and glyph metrics change.
  useLayoutEffect(() => {
    const probe = measureRef.current;
    if (!probe) return;

    const remeasure = () => {
      if (textareaRef.current) measure(textareaRef.current.value);
    };

    const observer = new ResizeObserver(remeasure);
    observer.observe(probe);
    document.fonts?.addEventListener('loadingdone', remeasure);

    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', remeasure);
    };
  }, [isAuto, measure]);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      // Controlled: the layout effect above handles it once `value` updates.
      if (value === undefined) measure(event.currentTarget.value);
      onChange?.(event);
    },
    [value, measure, onChange],
  );

  const mode: DisplayMode =
    requestedMode === 'auto' ? (overflowsCompact ? 'expanded' : 'compact') : requestedMode;
  const isExpanded = mode === 'expanded';

  const modeCallbacksRef = useRef({ onCompact, onExpand });
  useEffect(() => {
    modeCallbacksRef.current = { onCompact, onExpand };
  });

  const prevModeRef = useRef<DisplayMode>(mode);
  useEffect(() => {
    if (prevModeRef.current === mode) return;
    prevModeRef.current = mode;

    const { onCompact, onExpand } = modeCallbacksRef.current;
    (mode === 'expanded' ? onExpand : onCompact)?.();
  }, [mode]);

  const showLeftInMain = hasLeft && !isExpanded;
  const showRightInMain = hasRight && !isExpanded;
  const showLeftInContext = hasLeft && isExpanded;
  const showRightInContext = hasRight && isExpanded;

  const hasContextLayout =
    leftContext.length > 0 || rightContext.length > 0 || showLeftInContext || showRightInContext;

  const renderActions = (actions: ActionConfig[], prefix: string, asMeasure = false) => (
    <div className={styles.actionGroup}>
      {actions.map((action, index) => (
        <ActionButton
          key={`${prefix}-${index}`}
          actionConfig={asMeasure ? { ...action, type: 'normal' } : action}
          className={clsx(action.id === 'model-selector' && styles.modelSelectorExtra)}
        />
      ))}
    </div>
  );

  return (
    <div
      className={clsx(styles.root, containerClassName)}
      style={{ '--ci-max-lines': maxLines } as CSSProperties}
      data-display-mode={mode}
    >
      <div
        className={clsx(
          styles.mainLayout,
          hasLeft || hasRight ? isExpanded && styles.mainLayoutInset : styles.mainLayoutNoActions,
        )}
      >
        {showLeftInMain && renderActions(leftActs, 'mainLeft')}
        <textarea
          autoFocus
          {...props}
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={typeof placeholder === 'string' ? placeholder : 'Type here to start...'}
          rows={1}
          spellCheck={false}
          className={clsx(
            styles.mainTextarea,
            isExpanded ? styles.mainTextareaExpanded : styles.mainTextareaCompact,
            (isExpanded || !hasLeft) && styles.mainTextareaNoActionsLeft,
            (isExpanded || !hasRight) && styles.mainTextareaNoActionsRight,
            className,
          )}
        />
        {showRightInMain && renderActions(rightActs, 'mainRight')}
      </div>

      {hasContextLayout && (
        <div className={styles.contextLayout}>
          <div className={styles.contextLayoutSpace}>
            {showLeftInContext && renderActions(leftActs, 'ctxLeftMain')}
            {leftContext.map((action, index) => (
              <ActionButton
                key={`contextActionLeft-${index}`}
                actionConfig={action}
                className={clsx(action.id === 'model-selector' && styles.modelSelectorExtra)}
              />
            ))}
          </div>
          <div className={styles.contextLayoutGap} />
          <div className={styles.contextLayoutSpace}>
            {rightContext.map((action, index) => (
              <ActionButton
                key={`contextActionRight-${index}`}
                actionConfig={action}
                className={clsx(action.id === 'model-selector' && styles.modelSelectorExtra)}
              />
            ))}
            {showRightInContext && renderActions(rightActs, 'ctxRightMain')}
          </div>
        </div>
      )}

      {/* Hidden compact-layout replica used only for measuring. Never focusable or visible. */}
      {isAuto && (
        <div className={clsx(styles.mainLayout, styles.measureLayout)} aria-hidden="true">
          {hasLeft && renderActions(leftActs, 'measureLeft', true)}
          <textarea
            ref={measureRef}
            className={clsx(styles.mainTextarea, styles.measureTextarea)}
            rows={1}
            spellCheck={false}
            tabIndex={-1}
            readOnly
          />
          {hasRight && renderActions(rightActs, 'measureRight', true)}
        </div>
      )}
    </div>
  );
}
