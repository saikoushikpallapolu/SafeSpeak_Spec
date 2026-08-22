# SafeSpeak

> Anonymous, multilingual peer-support chat — speak in your language, be heard in theirs.

---

## Quick Orientation

| Directory | What lives here |
|---|---|
| `apps/web/` | Next.js frontend — all 17 screens, components, hooks |
| `apps/server/` | Node.js + Socket.io backend — real-time rooms, Gemini pipeline, safety logic |
| `packages/shared-types/` | TypeScript types shared between frontend and backend |
| `packages/crisis-keywords/` | Multi-language keyword lists for Layer-1 crisis detection (no API call) |
| `packages/ui-kit/` | Design tokens + reusable React components |
| `scripts/` | Dev/ops utilities — crisis test suite, helpline verifier |
| `docs/` | Product concept + build plan docs |

See **`docs/REPO_STRUCTURE.md`** (or the artifact panel) for the full breakdown — module file trees, socket event map, DB schema, and the debug checklist.

---

## Getting Started

```bash
# Install all workspaces
npm install

# Start frontend (http://localhost:3000)
cd apps/web && npm run dev

# Start backend (ws://localhost:3001)
cd apps/server && npm run dev

# Run the crisis-detection test set (MUST pass before any merge)
cd apps/server && npm test
```

---

## Environment Variables

Copy `.env.example` in each app and fill in:

```
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## Build Phases

| Phase | Goal | Key modules |
|---|---|---|
| **1 — MVP** | Anonymous 1:1 chat + translation + crisis detection | `server/ai`, `server/safety`, `crisis-keywords` |
| **2 — Differentiators** | Check-in, matching moment, Anonymous Friends, group rooms | `web/matching`, `web/friends`, `server/friends.handler` |
| **3 — Stretch** | Voice I/O, topic-based matching, SOS button | `web/hooks/useVoice`, `server/rooms.handler` |
