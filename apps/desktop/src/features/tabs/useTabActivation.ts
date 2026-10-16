import { createContext, useContext } from 'react';
import type { TabActivationValue } from './tabs.types';

export const TabActivationContext = createContext<TabActivationValue>({
  isActive: false,
  activationCount: 0,
});

export function useTabActivation(): TabActivationValue {
  return useContext(TabActivationContext);
}
