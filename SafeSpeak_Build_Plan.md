# SafeSpeak — Build Plan

## 1. What to build first (and what needs the most runway)

Your doc's own Phase 1/2/3 split is right in spirit. Here's the same split with *why*, ranked by build risk rather than just feature importance — because the things that are hard to get right need to start earliest, not the things that are "core."

### Start immediately — Week 1 (low risk, but everything else sits on top of these)
- **Anonymous session system** — no login, just a generated session ID stored client-side. Trivial, but it's the foundation every other feature depends on.
- **Character selection screen** — static assets, a tap handler, session gets tagged with a character ID.
- **Basic 1:1 real-time text chat** (no translation yet) — get two browser tabs talking to each other over a WebSocket room. This proves your real-time plumbing works before you add AI on top of it.
- **Privacy explanation page** — pure content, zero engineering risk. Do it early so it's never the thing you're rushing at 2am.

### Start early, budget the most time — Week 1–3 (highest technical risk, safety-critical)
These are the two features that actually determine whether the app is safe to demo, so they need the most iteration, not just the most code:

- **Translation pipeline (Gemini-backed)** — the risk isn't calling an API, it's *prompt quality*. "Mujhe bahut stress ho raha hai" needs to come out natural, and "I feel a little low" must never come out as "extremely sad" (your own example — that's a meaning-shift bug, not a translation bug). Budget real time to test against a list of Hindi/Telugu/Tamil/Hinglish sample phrases you write yourself, not just happy-path testing.
- **Two-layer crisis detection** — this is the single feature where a false negative is catastrophic. Budget the most testing time here of anything in the app: build a test set of ~30–40 real-sounding messages (obvious crisis phrases, subtle ones like "I don't see the point of tomorrow," clearly-fine messages) and re-run it every time you touch the prompt. Don't treat this as "done" until it's been adversarially tested by someone other than you.

Because both of these route through the same Gemini call (see Section 3), you can build and test them together — which is good, since it also means you should **not** touch this pipeline right before a demo without re-running your test set.

### Build once the above is solid — Week 3–5 (moderate risk, high value)
- Moderation (bullying / false health advice) — same Gemini call as above, so mostly a prompt-design task once the pipeline exists.
- Matching moment + shared-context reveal — pure frontend/animation work, no new backend risk.
- End-of-chat reflection card — same, low risk, do it once chat itself is stable.
- Anonymous Friends (persistent tag, friends list, block) — needs a small DB schema (tag ↔ session mapping) but no AI, so it's contained risk.

### Build last, cut first if time runs short — Week 5+
- **Voice-to-text / text-to-voice** — flagged as a differentiator in your doc, and it is genuinely impressive in a demo, but it's also where cross-platform pain concentrates: the Web Speech API (browser-native STT) works well on Chrome/Android and desktop Chrome/Edge, but has patchy support on iOS Safari. If judges may be on iPhones, either budget extra time for a fallback (e.g., record audio and send it to Gemini for transcription instead of relying on the browser) or be upfront that voice is a "best on Android/desktop" feature for this version.
- **Themed Rooms / group chat** — your doc already flags this as the heaviest feature to build, and I agree: per-message-private-crisis-overlay logic inside a group context, plus mute/remove controls, is real engineering. Build it last, and don't be afraid to cut it if Phase 1–2 ate more time than planned — a working 1:1 app beats a half-working group chat feature.
- SOS button, "Feeling weather," topic-based matching, slow-connection tuning — stretch goals, exactly as your doc says.

---

## 2. Tech stack (one codebase, works on mobile web *and* desktop)

You don't need separate mobile/desktop builds — a responsive web app covers both, and can be installed as a PWA on phones for an app-like feel without app-store friction. That's the right call for a project on a deadline.

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js (React) + Tailwind CSS** | One responsive codebase; Tailwind's breakpoints handle mobile vs desktop layout without duplicating screens. Deployable as a PWA (installable icon, works full-screen on mobile). |
| Real-time chat | **Node.js + Socket.io**, run as a small standalone server (not serverless functions — WebSockets need a persistent process) | Handles 1:1 rooms and group rooms with the same abstraction (a "room" is a room, whether 2 people or 20). |
| Database | **Postgres via Supabase** (free tier) | Gives you Postgres + a dashboard + easy hosted setup without provisioning your own DB server — good fit for hackathon timelines. Stores only: session ID, character, anonymous-friend tags, block lists. Never store chat content past the session, per your own spec. |
| Matching queue | In-memory queue in the Node process for now | At 10 users/day you don't need Redis — it adds an operational dependency you don't need yet. If you later need multiple server instances, add Redis then, not now. |
| AI (translation, moderation, crisis) | **Gemini API**, called only from your backend (never from the browser — see Section 3) | Details below. |
| Voice | **Web Speech API** (browser-native) for STT/TTS where supported, with Gemini as a transcription fallback for browsers that don't support it well | Free, no extra API calls for the common case. |
| Hosting | **Vercel** (frontend) + **Railway or Render** (Socket.io backend, free/hobby tier) | Both have generous free tiers that comfortably cover 10 users/day. |

This stack means: same URL, same code, works whether someone opens it on a laptop or a phone browser. No native app needed.

---

## 3. Gemini API architecture — translation, moderation, crisis detection

### Model recommendation
Use **Gemini 3 Flash** (or **Gemini 2.5 Flash** as a close second) as your single model for this pipeline — not Flash-Lite. Reasoning: translation nuance and crisis detection are exactly the kind of judgment calls where the cheapest/fastest model is more likely to miss a subtle case. Flash sits at the right point: strong enough for meaning-preserving translation and semantic crisis detection, still fast and cheap enough that cost is a non-issue at your scale, and it's on Google's free tier.

Don't use Flash-Lite for the crisis-detection layer specifically — it's built for high-volume simple classification, and this isn't a task where you want the cheapest possible pass.

### One call, not three
Instead of making separate API calls for translation, moderation, and crisis detection on every message (3x the latency, 3x the calls), send **one Gemini request per message** that returns structured JSON with all three results at once. Gemini supports structured output (a response schema), so you get back something like:

```json
{
  "translated_text": "...",
  "moderation": { "verdict": "clean | soft_flag | block", "category": null },
  "crisis_tier": 0
}
```

This cuts your API usage by roughly 3x, halves latency per message (one round trip, not three), and keeps the crisis/moderation logic consistent with the translation context (the model sees the original message once, in full context, rather than three isolated calls that could disagree with each other).

### Two-layer detection, concretely
- **Layer 1 (instant, no API call):** a fixed keyword/phrase list per supported language, checked locally before the message even leaves your server. Catches obvious crisis wording with zero latency and zero API dependency — this layer should never go down even if Gemini's API has an outage.
- **Layer 2 (the Gemini call above):** the `crisis_tier` field in the structured response. This is what catches "I don't see the point of tomorrow" — phrasing that means the same thing without matching any fixed phrase.

If either layer flags Tier 2, route to the crisis overlay immediately — don't wait for both to agree.

### Where the API key lives
Call Gemini only from your Node backend, never from the browser. If the key is embedded in frontend JS, anyone can extract it and burn your quota (or worse, run up a paid-tier bill if you ever move off free tier). The browser talks to your Socket.io server, your server talks to Gemini.

### How many API keys you need
**One is enough — get two for demo-day resilience.**

At 10 users/day, even generously assuming each user sends 30–40 messages in a session, you're looking at roughly 300–400 Gemini calls/day. Gemini's free tier for Flash models currently runs around 1,500 requests/day and 10 requests/minute — comfortably above what you'll use, even before you factor in that combining translation+moderation+crisis into one call (Section 3) cuts your call count further.

The reason to grab a **second key** isn't volume — it's insurance for the day it matters most: if you hit the per-minute limit during a live demo (e.g., several judges testing simultaneously, or a burst of retries), you don't want the app visibly failing. Get two free-tier keys from two separate Google accounts, and have your backend round-robin between them or fail over to the second if the first returns a rate-limit error. That's a small amount of code for a meaningful reduction in demo-day risk.

Stay on the free tier for this project — it's more than sufficient at this scale, and you don't need to add billing complexity for a 10-user hackathon build.

---

## 4. Step-by-step implementation plan

### Phase 1 — Core MVP (Weeks 1–3)
1. Scaffold Next.js app, set up Tailwind, deploy a blank shell to Vercel so your pipeline exists from day one.
2. Set up the Socket.io backend, deploy to Railway/Render, confirm the frontend can open a WebSocket connection to it.
3. Build anonymous session creation (generate a session ID, no auth) and the character-selection screen.
4. Build the basic two-person chat room: join a room, send/receive plain text messages, no AI yet. Test with two browser tabs.
5. Set up your Gemini API key(s), write the combined-call prompt (translation + moderation + crisis in one structured response), and wire it into the message-send path.
6. Build the Tier-1 keyword list (multi-language) and the crisis overlay screen (full-screen, helpline numbers, one-tap call link).
7. Build the mild-concern nudge card and the soft-flag/block moderation UI.
8. Write and ship the static privacy explanation page.
9. **Test pass:** run your crisis-detection test set (Section 1) end to end. Don't move to Phase 2 until this passes reliably.

### Phase 2 — Differentiators (Weeks 3–5)
10. Build the check-in flow (topic tags + intensity slider + language picker), route self-harm signals straight into the crisis flow per your spec.
11. Build the matching moment screen (basic random pairing from the in-memory queue is fine at this scale — no need for topic-based matching yet, that's a stretch goal).
12. Build the shared-context reveal and icebreaker suggestion.
13. Build the end-of-chat reflection card and tap-only reaction UI.
14. Add the Anonymous Friends system: generate persistent tags, add/accept flow, friends list screen, unilateral block/remove (single tap, no confirmation, exactly as your doc specifies — that's a safety-relevant design choice, keep it as-is).
15. **Test pass:** re-run the crisis-detection test set again — you've touched a lot of adjacent code by now, worth confirming nothing regressed.

### Phase 3 — Stretch, in priority order (Week 5+, cut from the bottom if time runs out)
16. Voice input: wire up Web Speech API for STT/TTS on supported browsers; add a Gemini-transcription fallback if you have time and iOS support matters for your demo.
17. Themed Rooms: extend your existing room abstraction to support >2 participants, add per-message-private crisis overlay logic (never broadcast), add mute/remove controls.
18. Topic-based matching (upgrade from random pairing).
19. Static resources page, always-visible SOS button, "Feeling weather" mood check, accessibility options (font size, TTS on/off), slow-connection performance pass.

### Before any live demo
- Re-verify the helpline numbers in Section 8 of your doc are still live.
- Re-run your crisis-detection test set one final time.
- Test on the actual device type your judges/audience are likely to use (if any iPhones are involved, specifically test voice features there).
