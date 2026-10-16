import { useMemo, useState, useEffect, useCallback, type ChangeEventHandler } from 'react';
import styles from './Home.module.css';
import clsx from 'clsx';

import { useTheme } from '../../theme/ThemeProvider';
import { useTabs } from '../../features/tabs';
import { useAppWindow } from '../../context//AppWindowContext';

import type { TabComponentBaseProps } from '../../features/tabs';
import { type ActionConfig } from '../../features/actions';
import { generateGreeting } from '../../features/greeting';
import { formatTimestamp } from '../../utils/time/userRelativeTime';
import { useHardwareTelemetry } from '../../utils/hardware';
import { bytesToGiB } from '../../utils/bytes';
import { newProgressValue } from '../../utils/value';

import { ResolvableIcon, isValidResolvableIcon } from '../../components/icon';
import { ContentScaleButton } from '../../components/button';
import { OverheadText } from '../../components/overhead-text';
import { StatusContainer, type StatusContainerProps } from '../../components/status-container';
import { ChatInput } from '../../components/chat-input';
import { ResourceContainer } from '../../components/resource-container';

export interface HomeTabProps extends TabComponentBaseProps {}

type RecentConversation = {
  id: string;
  title: string;
  message: string;
  createdAt: number;
  updatedAt: number;
};

export default function HomeTab({ isActive, tabId }: HomeTabProps) {
  const { theme } = useTheme();
  const { setWindowIcon, setWindowTitle, setWindowInfoVisible } = useAppWindow();
  const {
    cpu,
    memory,
    gpu,
    loading: hardwareTelemetryLoading,
  } = useHardwareTelemetry({
    pollingInterval: 1000,
    enabled: isActive === true,
  });

  const [greetingText] = useState<string>(() => generateGreeting());
  const [promptText, setPromptText] = useState<string>('');

  const quickActionsList: ActionConfig[] = useMemo(
    () => [
      {
        icon: 'MessageSquareMore',
        text: 'Continue',
        extraText: 'Optimizing React Native FlatList Performance',
      },
      {
        icon: 'SquarePen',
        text: 'Text conversation',
      },
      {
        icon: 'MicAudioLines',
        text: 'Voice conversation',
      },
      {
        icon: 'Video',
        text: 'Video conversation',
      },
    ],
    [],
  );

  const recentConversationsList: RecentConversation[] = useMemo(
    () => [
      {
        id: '3f9a7c12-84be-4d6a-9c1e-5b2a7d03e861',
        title: 'Optimizing React Native FlatList Performance',
        message:
          'The most common cause of slow FlatList scrolling is re-rendering items that have not changed. Start by wrapping your row component in React.memo, giving renderItem a stable reference with useCallback, and supplying a keyExtractor that returns a stable id. Next, if your rows have a fixed height, provide getItemLayout so the list can skip',
        createdAt: 1791797421384,
        updatedAt: 1791797421384,
      },
      {
        id: 'b81e5d44-2a7f-4c90-a3d8-17f6c9e20b5a',
        title: 'TypeScript Discriminated Unions in AST Nodes',
        message:
          'A discriminated union lets you model each AST node as its own interface with a literal `type` field, such as { type: "BinaryExpression" } or { type: "Identifier" }. When you switch on node.type, TypeScript narrows the node to the exact variant, so every property access inside the case is fully type-checked. For exhaustiveness',
        createdAt: 1791781903652,
        updatedAt: 1791781903652,
      },
      {
        id: '5c07a9e3-d1b2-4f68-8e45-0a9b3c7d612f',
        title: 'Debugging Electron Main vs Renderer IPC',
        message:
          'In Electron, the main process owns Node.js and native APIs, while the renderer is sandboxed and can only reach them through IPC. If an invoke call never resolves, check that the handler is registered with ipcMain.handle before the window loads, and that the channel name in your preload script matches exactly. Also confirm contextIsolation',
        createdAt: 1791742058117,
        updatedAt: 1791742058117,
      },
      {
        id: 'e2d64b18-97c3-4a05-b6f1-8d40e5a7c392',
        title: 'Configuring Webpack Dev Server Custom Ports',
        message:
          'With webpack-dev-server, the port is set under the devServer option in your config, for example devServer: { port: 3100 }. In an Electron Forge setup, the equivalent is the port option of the WebpackPlugin in forge.config.ts. A fixed port is usually better than "auto" here, because the main process needs to know',
        createdAt: 1791688734920,
        updatedAt: 1791688734920,
      },
      {
        id: '91a3f7d6-0c58-4be2-a894-3f6d1b2e7c05',
        title: 'Designing Roblox Luau ModuleScript Architecture',
        message:
          'A good starting point for a Luau ModuleScript architecture is to separate shared logic from runtime state. Put pure, reusable code in ReplicatedStorage modules, keep server-only systems such as data handling and validation under ServerScriptService, and expose each module through a small table of functions rather than global variables. That way each system',
        createdAt: 1791601152308,
        updatedAt: 1791601152308,
      },
      {
        id: '7d4e0b95-c6a1-4328-9f7e-b52a8d1c4e60',
        title: 'Building Custom Layout Engines in Canvas',
        message:
          'A custom layout engine on Canvas has to do manually what the DOM gives you for free: measuring, positioning, and hit testing. A practical approach is to split the work into two passes. First, a measure pass computes each node size from its constraints, such as available width and text metrics from ctx.measureText. Second, an arrange pass',
        createdAt: 1791459870441,
        updatedAt: 1791459870441,
      },
      {
        id: 'c5f18a2e-3b79-4d04-8a6c-e9027f4b1d83',
        title: 'Implementing AES-256-GCM Payload Encryption',
        message:
          'AES-256-GCM gives you both confidentiality and integrity, but only if you never reuse a nonce with the same key. Generate a fresh 12-byte random IV for every message using crypto.randomBytes, encrypt the payload, and read the 16-byte authentication tag from cipher.getAuthTag(). Then transmit the IV, ciphertext, and tag together so the receiver can',
        createdAt: 1791312095763,
        updatedAt: 1791312095763,
      },
      {
        id: '28b6d3f0-5e1a-4c97-b0d2-6a8c4f19e357',
        title: 'State Management Trade-offs: Zustand vs Redux',
        message:
          'Zustand and Redux solve the same problem with different trade-offs. Zustand has far less boilerplate: a store is a single hook created with create(), and components subscribe to just the slices they select. Redux Toolkit adds more structure, with actions, reducers, and strong devtools support, which pays off in large teams where predictable',
        createdAt: 1791036688219,
        updatedAt: 1791036688219,
      },
      {
        id: 'a07c9e51-f432-4b8d-91a6-d3e5b70c2f48',
        title: 'Setting Up PNPM Monorepo Workspace Bundling',
        message:
          'To set up a PNPM monorepo, start by creating a pnpm-workspace.yaml that lists your package globs, such as apps/* and packages/*. Each package keeps its own package.json, and internal dependencies are linked with the workspace: protocol, for example "@repo/shared": "workspace:*". For bundling, make sure each',
        createdAt: 1790722140075,
        updatedAt: 1790722140075,
      },
      {
        id: '6e3b2d84-1f9c-4a76-a5e0-c47d8b93f126',
        title: 'Wireless ADB Screen Streaming Parameters',
        message:
          'Wireless ADB screen streaming comes down to three things: connection, encoding, and latency. After pairing the device with adb pair and connecting with adb connect, a tool such as scrcpy can stream the display. The main parameters to tune are --max-size to cap the resolution, --video-bit-rate to control quality and bandwidth, and',
        createdAt: 1790183552906,
        updatedAt: 1790183552906,
      },
    ],
    [],
  );

  const statusContainerData: StatusContainerProps[][] = useMemo(
    () => [
      [
        {
          icon: 'Monitor',
          title: 'Host',
          subtitle: 'This PC',
          status: 'success',
        },
        {
          icon: 'TabletSmartphone',
          title: 'Client',
          subtitle: 'Not connected',
          status: 'error',
        },
      ],
      [
        {
          icon: 'Server',
          title: 'Server',
          subtitle: 'Not connected',
          status: 'warning',
        },
        {
          icon: 'BrainCircuit',
          title: 'Ollama',
          subtitle: 'Server inactive',
          status: 'error',
        },
      ],
    ],
    [],
  );

  const recentConversations = useMemo(
    () =>
      [...recentConversationsList]
        .sort((a, b) => b.updatedAt - a.updatedAt) // newest first
        .slice(0, 5),
    [recentConversationsList],
  );

  const cpuName = useMemo(() => {
    if (hardwareTelemetryLoading) return 'CPU';
    if (typeof cpu?.manufacturer === 'string' && typeof cpu?.brand === 'string')
      return `${cpu.manufacturer} ${cpu.brand}`;
    return 'CPU';
  }, [cpu?.manufacturer, cpu?.brand]);

  const memUsage = useMemo(() => {
    if (hardwareTelemetryLoading) return 0;
    if (typeof memory?.usedBytes === 'number') return bytesToGiB(memory.usedBytes);

    return 0;
  }, [memory?.usedBytes]);

  const memUsageNormalized = useMemo(() => {
    if (hardwareTelemetryLoading) return 0;
    if (typeof memory?.totalBytes === 'number' && typeof memory?.usedBytes === 'number')
      return memory.usedBytes / memory.totalBytes;

    return 0;
  }, [memory?.totalBytes, memory?.usedBytes]);

  const handlePromptTextChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback((event) => {
    setPromptText(event.target.value);
  }, []);

  useEffect(() => {
    if (isActive) {
      setWindowIcon('House');
      setWindowTitle('Home');
      setWindowInfoVisible(true);
    }
  }, [isActive]);

  return (
    <div className={styles.root}>
      <div className={styles.layout}>
        <div className={styles.primary}>
          <section className={styles.hero}>
            <p className={styles.heroTitle}>{greetingText}</p>
            <ChatInput
              value={promptText}
              onChange={handlePromptTextChange}
              leftAction={{ icon: 'Plus' }}
              rightAction={[
                {
                  id: 'model-selector',
                  text: 'qwen3.5:9b',
                  extraIcon: 'ChevronDown',
                  priority: 'secondary',
                },
                {
                  icon: 'ArrowUp',
                  disabled: promptText.length <= 0,
                  highlighted: promptText.length > 0,
                },
              ]}
              lines={6}
            />
          </section>
          <div className={styles.scrollArea}>
            <section className={styles.actions}>
              <OverheadText className={styles.quickActionsTitle}>Quick Actions</OverheadText>
              <div className={styles.quickActionsContainer}>
                {quickActionsList.map((action, index) => {
                  const key = `quick-action-${index}`;

                  return (
                    <ContentScaleButton key={key} className={styles.quickAction}>
                      <div className={styles.quickActionContents}>
                        {isValidResolvableIcon(action?.icon) && (
                          <ResolvableIcon
                            icon={action?.icon ?? undefined}
                            size="calc(9 * var(--space-xs))"
                            color={theme.text.primary}
                            strokeWidth={2}
                            className={styles.quickActionIcon}
                          />
                        )}
                        {typeof action?.text === 'string' && (
                          <p className={styles.quickActionText}>{action?.text ?? ''}</p>
                        )}
                        {typeof action?.extraText === 'string' && (
                          <p className={styles.quickActionSubText}>{action?.extraText ?? ''}</p>
                        )}
                      </div>
                    </ContentScaleButton>
                  );
                })}
              </div>
            </section>
            <section className={styles.recent}>
              <OverheadText className={styles.recentMajorTitle}>
                Continue where you left off
              </OverheadText>
              <div className={styles.recentContainer}>
                {recentConversations.map((conversation, index) => {
                  const key = `recent-convo-${conversation?.id ?? ''}-${index}`;

                  return (
                    <ContentScaleButton key={key} className={styles.recentItem}>
                      <div className={styles.recentContents}>
                        <ResolvableIcon
                          icon="MessageSquareText"
                          size="var(--space-xxl)"
                          color={theme.text.secondary}
                          strokeWidth={1.5}
                          className={styles.recentIcon}
                        />
                        <div className={styles.recentRight}>
                          <span
                            className={styles.recentTimestamp}
                          >{`${typeof conversation.updatedAt === 'number' ? formatTimestamp(conversation.updatedAt) : 'Today'}`}</span>
                          <p className={styles.recentTitle}>{conversation?.title ?? ''}</p>
                          <p className={styles.recentMessage}>{conversation?.message ?? ''}</p>
                        </div>
                      </div>
                    </ContentScaleButton>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
        <div className={styles.secondary}>
          <section className={styles.status}>
            <OverheadText className={styles.statusMajorTitle}>Status</OverheadText>
            <div className={styles.statusContainerRoot}>
              {statusContainerData.map((datas, i) => {
                const k = `status-container-row-${i}`;

                return (
                  <div key={k} className={styles.statusContainerRow}>
                    {datas.map((data, ix) => {
                      const kx = `status-container-${i}-${ix}`;

                      return (
                        <StatusContainer
                          key={kx}
                          {...data}
                          className={clsx(styles.statusContainer, data?.className)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>
          <section className={styles.resources}>
            <OverheadText className={styles.resourcesMajorTitle}>Resources</OverheadText>
            {hardwareTelemetryLoading ? (
              <p className={styles.resourcesLoadingText}>
                Hardware telemetry is initializing, please wait.
              </p>
            ) : (
              <div className={styles.resourcesContainer}>
                <ResourceContainer
                  icon="Cpu"
                  title={cpuName}
                  subtitle={
                    typeof cpu?.physicalCores === 'number' && typeof cpu?.logicalCores === 'number'
                      ? `${cpu.physicalCores}C | ${cpu.logicalCores}T`
                      : ''
                  }
                  resourceValues={[
                    {
                      extraText: 'CPU-0',
                      progressValue: newProgressValue({
                        min: 0,
                        current: (cpu?.load?.currentLoad ?? 0) / 100,
                        max: 1,
                      }),
                      defaultValueTextToPercent: true,
                    },
                  ]}
                />
                <ResourceContainer
                  icon="Microchip"
                  title="System RAM"
                  subtitle={
                    typeof memory?.totalBytes === 'number'
                      ? `${bytesToGiB(memory.totalBytes).toFixed(1)} GiB`
                      : ''
                  }
                  resourceValues={[
                    {
                      extraText: 'MEM',
                      valueText: `${memUsage.toFixed(1)} GiB | ${(memUsageNormalized * 100).toFixed(1)}%`,
                      progressValue: newProgressValue({
                        min: 0,
                        current: memUsageNormalized,
                        max: 1,
                      }),
                    },
                  ]}
                />
                {Array.isArray(gpu) &&
                  gpu.map((gpux, index) => {
                    const key = `gpu-resource-indicator-${index}`;
                    const gpuInd = `GPU-${index}`;
                    const title = typeof gpux?.model === 'string' ? gpux.model : gpuInd;

                    const usageValid = typeof gpux?.memoryUsedMiB === 'number';
                    const totalValid = typeof gpux?.memoryTotalMiB === 'number';
                    const usageDeterminable = totalValid && usageValid;

                    const usageValue =
                      typeof gpux?.memoryUsedMiB === 'number' ? gpux.memoryUsedMiB : 0;
                    const totalValue =
                      typeof gpux?.memoryTotalMiB === 'number' ? gpux.memoryTotalMiB : 0;
                    const defCapc = typeof gpux?.vramMiB === 'number' ? gpux?.vramMiB : 0;
                    const capc =
                      gpux?.vramDynamic !== true ? (totalValid ? totalValue : defCapc) : defCapc;
                    const finalUsageNormalized = usageDeterminable ? usageValue / totalValue : 0;
                    const finalUsagePercent = (finalUsageNormalized * 100).toFixed(1);
                    const finalUtilPercent =
                      typeof gpux?.utilizationPercent === 'number' ? gpux.utilizationPercent : 0;
                    const finalUtilPercentD = (
                      typeof gpux?.utilizationPercent === 'number' ? gpux.utilizationPercent : 0
                    ).toFixed(1);

                    return (
                      <ResourceContainer
                        key={key}
                        icon="Gpu"
                        title={title}
                        subtitle={`${capc.toFixed(1)} MiB`}
                        resourceValues={[
                          {
                            extraText: gpuInd,
                            valueText: `${finalUtilPercentD}%`,
                            progressValue: newProgressValue({
                              min: 0,
                              current: finalUtilPercent / 100,
                              max: 1,
                            }),
                          },
                          usageDeterminable
                            ? {
                                extraText: 'MEM',
                                valueText: `${usageValue.toFixed(1)} MiB | ${finalUsagePercent}%`,
                                progressValue: newProgressValue({
                                  min: 0,
                                  current: finalUsageNormalized,
                                  max: 1,
                                }),
                              }
                            : {},
                        ]}
                      />
                    );
                  })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
