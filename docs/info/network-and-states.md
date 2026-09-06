# HILM-ECA Desktop Companion System: Network & State Specification Document

**Target Audience:** AI Agents, Large Language Models (LLMs), Human Engineers
**Document Version:** 1.0.0
**System Status:** Architecture Approved & Finalized
**Execution Scope:** Local, Local Area Network (LAN), and Secure Online Deployment

---

## 1. System Architecture & Compute Isolation Model

The HILM-ECA application implements a strict compute isolation model designed to minimize graphics pipeline contention on single-user workstations:

* **Renderer Process (Client UI):** Executed exclusively on the host system's iGPU to guarantee fluid rendering of custom UI animations and the 3D VRM virtual avatar without layout thrashing or process-level performance drops.
* **Core Server Engine:** Manages complex business logic, coordinates system hooks, and interfaces with the AI inference layer.
* **AI Inference Layer (Ollama Engine):** Isolated on the host system's discrete dGPU to isolate processing spikes during token generation from the UI rendering pipeline.

To safely maximize performance within Electron Forge + Webpack TS + React, the system uses a single-window model. Configuration menus utilize React HTML overlays rather than multiple Electron BrowserWindow processes, eliminating the memory and VRAM overhead of multiple Chromium instances.

---

## 2. Hybrid Protocol Infrastructure (REST + WebSocket)

Communication between the Electron Client and the Core Server utilizes a hybrid networking architecture to balance high-speed streaming with transactional reliability:

### A. HTTP REST API Channel

* **Use Case:** Transactional request-response workflows where state synchronization is discrete.
* **Operations:** Retrieving historical conversations, reading/writing system configurations, updating user application settings.
* **Design Rationale:** Bypasses the need for a custom request-response multiplexer over WebSockets, ensuring standard async/await operations work natively.

### B. WebSocket Channel (`ws://` or `wss://`)

* **Use Case:** Persistent, low-latency, real-time bidirectional messaging and data pipelining.
* **Operations:** Streaming LLM generated tokens chunk-by-chunk from Ollama, piping real-time hardware diagnostics, streaming real-time system performance logs.

### C. Address Derivation Rule

Both communication protocols must share the exact same network configuration to prevent endpoints from desynchronizing. The client dynamically constructs the protocol strings based on the specified server mode:

#### Local Mode

* **Input:** `[Port Number]` (e.g., `"8080"`)
* **HTTP:** `http://localhost:8080`
* **WS:** `ws://localhost:8080`

#### LAN Mode

* **Input:** `[IP Address / Host] + [Port Number]` (e.g., `"192.168.1.50:8080"`)
* **HTTP:** `http://192.168.1.50:8080`
* **WS:** `ws://192.168.1.50:8080`

#### Online Mode

* **Input:** `[Base Domain URL]` (e.g., `"example.website.com"`)
* **HTTP:** `https://example.website.com`
* **WS:** `wss://example.website.com`

---

## 3. Global State Management & Persistence

State management is handled globally at the absolute root of the React component tree via a centralized engine context (`NetworkContext`). Screens, panels, and input elements consume this global state reactively rather than initializing separate local connections.

### A. Global State Objects & Cache Storage

* **Connection Status:** Tracked globally via states: `'connected'`, `'disconnected'`, or `'connecting'`.
* **Cognitive Engine Status:** Tracked globally via states: `'online'`, `'offline'`, or `'unknown'` to reflect the status of the local Ollama instance.
* **Server Profile:** Contains the active server configuration (mode, host, port).
* **Conversation Cache:** An application-wide data layer storing lists of conversations and active chat histories, allowing instant views when switching screens without pulling repetitive HTTP requests.

### B. Application Startup Lifecycle

1. The root `NetworkProvider` mounts in the Electron Renderer process.
2. The component initializes and reads the browser environment's `localStorage` key: `HILM_LAST_SERVER_PROFILE`.
3. If the profile object is present, the app shifts the connection state to `'connecting'` and automatically starts handshake verification loops over HTTP and WebSockets.
4. If no profile exists, the app transitions to a `'disconnected'` state and waits for manual user input.

---

## 4. Interface Type Specifications (`types.ts`)

The network context layout enforces strict structural contracts using the following TypeScript definitions:

```ts
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';
export type OllamaStatus = 'online' | 'offline' | 'unknown';
export type ServerMode = 'local' | 'lan' | 'online';

export interface ServerProfile {
  mode: ServerMode;
  host: string;
  port?: string;
}

export interface NetworkContextState {
  connectionStatus: ConnectionStatus;
  ollamaStatus: OllamaStatus;
  currentProfile: ServerProfile | null;
  conversationsCache: any[];
  activeChatHistory: any[];
  connect: (profile: ServerProfile) => Promise<boolean>;
  disconnect: () => void;
}
```

---

## 5. UI/UX Functional Architecture

UI elements must react immediately to any changes in network context variables using CSS Modules for modular styling control.

### A. Connection Management Modal Overlay

* **Form Factor:** Custom React modal container injected directly within the single BrowserWindow tree. Includes a background blur effect (`backdrop-filter: blur`) to separate layers without layout engine performance hits.
* **Interactivity:** Includes a segmented button toggle group supporting Local, LAN, and Online modes. Swapping options dynamically replaces placeholder inputs between specific port numbers or domain URLs.
* **Connection State:** While validating network states, form inputs transition to a dimmed, read-only mode. The modal cleanly unmounts upon a successful handshake response.

### B. Frameless Window Titlebar Status Indicators

* **Form Factor:** Embedded next to the application's frameless window window controls (Minimize, Maximize, Close).
* **Presentation:** Two precise circular indicator icons (8px by 8px) using CSS box-shadow glows matching their operational context.

  * **Node 1:** Core Server Sync Status
  * **Node 2:** Ollama AI Engine Status
* **Color Coding Maps:**

  * **Emerald (`#10B981`)** -> Connected / Stable Operation
  * **Amber (`#F59E0B`)** -> Attempting Handshake / Reconnecting
  * **Crimson (`#EF4444`)** -> Disconnected / System Engine Offline
* **Action Vectors:** Indicators are wrapped within standard HTML buttons with transparent backgrounds. Clicking either indicator calls the internal navigation engine to route the client directly to the `/connections` view.

---

## 6. Fault Tolerance & Defensive Layout Degradation

To maintain visual stability, the application UI must fail gracefully when the server connection drops or the Ollama instance is unreachable:

* **Input Interception:** When `connectionStatus` is not `'connected'`, the central chat component locks its layout by injecting a native HTML `disabled` attribute into the primary textarea field and submit button. The placeholder text updates dynamically to read: `"[ disconnected from server ]"`.
* **Inline Notice Injection:** Instead of opening blocking dialogue errors or layout interruptions, application components render clear status alert banners directly into the current workspace viewport:

  * **Core Server Offline:** `"Core Connection Offline - Please check your host network settings panel."`
  * **Ollama Engine Offline:** `"Ollama Engine Offline - Ensure the discrete hardware inference backend is running."`
