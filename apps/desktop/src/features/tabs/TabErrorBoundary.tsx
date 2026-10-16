import { Component, type ReactNode, type ErrorInfo } from 'react';
import styles from './TabErrorBoundary.module.css';

import { useTheme } from '../../theme/ThemeProvider';

import { ResolvableIcon } from '../../components/icon';
import { ScaleButton } from '../../components/button';

export interface TabErrorBoundaryProps {
  tabTitle: string;
  children: ReactNode;
}

export interface TabErrorState {
  error: Error | null;
}

export class TabErrorBoundary extends Component<TabErrorBoundaryProps, TabErrorState> {
  state: TabErrorState = { error: null };

  static getDerivedStateFromError(error: Error): TabErrorState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[Tab: ${this.props.tabTitle}] render error`, error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      const { theme } = useTheme();

      const handleRetry = () => this.setState({ error: null });

      return (
        <div className={styles.canvas}>
          <ResolvableIcon
            icon="CircleX"
            size="calc(8 * var(--space-sm))"
            strokeWidth={1.5}
            color={theme.status.error.solid}
          />
          <span className={styles.textSpan}>Something went wrong in '{this.props.tabTitle}'.</span>
          <ScaleButton className={styles.button} onClick={handleRetry}>
            <ResolvableIcon
              icon="RotateCw"
              size="calc(5 * var(--space-xs))"
              strokeWidth={2}
              color={theme.text.secondary}
            />
            <span className={styles.textSpan}>Retry</span>
          </ScaleButton>
        </div>
      );
    }

    return this.props.children;
  }
}
