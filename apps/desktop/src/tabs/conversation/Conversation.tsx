import { useState, useEffect, useCallback, type ChangeEventHandler } from 'react';
import styles from './Conversation.module.css';
import clsx from 'clsx';

import { useTheme } from '../../theme/ThemeProvider';
import { useTabs } from '../../features/tabs';
import { useAppWindow } from '../../context//AppWindowContext';

import type { TabComponentBaseProps } from '../../features/tabs';

import { generateGreeting } from '../../features/greeting';

import { ResolvableIcon } from '../../components/icon';
import { ScaleButton, ContentScaleButton } from '../../components/button';
import { ChatInput } from '../../components/chat-input';

export interface HomeTabProps extends TabComponentBaseProps {}

export default function HomeTab({ isActive, tabId }: HomeTabProps) {
  const { theme } = useTheme();
  const { setWindowIcon, setWindowTitle, setWindowInfoVisible } = useAppWindow();

  const [greetingText] = useState<string>(() => generateGreeting());
  const [promptText, setPromptText] = useState<string>('');

  const handlePromptTextChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback((event) => {
    setPromptText(event.target.value);
  }, []);

  useEffect(() => {
    if (isActive) {
      setWindowIcon('MessagesSquare');
      setWindowTitle('New Conversation');
      setWindowInfoVisible(true);
    }
  }, [isActive]);

  return (
    <div className={clsx(styles.root, styles.rootInitial)}>
      <div className={styles.layout}>
        <p className={styles.heroTitle}>{greetingText}</p>
        <ChatInput
          value={promptText}
          onChange={handlePromptTextChange}
          displayMode="expanded"
          contextActions={[
            {
              icon: 'Plus',
              priority: 'primary',
              position: 'left',
            },
            {
              id: 'model-selector',
              text: 'qwen3.5:9b',
              extraIcon: 'ChevronDown',
              priority: 'secondary',
              position: 'right',
            },
            {
              icon: 'Video',
              priority: 'secondary',
              position: 'right',
            },
            {
              icon: 'Mic',
              priority: 'secondary',
              position: 'right',
            },
            {
              icon: 'AudioLines',
              priority: 'secondary',
              position: 'right',
            },
            {
              icon: 'ArrowUp',
              disabled: promptText.length <= 0,
              highlighted: promptText.length > 0,
              position: 'right',
            },
          ]}
          lines={3}
          containerClassName={styles.chatInputContainer}
        />
      </div>
    </div>
  );
}
