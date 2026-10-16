// ExampleChatView.tsx
//
// Stand-in for a typical tab: it has its own local state, doesn't do any
// continuous rendering work, and therefore has no reason to care whether
// it's currently visible. `isActive` is accepted for interface consistency
// with TAB_REGISTRY but intentionally unused here — that's normal, not an
// oversight. Its state (the draft text below) will survive switching away
// to another tab and back, because this component stays mounted the whole
// time; only its container's `display` style changes.

import { useState } from 'react';

import type { TabComponentBaseProps } from '../tabs.types';

export interface ExampleChatViewProps extends TabComponentBaseProps {
  conversationId?: string;
}

export default function ExampleChatView({ conversationId }: ExampleChatViewProps) {
  const [draft, setDraft] = useState('');

  return (
    <div style={{ padding: 16, height: '100%', boxSizing: 'border-box' }}>
      <h3>Chat {conversationId ? `— ${conversationId}` : ''}</h3>
      <p>Type something, switch tabs, then switch back — this text survives.</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        style={{ width: '100%', height: 120 }}
        placeholder="Draft message..."
      />
    </div>
  );
}
