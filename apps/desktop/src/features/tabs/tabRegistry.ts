import { lazy, type ComponentType } from 'react';

import type { ResolvableIconInput, ResolvableIconProps } from '../../components/icon';

export interface TabDefinition {
  title: string;
  icon?: ResolvableIconInput;
  component: ComponentType<any>;
}

export const TAB_REGISTRY: Record<string, TabDefinition> = {
  chat: {
    title: 'Chat',
    icon: 'MessagesSquare',
    component: lazy(() => import(/* webpackChunkName: "tab-chat" */ './views/ExampleChatView')),
  },
  home: {
    title: 'Home',
    icon: 'House',
    component: lazy(() => import('../../tabs/home/Home')),
  },
  conversation: {
    title: 'New Conversation',
    icon: 'MessagesSquare',
    component: lazy(() => import('../../tabs/conversation/Conversation')),
  },
};
