# Project Specification Document

## Project Name
**Local Embodied Conversational Agent (ECA) / Private AI Conversation System**
**Technical Name: HILM-ECA (Hardware-Isolated, Local Multimodal Embodied Conversational Agent**

## Target Deployment
Single-user private deployment, offline environment, localhost website, or Electron Forge desktop application. Not for public use.

## Primary Objective
Create a highly responsive, low-latency, real-time 3D AI companion capable of multimodal perception (text, voice, tone, images, live video), localized cognitive reasoning, and expressive vocal/visual generation with human-like cadence.

---

## Hardware Environment & Compute Allocation

### Host Machine
**Laptop Architecture**
- **Discrete GPU:** NVIDIA GeForce RTX 4060 Laptop GPU (8 GB GDDR6 VRAM)
- **Integrated GPU:** AMD Radeon 780M iGPU (using shared memory)
- **CPU & System RAM:** AMD Ryzen 7 8845HS, 2x8 GB DDR5-5600

### Compute Task Isolation Matrix

#### 1) AMD Radeon 780M iGPU Allocation
- Operating system (Windows 11) desktop compositor and background apps
- Electron Forge user interface framework layer
- WebGL viewport renderer (`@pixiv/three-vrm` + Three.js core mesh presentation)
- **Expected VRAM impact on dGPU:** `0.0 GB`

#### 2) NVIDIA RTX 4060 Laptop GPU Allocation
**Reserved exclusively for AI workloads**
- Ollama local inference engine (weights and active KV context cache)
- w-okada VCClient backend (real-time PyTorch RVC V2 neural voice conversion execution via CUDA)
- **Total target VRAM budget:** `6.2 GB to 7.2 GB`  
  Safely under the `8.0 GB` threshold to prevent system memory tensor offloading

#### 3) Host CPU & System RAM Allocation
- Node.js central orchestrator core event loops
- Faster-Whisper automatic speech recognition engine (Int8 execution)
- Wav2Vec2 acoustic feature extraction model (tone and emotion analysis)
- Kokoro-82M text-to-speech synthesis base engine
- Micro-service edge-polling environmental trackers (`OpenCV` / `DeepFace`)

---

## Software Architecture & Development Environment

### Hybrid System Orchestrator Pattern

#### 1) Primary Orchestrator (Node.js / TypeScript)
- Controls the core state engine, local application routing, UI IPC communication bridges, and local WebSocket servers
- Manages connections to the Ollama REST API layer using standard event streams
- Standardizes typing and data contracts between inputs and outputs
- Directly manages the real-time audio playback buffers and animation synchronization queues

#### 2) Secondary Sidecar Service (Python / FastAPI)
- Used strictly for deep learning and audio tasks that cannot be handled natively or cleanly within the JavaScript ecosystem
- Wraps PyTorch pipelines, acoustic feature tools, and OpenCV processes
- Communicates with the Node.js primary orchestrator via low-latency local WebSockets or localhost REST requests

---

## Core AI Model Layer Specifications

### 1) Cognition and Vision Framework
- **Primary Model:** Qwen3-VL-8B (qwen3-vl:8b) or Qwen3.5-9B (qwen3.5:9b)
  Quantization profiles: Q4 (`Q4_K_M`)
- **Vision Specs:** Both models have native vision label on Ollama library
- **Hosting Engine:** Ollama local runtime
- **Context Limitation:** Hard-capped via configuration (`num_ctx`) to `4,096 tokens`  
  This absolute ceiling prevents the Key-Value (KV) cache matrix from expanding past remaining VRAM boundaries during deep conversations
- **Modality Alignment:** Processes text inputs natively. Image or camera data is encoded and passed directly into the visual transformer layers on-demand, completely avoiding runtime model reloads

### 2) Perceptual Processing Engines
- **Speech-to-Text (STT):** Faster-Whisper executing at Int8 precision on CPU memory threads, controlled via a Voice Activity Detection (VAD) hook to eliminate noise processing
- **Acoustic Tone Generation:** A lightweight Wav2Vec2 audio classification architecture running on the CPU  
  It extracts prosody markers (pitch, velocity, energy variations) from raw audio segments and appends them as structural metadata tags to the text prompt payload

### 3) Expression and Vocal Synthesizers
- **Base Text-to-Speech (TTS):** Kokoro-82M executing on CPU threads  
  Synthesizes high-cadence, raw human speech audio and outputs corresponding phoneme streams
- **Voice Transformation (RVC):** w-okada VCClient standalone pipeline running RVC V2 voice models accelerated via CUDA on the RTX 4060 GPU

---

## Real-Time Audio & Animation Pipeline Data Routing

### Audio Routing Loop
1. Node.js captures raw tokens, assembles them, and pushes string components to the Kokoro TTS engine
2. Electron's internal audio player handles the raw Kokoro TTS audio buffer, routing its playback stream explicitly out of the application to the **"VB-Cable Input"** virtual recording channel
3. The external w-okada VCClient monitors **"VB-Cable Output"** in real time, runs neural voice conversion on the GPU, and outputs the final personalized voice track to the physical hardware speakers

### Lip-Sync and Animation Delay Buffer Alignment
- **Core Engine:** wawa-lipsync (`Web Audio API` `AnalyserNode` integration)
- **Execution Pattern:** Inside Electron, wawa-lipsync hooks directly into the internal Kokoro audio playback node. It performs a Fast Fourier Transform (FFT) instantly on the raw un-converted PCM audio stream to compute mouth shapes (Oculus Visemes: `AA`, `IH`, `OO`)
- **Latency Compensation:** w-okada's fixed processing delay (based on selected chunk and extra configurations, e.g. `160ms`) is treated as a static constant. Calculated viseme frames are tagged with a future timestamp target (`Current Time + RVC Latency Offset`) and pushed to an in-memory Frame-Buffer Queue
- **Render Integration:** Inside the Three.js `requestAnimationFrame` render loop executing on the iGPU, the system queries the queue every frame, pulling and applying viseme weights to the native VRM 1.0 blendshapes (via `@pixiv/three-vrm`'s `expressionManager`) only when the current timeline matches the target timestamp. This ensures mouth movement and speaker audio match perfectly

---

## Progressive 14-Stage Implementation Roadmap

### Stage 01: Core Text Engine
- Establish basic text input via Web/Electron UI
- Standardize local Ollama text-only generation API loops
- Build the core chat system, data persistence layer, rolling context window, and a local vector store (`ChromaDB` or `HNSWLib` index in Node.js) for working memory and semantic search injection

### Stage 02: Simple Voice Input
- Connect system microphone capture to the Node.js orchestrator
- Integrate the CPU-bound Faster-Whisper STT pipeline to transcribe voice inputs into flat plain text prompts

### Stage 03: Acoustic Tone Processing
- Implement the CPU-bound Wav2Vec2 feature extraction sidecar
- Extract vocal tone markers from raw user audio buffers and automatically prepend them to the LLM system prompt context  
  Example: `[User Tone: Rushed/Anxious]`

### Stage 04: Base Vocal Synthesis Output
- Integrate the Kokoro-82M TTS engine on the CPU
- Convert text responses into standard audio streams played directly through the frontend audio wrapper

### Stage 05: Token Streaming Optimization
- Refine the LLM pipeline to enable text streaming chunks from Ollama
- Implement a Regex Token Buffer Queue in Node.js that aggregates text tokens until a structural punctuation delimiter (`. , ? ! \n`) is hit before firing that complete clause to the Kokoro TTS engine  
  This preserves natural speech cadence while maintaining low generation latency

### Stage 06: Voice Conversion Integration
- Deploy w-okada VCClient and configure the VB-Cable virtual audio channels
- Route the Kokoro TTS audio output through the virtual cable into w-okada's RVC V2 execution block on the RTX 4060, delivering fully transformed custom character vocals through the hardware speakers

### Stage 07: 3D Visual Integration and Real-Time Lip-Sync
- Construct the Electron Forge frontend using Three.js and `@pixiv/three-vrm` to load the native VRoid Studio VRM 1.0 character model on the iGPU viewport
- Integrate wawa-lipsync to analyze the internal audio stream
- Implement the high-precision frame-buffer timestamp queue to delay visual mouth movements to precisely match the millisecond delay values measured from the w-okada RVC chunk engine

### Stage 08: Expressive Procedural Animations
- Implement basic ambient procedural animations in the Three.js frame loop  
  - Sinusoidal breathing
  - Passive eye-blinking
  - Natural torso swaying
- Create an expression blending module that uses linear interpolation (`Lerp`) over `200–300ms` to smoothly translate character blendshapes based on emotional context tags returned by the LLM or acoustic analyzer

### Stage 09: On-Demand Static Visual Modality
- Expand the input architecture to accept static image file uploads
- Route image matrices directly into the Qwen3-VL/Qwen3.5 vision embedding layers via Ollama without disrupting the conversational loop

### Stage 10: Intermittent Video Stream Perception
- Integrate a live webcam feed capture component into the frontend application
- Implement the **Intermittent Visual Observer** pattern: capture and transmit a single high-resolution camera snapshot to the multimodal LLM only when directed by explicit user intent or contextual prompts (e.g. “Look at this”)

### Stage 11: Agent Function Calling and Web Tools
- Implement tool-use infrastructure within the local LLM engine
- Provide the model with custom tools allowing it to perform localized system scripts, execute internet searches for context, or look up images online and interpret them via vision tracking before displaying confirmation info in the UI

### Stage 12: Advanced Acoustic Scene Recognition
- Deploy a lightweight audio classification runtime (like an ONNX deployment of YAMNet) on a parallel CPU thread
- Detect ambient environmental audio spikes (e.g. hand clapping, coughing, background noises) and pass them into the LLM context window as system notifications  
  Example: `[System Note: User clapped hands]`

### Stage 13: Autonomous Proactive Heartbeat Loops
- Implement an independent, background Heartbeat Ticker Loop within the Node.js orchestrator
- If the application state records that the user has remained completely silent for an extended threshold (e.g. 10 minutes) but is still physically active at the computer, the ticker fires an automated system instruction into the LLM to trigger a spontaneous conversational check-in

### Stage 14: Asynchronous Edge-Polling Environmental Triggers
- Construct low-overhead CPU checking scripts to continuously monitor the physical space without draining GPU VRAM

#### A. Face Tracking
- Run DeepFace/InsightFace on a 2-second CPU interval
- Extract vector embeddings to identify if an unrecognized individual enters the camera field

#### B. Scene Tracking
- Run a low-priority OpenCV script to continuously calculate Perceptual Image Hashes (`pHash`) or color histograms of the room background to detect physical environment migrations or room context changes

#### Guard Layer
Build a strict Node.js Event Arbitrator (**The Guard Layer**) to manage these incoming CPU triggers:

- **Interruption Shield:** Drop alerts if the avatar is currently speaking
- **Recency Guard:** Drop alerts if the user interacted manually within the past 30 seconds
- **Category Debounce Gate:** Cooldown rules preventing repeat trigger inputs within a 3-to-5 minute window

Approved triggers fire a single image capture frame to the GPU Vision LLM along with structural system logs for conversational adaptation

---

## Repo & App Paths

The Node.js server is called core, and the relative path is `./apps/core/`.
The Python folder is called sidecar, and the relative path is `./apps/sidecar/`.
The Electron Forge app relative path is `./apps/desktop/`.

---

## Initial Folder Structure
- apps/
- apps/core/
- apps/core/src/
- apps/core/src/config/
- apps/core/src/lib/
- apps/core/src/services/
- apps/core/src/index.ts
- apps/core/package.json
- apps/core/tsconfig.json
- apps/sidecar/
- apps/desktop/
- apps/desktop/src/
- apps/desktop/assets/
- apps/desktop/src/App.tsx
- apps/desktop/src/index.css
- apps/desktop/src/index.html
- apps/desktop/src/index.ts
- apps/desktop/src/preload.ts
- apps/desktop/src/renderer.tsx
- apps/desktop/.npmrc
- apps/desktop/forge.config.ts
- apps/desktop/package.json
- apps/desktop/tsconfig.json
- apps/desktop/webpack.main.config.ts
- apps/desktop/webpack.plugins.ts
- apps/desktop/webpack.renderer.config.ts
- apps/desktop/webpack.rules.ts
- assets/
- data/
- data/docs/
- data/docs/info/
- data/docs/info/project.md
- packages/
- tooling/
- .editorconfig
- .gitattributes
- .gitignore
- .node-version
- .npmrc
- .prettierignore
- AGENTS.md
- CLAUDE.md
- eslint.config.js
- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- prettier.config.mjs
- tsconfig.base.json