import React, { useCallback } from 'react';
import clsx from 'clsx';
import styles from './NavigationPanel.module.css';

import logoUrl from '../assets/icons/azurine/AzurineMasterLogoStdRes.png';

import { useTheme } from '../theme/ThemeProvider';
import { ContentScaleButton, ScaleButton } from '../components/button';
import { OverheadText } from '../components/overhead-text';
import { ResolvableIcon, type ResolvableIconInput } from '../components/icon';

export type ConversationItem = {
  key?: string;
  text: string;
  selected?: string;
  onClick?: () => void;
};

export type CategoryItem = {
  key?: string;
  text: string;
  icon: ResolvableIconInput;
  color?: string;
  onClick?: () => void;
};

export type CategoryItemGroup = CategoryItem[];

export interface NavigationPanelProps {
  isOpen?: boolean;
  // setFn?: (x: boolean) => void;
  /**
   * Read-only. Option (1) if true — panel occupies real space in the
   * Shell's flex layout. Option (2) if false — panel is still rendered
   * (respecting `isOpen`) but overlays on top of the content instead of
   * pushing it. Owned and computed by the parent (Shell); this component
   * never mutates it. Defaults to true (option 1) if omitted.
   */
  takesSpace?: boolean;
  categoryItems?: CategoryItemGroup[];
  conversationItems?: ConversationItem[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isOpen,
  // setFn,
  takesSpace,
  categoryItems,
  conversationItems,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { theme } = useTheme();

  const finalIsOpen = isOpen == true;
  const finalTakesSpace = takesSpace !== false;
  const finalCategoryItems = Array.isArray(categoryItems) ? categoryItems : [];
  const finalConversationItems = Array.isArray(conversationItems) ? conversationItems : [];

  // const handleCollapseClick = useCallback(() => {
  //   if (typeof setFn === 'function') setFn?.(false);
  // }, [setFn]);

  return (
    <div
      className={clsx(
        styles.panelWrapper,
        !finalIsOpen && styles.collapsed,
        !finalTakesSpace && styles.overlayMode,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.panelInner}>
        <div className={styles.titleGroup}>
          <div className={clsx(styles.innerTitleGroup, styles.itgLeft)}>
            <ScaleButton className={styles.majorButton} scaleValue={0.96}>
              <img src={logoUrl} className={styles.majorIcon} alt="App Logo" />
            </ScaleButton>
            <span className={styles.majorTitle}>Vision</span>
          </div>
          <div className={clsx(styles.innerTitleGroup, styles.itgRight)}>
            <ScaleButton className={styles.titleRightButton}>
              <ResolvableIcon
                icon="House"
                size="100%"
                strokeWidth={2}
                color={theme.text.secondary}
              />
            </ScaleButton>
            <ScaleButton className={styles.titleRightButton}>
              <ResolvableIcon
                icon="Search"
                size="100%"
                strokeWidth={2}
                color={theme.text.secondary}
              />
            </ScaleButton>
            <ScaleButton className={styles.titleRightButton}>
              <ResolvableIcon
                icon="EllipsisVertical"
                size="100%"
                strokeWidth={2}
                color={theme.text.secondary}
              />
            </ScaleButton>
          </div>
        </div>
        {Array.isArray(finalCategoryItems) && finalCategoryItems.length >= 1 && (
          <div className={styles.categoryMenuGroup}>
            {finalCategoryItems.map((group: CategoryItemGroup, index: number) => {
              if (Array.isArray(group) && group.length >= 1) {
                return (
                  <div key={`${index}`} className={styles.categoryMenuSubgroup}>
                    {group.map((item: CategoryItem, index: number) => {
                      const finalKey =
                        typeof item?.key === 'string' ? item.key : `${item.text}-${index}`;

                      return (
                        <ContentScaleButton
                          key={finalKey}
                          className={styles.categoryMenu}
                          onClick={item?.onClick}
                        >
                          <ResolvableIcon
                            icon={item?.icon}
                            size="var(--space-xxl)"
                            strokeWidth={1.5}
                            color={item?.color ?? theme.text.secondary}
                          />
                          {typeof item?.text === 'string' && (
                            <span className={styles.categoryMenuText}>{item?.text}</span>
                          )}
                        </ContentScaleButton>
                      );
                    })}
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
        <ScaleButton className={clsx(styles.conversationButton, styles.conversationButtonS)}>
          <ResolvableIcon
            icon="SquarePen"
            size="calc(var(--space-lg) + var(--space-xxs))"
            strokeWidth={2}
            color={theme.text.secondary}
          />
          <span className={styles.conversationButtonText}>New conversation</span>
        </ScaleButton>
        <OverheadText className={styles.conversationTypicalOverhead}>Recent</OverheadText>
        <div className={styles.conversationList}>
          {Array.isArray(finalConversationItems) &&
            finalConversationItems.length >= 1 &&
            finalConversationItems.map((item: ConversationItem, index: number) => {
              const finalKey = typeof item?.key === 'string' ? item?.key : `${item?.text}-${index}`;

              return (
                <ScaleButton
                  key={finalKey}
                  className={clsx(
                    styles.conversationButton,
                    styles.conversationButtonN,
                    !!item?.selected && styles.conversationButtonSelected,
                  )}
                >
                  <ResolvableIcon
                    icon="MessageSquareText"
                    size="calc(var(--space-lg) + var(--space-xxs))"
                    strokeWidth={2}
                    color={theme.text.disabled}
                    className={styles.conversationButtonIcon}
                  />
                  <span className={styles.conversationButtonText}>
                    {typeof item?.text === 'string' ? item?.text : ''}
                  </span>
                </ScaleButton>
              );
            })}
        </div>
        <div className={styles.separatorLine} />
        <ScaleButton className={clsx(styles.conversationButton, styles.conversationButtonS)}>
          <ResolvableIcon
            icon="BookMarked"
            size="calc(var(--space-lg) + var(--space-xxs))"
            strokeWidth={2}
            color={theme.text.secondary}
          />
          <span className={styles.conversationButtonText}>Memory</span>
        </ScaleButton>
        <ScaleButton className={clsx(styles.conversationButton, styles.conversationButtonS)}>
          <ResolvableIcon
            icon="Star"
            size="calc(var(--space-lg) + var(--space-xxs))"
            strokeWidth={2}
            color={theme.text.secondary}
          />
          <span className={styles.conversationButtonText}>Saved</span>
        </ScaleButton>
        <ScaleButton
          className={clsx(
            styles.conversationButton,
            styles.conversationButtonS,
            styles.bottomExtraGap,
          )}
        >
          <ResolvableIcon
            icon="Settings"
            size="calc(var(--space-lg) + var(--space-xxs))"
            strokeWidth={2}
            color={theme.text.secondary}
          />
          <span className={styles.conversationButtonText}>Settings</span>
        </ScaleButton>
      </div>
    </div>
  );
};
