# SafeSpeak — Talk Without Fear

> **Anonymous, multilingual mental health peer support with real-time bidirectional translation, two-tier crisis safety guardian, and strictly zero data retention.**

---

## 🌟 Core Features

- 🌐 **Real-time Bidirectional Translation**: Chat seamlessly across **English, Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்)**, and casual **Hinglish/Tenglish/Tanglish** with original vs. translated toggling.
- 🛡️ **Two-Tier Safety Guardian**:
  - **Tier 1 (Stress & Overwhelm)**: Gentle in-chat **Mild Nudge** grounding card with interactive 4-3-4 breathing guidance (*Inhale 4s $\rightarrow$ Hold 3s $\rightarrow$ Exhale 4s*).
  - **Tier 2 (Self-harm / Crisis Risk)**: Immediate full-screen **Crisis Helpline Overlay** with verified 24×7 emergency helplines (KIRAN `1800-599-0019`, Tele-MANAS `14416`, Vandrevala `1860-266-2345`) and message broadcast suppression.
  - **Moderation Filter**: Automated blocking of bullying, harassment, and dangerous medical misinformation/unverified home remedies.
- ⚡ **Intelligent Matching & Solo Fallback**: In-memory matching queue based on check-in topics, heaviness level, and language preference with instant solo companion fallback for single-user testing.
- 💬 **Themed Group Rooms**: Live rooms by topic (*Exam Stress*, *New to a City*, *3am Thoughts*, *Work Pressure*) with real-time active user counts and private crisis isolation.
- 🎙️ **Voice Notes (Web Speech API)**: Speech-to-text voice input with live audio waveform and text-to-speech (🔊) reading of translated messages.
- 🍃 **"Feeling Weather" & Sensory Grounding**: Visual emotional mood gauge (🌧️, ⛅, 🌪️, ☀️) and interactive 5-4-3-2-1 sensory grounding guide.
- 🔒 **Zero Data Retention**: Strictly one-time anonymous sessions. No accounts, profiles, emails, phone numbers, or persistent chat logs. Exiting wipes memory cleanly.

---

## 🏗️ Repository Architecture

```
SafeSpeak_Spec/
├── apps/
│   ├── server/               # Express + Socket.IO Real-time Engine
│   │   ├── src/
│   │   │   ├── ai/           # Translator, Peer Simulator & Reflection
│   │   │   ├── matching/     # In-memory Queue & Fallback
│   │   │   ├── safety/       # Crisis Detector & Moderation
│   │   │   ├── socket/       # Chat & Group Handlers
│   │   │   └── tests/        # Automated Safety & Translation Test Suite
│   └── web/                  # Vite + React 18 + Three.js + Framer Motion
│       ├── public/           # PWA Manifest & Service Worker
│       └── src/
│           ├── components/   # 3D Mascots, Feeling Weather, SOS & Install Prompt
│           ├── data/         # Companion Personas & Biographies
│           ├── hooks/        # Reactive Socket & Web Speech Hooks
│           ├── pages/        # All 15+ Screens & Safety Flows
│           └── services/     # Socket.IO Client Singleton
└── packages/
    ├── shared-types/         # Domain TypeScript Interfaces
    └── crisis-keywords/      # Multilingual Crisis & Moderation Regex Matchers
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Safety & Translation Tests
```bash
npm --prefix apps/server test
```

### 3. Start Backend Server (`http://localhost:4000`)
```bash
npm --prefix apps/server run dev
```

### 4. Start Web Application (`http://localhost:5173`)
```bash
npm --prefix apps/web run dev
```

---

## 🧪 Verified Health Endpoint
- Health Check: `GET http://localhost:4000/api/health`
```json
{
  "status": "ok",
  "service": "SafeSpeak Backend",
  "features": {
    "crisisDetection": "active",
    "multilingualTranslation": "active",
    "matchingQueue": "active",
    "peerSimulator": "active",
    "groupRooms": "active"
  }
}
```
