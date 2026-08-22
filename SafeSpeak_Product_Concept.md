# SafeSpeak — Product Concept Document
*(Pre-technical — this is the "what" and "why," not the "how")*

---

## 1. One-Line Pitch

- SafeSpeak is an anonymous, multilingual chat app where two people dealing with similar health/emotional concerns talk to each other, each in their own language, with built-in safety and moderation so it never feels risky.

---

## 2. The Problem We're Solving

- People hide health/emotional struggles (stress, anxiety, body image, addiction) out of fear of being judged or recognized.
- People think and feel more honestly in their own language (Hindi, Telugu, Tamil, Hinglish) than in English.
- Existing anonymous chat apps don't handle any of this — no safety net, no language support, no thoughtful matching.

---

## 3. Who This Is For

- Students under academic/exam pressure.
- Young adults dealing with stress, body image, family pressure, loneliness.
- Anyone more comfortable venting in a regional language or a language mix.
- People who want to talk to *someone going through the same thing*, not a stranger at random.

---

## 4. Complete User Journey (Step by Step)

### 4.1 First Open — No Login Wall
- No sign-up, no name, no photo, no account creation.
- First screen shows 4–6 cartoon characters, each tied to a **relatable situation**, not a diagnosis.
  - Example: "can't switch off before an exam," "overthinks every conversation afterward," "feels judged about how they look."
- User taps whichever one feels closest to them right now.
- That character becomes their face for this session — nothing else identifies them.

### 4.2 Quick Check-In (Not a Clinical Test)
- 5–7 short questions, phrased casually, not like a hospital form.
- Ask: what's been on your mind lately (pick from topic tags), how intense has it felt (simple slider), which language(s) you want to talk in.
- Clearly tells the user: *this is not a diagnosis, it just helps us match you well.*
- If anything in this check-in signals self-harm risk, the user is routed straight into the crisis flow (section 4.7) — never into normal matching.

### 4.3 Matching Moment
- Instead of a boring "searching..." spinner, show the two chosen characters moving toward each other visually.
- Reveal one shared thing they have in common ("you're both carrying exam stress") without exposing anything identifying.
- This is a payoff moment — it should feel warm and a little delightful, not clinical.

### 4.4 Entering the Chat
- Clean two-bubble chat screen.
- Each person sees the other's chosen cartoon character instead of a name or photo.
- Optional icebreaker suggestion shown at the start, based on the shared topic, so it's not an awkward silent start.

### 4.5 Talking Across Languages
- User A types in Hindi, User B types in English (or any mix) — each person always reads in their **own** language.
- Translation should feel invisible — it should not feel like a "feature," it should just work.
- Casual, mixed-language input ("mujhe bahut stress ho raha hai") must be understood, not just literal dictionary words.
- Health-related phrases must be translated for meaning, not word-for-word (e.g., "I feel a little low" should never come out as "I feel extremely sad").

### 4.6 Voice Features
- Mic button lets a user speak instead of type.
- What they say gets turned into text, translated, and can be read aloud (text-to-voice) on the other person's side in their language.
- This is the app's signature moment: a Telugu voice note becomes something the other person hears spoken back in English (or vice versa).

### 4.7 If Something Concerning Comes Up (Crisis Handling)
- The app never silently logs a worrying message and moves on, and it never punishes the user with a harsh red warning banner either.
- Two tiers:
  - **Mild concern** (stress, sadness, feeling overwhelmed): a gentle in-chat card appears, e.g. a short breathing exercise, before the chat continues.
  - **Serious concern** (self-harm, suicidal language): the chat pauses, and a calm full-screen card appears with direct helpline numbers and a one-tap call button. The user does not need to reveal who they are to get this.
- This works the same regardless of which language the concerning message was typed or spoken in.

### 4.8 If Someone Is Bullying or Spreading Bad Health Advice
- Messages that look like harassment, insults, or clearly false/unsafe health advice (like a dangerous home remedy) get caught before or as they're sent.
- Depending on severity: message is softly flagged to the sender ("this might come across as harsh, want to rephrase?"), or blocked outright if it's clearly abusive or dangerous misinformation.
- Either user can also manually flag a message or end the chat immediately, no explanation required.

### 4.9 Ending a Chat
- When either person leaves, the other isn't dropped into a dead screen.
- Show a short, anonymized reflection card summarizing what was talked about and what seemed to help — without exposing any identity.
- Optional: tap-only encouragement reactions (no text) either person can leave for the other.

### 4.10 Coming Back Later
- Returning users go straight back to the character screen by default.
- They can pick the same character again or a different one depending on how they're feeling that day.
- Or, if they've saved an Anonymous Friend, they can skip matching entirely and go straight to that list (see 4.11).

### 4.11 Reconnecting With an Anonymous Friend
- After a good conversation, either person can tap "Add as Anonymous Friend" — no identity is exchanged, just a persistent anonymous tag.
- If both accept, they show up in each other's Anonymous Friends list going forward.
- Next time the app is opened, the user can either start a fresh random match or go straight to their Anonymous Friends list and message someone specific.
- Every new chat still starts with a clean slate — no saved message history, even between friends.
- Removing or blocking a friend is a single tap, no confirmation needed from the other side.

### 4.12 Joining a Themed Room
- From the home screen, a user can browse themed rooms instead of only 1:1 matching — "Exam Stress," "New to a City," "Quitting a Habit," and similar.
- Tapping a room drops the user straight into a live group conversation, appearing under their chosen character like everywhere else.
- Crisis and moderation logic still apply per message, same rules as 1:1 — a concerning message only triggers a private overlay for the person who wrote it.

---

## 5. Complete Feature List

### 5.1 Must-Have Features (Core, Non-Negotiable)
- Anonymous 1:1 chat — no names, no photos, no accounts.
- Real-time translation across languages, including casual/mixed-language input.
- Rule-based crisis/emergency detection with a clear, non-judgmental response flow.
- Basic filter for bullying, abusive language, and false/unsafe health advice.
- A clear, simple explanation of how user identity is kept private.

### 5.2 Differentiator Features (What Makes SafeSpeak Feel Good, Not Just Functional)
- Cartoon character onboarding, tied to relatable situations rather than clinical labels.
- Lightweight, honest check-in used only for matching — explicitly labeled as not a diagnosis.
- Matching moment that reveals shared context before the chat starts.
- Voice-to-text and text-to-voice working together — speak in one language, the other person hears it spoken in theirs.
- Tiered crisis response (soft nudge for mild concern, full resource screen for serious concern) instead of one blunt warning.
- Two-layer crisis detection: a fixed phrase list catches obvious crisis wording immediately, and an AI second pass catches messages that sound similarly serious but don't match any exact phrase (e.g. "I don't see the point of tomorrow" won't hit a keyword list but should still be caught).
- Icebreaker suggestions at the start of a match.
- Anonymized end-of-chat reflection card for a sense of closure.
- Tap-only encouragement reactions instead of requiring text at the end of a chat.
- **Anonymous Friends** — reconnect with someone you clicked with before, without either of you ever being identified:
  - Each user gets one persistent anonymous tag (e.g. "StressedOwl#4821"), generated once — a stable label, not a real identity.
  - Either person can send an "add as Anonymous Friend" request during or after a chat; if accepted, they're connected under these tags.
  - A new "Anonymous Friends" list lets a user start a chat directly with someone they've connected with, instead of only random matching.
  - No message history is saved by default, even between friends — every new chat still starts fresh. What persists is the ability to reconnect, not the conversation.
  - Either side can remove/block a friend at any time, unilaterally, no explanation or confirmation required — non-negotiable alongside this feature, since repeat contact is a risk a one-off session doesn't have.
- **Themed Rooms (group chat)** — heaviest feature in this doc to actually build, worth it anyway:
  - Public rooms built around a topic (e.g. "Exam Stress," "New to a City," "Quitting a Habit") that anyone can browse and join, instead of only 1:1 matching.
  - Each room shows a short description and a rough sense of activity to make joining an easy decision.
  - Inside a room, users still appear only as their chosen character — anonymous in a group the same way as 1:1.
  - Crisis handling stays per-message and private: if one person's message is concerning, only that person sees the helpline overlay — it's never broadcast to the room.
  - Needs its own mute/remove-a-participant control so a bad actor can be handled without exposing anyone's identity.

### 5.3 Bonus / Stretch Features (Only If Time Allows)
- Always-visible SOS button inside the chat, so the user can ask for help without waiting for the app to detect something.
- "Feeling weather" — a quick tap-in mood check (sunny/cloudy/stormy) as a lower-effort alternative to typing, available both at check-in and mid-chat.
- Matching users specifically by shared topic/concern rather than randomly.
- Making the app usable smoothly on slow internet connections.
- A short static "resources" page with helpline numbers always accessible (not only shown during a crisis moment).
- Light accessibility options (font size, sound on/off for TTS).

### 5.4 Deliberately Left Out (And Why)
- **Daily streaks / login rewards** — punishing a user for missing a day is a bad pattern for a mental health app, not a feature.
- **Real diagnostic tools (like full clinical questionnaires) used for matching** — presenting the app as clinically diagnosing someone is a liability and an ethical problem, not just scope creep.
- **Full chat message history saved by default** — even with Anonymous Friends, what persists is the ability to reconnect, never the conversation content itself.
- **The app or characters telling a user what's "wrong" with them** — reframe everything around relatable situations, never labels or diagnoses.

---

## 6. Screens Needed for UI Design

**Total: ~17 screens/states**

| # | Screen | Purpose | Priority |
|---|--------|---------|----------|
| 1 | Splash / Landing | First impression, sets the tone (warm, safe, not clinical) | Must |
| 2 | Character Selection | User picks their anonymous face for the session | Must |
| 3 | Check-In (Topics + Intensity) | Collects context for matching, not diagnosis | Must |
| 4 | Language Preference | Pick language(s) to chat in | Must (can be merged into #3) |
| 5 | Matching / Loading Moment | Animated "finding your match" screen | Must |
| 6 | Match Found / Shared Context Reveal | Payoff moment before chat starts | Should |
| 7 | Main Chat Screen | Core conversation, both text and voice input | Must |
| 8 | Voice Input / Playback State | Mic active state, playback of translated voice note | Should |
| 9 | Mild Concern Nudge (in-chat card) | Gentle breathing/grounding prompt | Must |
| 10 | Serious Concern / Crisis Overlay | Full-screen helpline resources, one-tap call | Must |
| 11 | Report / Flag Message | Manual flagging of bullying or bad advice | Must |
| 12 | End-of-Chat Reflection Card | Anonymized summary + reaction badges | Should |
| 13 | Static Resources / Help Page | Always-accessible helpline info | Should |
| 14 | Anonymous Friends List | View saved anonymous connections, start a chat with one directly | Should |
| 15 | Add Friend Confirmation | Accept or decline an incoming Anonymous Friend request | Should |
| 16 | Room Browse / Discovery | List of themed group rooms to join | Should |
| 17 | Group Room Chat | Group-chat variant of the main chat screen | Should |

---

## 7. Character & Tone Guidelines

**Example characters (situation-based, not diagnosis-based):**
- The one who can't switch off the night before an exam.
- The one who replays conversations over and over afterward.
- The one who feels judged about how they look.
- The one who's been leaning on a habit more than they'd like to admit.
- The one who feels alone even in a full room.

**Tone rules for all app copy, everywhere:**
- Never diagnose ("you have anxiety") — describe situations instead ("racing thoughts before deadlines").
- Never judge or lecture.
- Never make the user feel slow, weak, or broken for needing this app.
- Always sound like a calm, non-judgmental friend — not a hospital form, not a corporate app.

---

## 8. Safety & Moderation Logic (Plain Language, No Tech Yet)

**Crisis detection:**
- Tier 1 (mild): words/phrases suggesting stress, sadness, feeling overwhelmed → soft in-chat nudge.
- Tier 2 (serious): words/phrases suggesting self-harm or suicidal thoughts → full-screen pause with direct helpline numbers and one-tap call.
- Detection runs in two layers: a fixed phrase list per language catches known crisis wording immediately, and an AI second pass reviews anything that sounds similarly serious but doesn't match an exact phrase — so a message doesn't need to hit a specific keyword to be caught.
- Must work the same way across every supported language, not just English.

**Moderation:**
- Catches: insults, harassment, bullying language, and clearly false/unsafe health advice (e.g., dangerous home remedies).
- Response depends on severity: soft rephrase suggestion for borderline cases, outright block for clearly abusive or dangerous content.
- Either user can manually flag a message or leave the chat at any time, no reason required.
- In group rooms, this applies per message, not per room: a crisis overlay only shows privately to the person who wrote the concerning message, never to the whole room, and a bad actor can be muted or removed from a room without exposing anyone's identity.

**Helpline numbers to use in the crisis overlay (verify these are still live before any live demo):**
- KIRAN (Govt of India, 24x7, 13 languages): 1800-599-0019
- Tele-MANAS (Govt of India, 24x7): 14416 / 1-800-891-4416
- Vandrevala Foundation (24x7): 1860-266-2345 / 1800-233-3330

---

## 9. Privacy Explanation (For Judges / Users)

> SafeSpeak never asks for a name, photo, or account tied to a real identity. Each user is represented only by the cartoon character they select at the start of the session. Matching and chat both run on an anonymized session ID with no link to any personal data, and messages exist only for the duration of the session — nothing is stored against an identifiable profile afterward. The result is a space where someone can talk about a health concern honestly without any trace leading back to who they are.

**In bullets, for the pitch deck:**
- No names, no photos, no accounts.
- Cartoon character = only identity, chosen fresh each session.
- No chat history saved against a person.
- Session ends → nothing links back to who was in it.

---

## 10. What Success Looks Like (Non-Technical Checklist)

- [ ] Two people can chat anonymously start to finish, no identity ever shown.
- [ ] A message typed in Hindi is read naturally (not robotically) by the other person in English, and vice versa.
- [ ] A casual, mixed-language message ("mujhe bahut stress ho raha hai") is understood correctly.
- [ ] A concerning message triggers the right tier of response, in any supported language.
- [ ] A bullying or false-advice message gets caught before it lands.
- [ ] The character onboarding and matching moment feel warm, not clinical.
- [ ] Voice-to-text and text-to-voice both work in the demo.
- [ ] The privacy explanation is short, clear, and matches what the app actually does.

---

## 11. Build Priority Order

**Phase 1 — MVP (must work end-to-end):**
- Anonymous 1:1 text chat
- Real-time translation
- Rule-based crisis keyword detection + response flow
- Basic bullying/misinformation filter
- Privacy explanation

**Phase 2 — Differentiators (build once Phase 1 works):**
- Character onboarding screen
- Lightweight check-in for matching
- Matching moment / shared-context reveal
- Tiered crisis response
- End-of-chat reflection card
- Anonymous Friends (persistent tag, friends list, unilateral block/remove)
- Themed Rooms / group chat

**Phase 3 — Stretch (only if time remains):**
- Voice-to-text and text-to-voice
- Topic-based matching logic
- Static resources page
- Performance on slow connections
- SOS button + Feeling weather mood check
