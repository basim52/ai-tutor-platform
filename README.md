# AI Tutor Platform 🎓

A multimodal, real-time AI Tutor application featuring an interactive digital whiteboard powered by **[tldraw](https://tldraw.dev/)**, **Google Gemini 2.5 Flash** (via `@google/genai`), and **WebSockets**.

---

## ✨ Features

- **Interactive Digital Whiteboard**: Complete vector canvas powered by `@tldraw/tldraw` with drawing, shapes, math notation, and note pinning.
- **Multimodal Canvas Perception**: Directly captures canvas snapshots and sends them to Google Gemini for real-time analysis.
- **Socratic Tutoring Engine**:
  - 🔍 **Inspect Board**: Step-by-step review of handwritten work, diagrams, and equations.
  - 💡 **Next Hint**: Gentle hints guiding the student without spoiling final solutions.
  - ✅ **Check Work**: Identifies errors, algebraic slips, and conceptual oversights.
- **Bi-Directional Canvas Interaction**: Pin the AI Tutor's explanations directly back onto the canvas as sticky notes.
- **Voice Narration (TTS)**: Built-in text-to-speech to read the tutor's advice aloud.
- **Pre-Loaded Sample Problems**: Instant templates for Calculus, Physics, and Geometry.

---

## 🛠️ Prerequisites

- **Node.js** (v18 or v20+)
- **npm** or **pnpm**
- (Optional for live Gemini calls) A free API key from [Google AI Studio](https://aistudio.google.com/). *Note: A demo fallback mode is built-in if no key is provided!*

---

## 🚀 Getting Started

### 1. Install Dependencies
Run from the project root:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
```

### 3. Start the Backend Server
In one terminal window:
```bash
npm run server
```
This runs `server.ts` via `tsx` on `ws://localhost:3001`.

### 4. Start the Vite Frontend
In another terminal window:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📁 Project Structure

```
ai-tutor-platform/
├── src/
│   ├── components/
│   │   ├── Whiteboard.tsx     # tldraw integration & canvas snapshot capture
│   │   └── TutorPanel.tsx     # Chat history, quick action buttons & TTS
│   ├── hooks/
│   │   └── useTutorSocket.ts  # WebSocket client hook with streaming
│   ├── App.tsx                # Layout & coordinator
│   ├── App.css                # Polished dark/light UI styling
│   ├── index.css              # Global styles
│   └── main.tsx               # React DOM entry
├── server.ts                  # Node.js WebSocket server + @google/genai SDK
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite dev server configuration
└── tsconfig.json              # TypeScript configuration
```
