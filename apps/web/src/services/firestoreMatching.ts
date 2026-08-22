import { 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  type Unsubscribe,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { CharacterId, CheckInAnswers, MatchFoundPayload } from '@safespeak/shared-types'
import { getSimulatedPeerPersona } from './safetyAndTranslation'

export function getOrCreateUserId(): string {
  let id = sessionStorage.getItem('safespeak_user_id')
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
    sessionStorage.setItem('safespeak_user_id', id)
  }
  return id
}

// All state is tracked PER-SESSION via these refs — no module-level flags that persist across React re-renders
let _unsubMyDoc: Unsubscribe | null = null
let _unsubQueue: Unsubscribe | null = null
let _fallbackTimer: ReturnType<typeof setTimeout> | null = null
let _sessionId: string | null = null  // tracks the active session so stale callbacks are ignored

function cancelAllListeners() {
  if (_unsubMyDoc) { _unsubMyDoc(); _unsubMyDoc = null }
  if (_unsubQueue) { _unsubQueue(); _unsubQueue = null }
  if (_fallbackTimer) { clearTimeout(_fallbackTimer); _fallbackTimer = null }
}

export async function joinFirestoreQueue(
  characterId: CharacterId,
  checkin: CheckInAnswers,
  onMatch: (payload: MatchFoundPayload) => void
): Promise<void> {
  // Always cancel any leftover listeners from a previous call (React re-renders, strict mode, etc.)
  cancelAllListeners()

  const userId = getOrCreateUserId()
  const myLanguages = checkin.languages || ['English']
  const charTag = `${characterId.charAt(0).toUpperCase() + characterId.slice(1)}#${Math.floor(1000 + Math.random() * 9000)}`
  
  // Create a unique session token for this specific join attempt
  const sessionId = `${userId}_${Date.now()}`
  _sessionId = sessionId

  console.log(`[SafeSpeak Firestore] 🔍 User ${userId} joining queue as ${charTag} (session: ${sessionId})`)

  const myDocRef = doc(db, 'matching_queue', userId)

  // Guard: only fire onMatch once per session
  let matched = false
  function fireMatch(payload: MatchFoundPayload) {
    if (matched || _sessionId !== sessionId) return
    matched = true
    cancelAllListeners()
    deleteDoc(myDocRef).catch(() => {})
    sessionStorage.setItem('current_match', JSON.stringify(payload))
    console.log(`[SafeSpeak Firestore] ✅ Match fired! Room: ${payload.roomId} | Simulated: ${payload.isSimulatedPeer}`)
    onMatch(payload)
  }

  // Build a match between me (newcomer) and a waiting peer
  async function performMatch(peerUserId: string, peerData: any) {
    if (matched || _sessionId !== sessionId) return
    
    const roomId = `room_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const sharedContext = deriveSharedContext(checkin, peerData.checkin)
    const icebreaker = generateIcebreaker(sharedContext)

    const peerPayload: MatchFoundPayload = {
      roomId,
      peerSocketId: userId,
      peerCharacter: characterId,
      peerTag: charTag,
      peerLanguage: myLanguages[0] || 'English',
      myCharacter: peerData.characterId,
      myTag: peerData.characterTag || 'You',
      myLanguage: (peerData.languages?.[0]) || 'English',
      sharedContext,
      icebreaker,
      isSimulatedPeer: false,
    }

    const myPayload: MatchFoundPayload = {
      roomId,
      peerSocketId: peerUserId,
      peerCharacter: peerData.characterId,
      peerTag: peerData.characterTag || 'Peer',
      peerLanguage: (peerData.languages?.[0]) || 'English',
      myCharacter: characterId,
      myTag: charTag,
      myLanguage: myLanguages[0] || 'English',
      sharedContext,
      icebreaker,
      isSimulatedPeer: false,
    }

    try {
      await setDoc(doc(db, 'chat_rooms', roomId), {
        roomId, status: 'active', isSimulated: false, createdAt: Date.now(),
        users: [
          { userId: peerUserId, character: peerData.characterId, tag: peerData.characterTag, language: peerData.languages?.[0] || 'English' },
          { userId, character: characterId, tag: charTag, language: myLanguages[0] || 'English' },
        ],
        sharedContext, icebreaker, typing: {},
      })

      // Notify the other waiting user
      await updateDoc(doc(db, 'matching_queue', peerUserId), {
        status: 'matched',
        matchedPayload: peerPayload,
      })

      console.log(`[SafeSpeak Firestore] 🎉 Live match created: ${userId} ↔ ${peerUserId} | Room: ${roomId}`)
      fireMatch(myPayload)
    } catch (e) {
      console.error('[SafeSpeak Firestore] performMatch error:', e)
    }
  }

  // 1. Write my entry to the queue
  try {
    await setDoc(myDocRef, {
      userId,
      characterId,
      characterTag: charTag,
      checkin,
      languages: myLanguages,
      status: 'waiting',
      createdAt: serverTimestamp(),
      matchedPayload: null,
    })
    console.log(`[SafeSpeak Firestore] 📝 Written to queue. Now listening for peers...`)
  } catch (e) {
    console.error('[SafeSpeak Firestore] Failed to write to queue:', e)
    return
  }

  // 2. Listen to MY own doc — another user may match me at any time
  _unsubMyDoc = onSnapshot(myDocRef, (snap) => {
    if (!snap.exists() || matched || _sessionId !== sessionId) return
    const data = snap.data()
    if (data?.status === 'matched' && data?.matchedPayload) {
      console.log('[SafeSpeak Firestore] 📬 Got matched by a peer via doc update!')
      fireMatch(data.matchedPayload as MatchFoundPayload)
    }
  }, (err) => {
    console.error('[SafeSpeak Firestore] My doc listener error:', err)
  })

  // 3. Listen to the ENTIRE queue for any waiting peer (so I can match them)
  const waitingQ = query(
    collection(db, 'matching_queue'),
    where('status', '==', 'waiting')
  )
  _unsubQueue = onSnapshot(waitingQ, (snapshot) => {
    if (matched || _sessionId !== sessionId) return
    const others = snapshot.docs.filter(d => d.id !== userId)
    if (others.length > 0) {
      const peer = others[0]
      console.log(`[SafeSpeak Firestore] 👀 Spotted waiting peer: ${peer.id} — matching!`)
      performMatch(peer.id, peer.data())
    }
  }, (err) => {
    console.error('[SafeSpeak Firestore] Queue listener error:', err)
  })

  // 4. Fallback to AI after 18 seconds
  _fallbackTimer = setTimeout(async () => {
    if (matched || _sessionId !== sessionId) return
    console.log('[SafeSpeak Firestore] ⏱️ 18s elapsed — falling back to AI peer')

    const candidates: CharacterId[] = ['owl', 'deer', 'penguin', 'panda', 'rabbit', 'bear']
    const available = candidates.filter(c => c !== characterId)
    const peerChar = available[Math.floor(Math.random() * available.length)]
    const persona = getSimulatedPeerPersona(peerChar)
    const peerTag = `${persona.name}#${Math.floor(1000 + Math.random() * 9000)}`
    const roomId = `room_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const sharedContext = deriveSoloContext(checkin)
    const icebreaker = generateIcebreaker(sharedContext)

    const simPayload: MatchFoundPayload = {
      roomId,
      peerSocketId: `sim_${Date.now()}`,
      peerCharacter: peerChar,
      peerTag,
      peerLanguage: myLanguages[0] || 'English',
      myCharacter: characterId,
      myTag: charTag,
      myLanguage: myLanguages[0] || 'English',
      sharedContext,
      icebreaker,
      isSimulatedPeer: true,
    }

    try {
      await setDoc(doc(db, 'chat_rooms', roomId), {
        roomId, status: 'active', isSimulated: true, createdAt: Date.now(),
        users: [
          { userId, character: characterId, tag: charTag, language: myLanguages[0] || 'English' },
          { userId: 'sim_peer', character: peerChar, tag: peerTag, language: myLanguages[0] || 'English' },
        ],
        sharedContext, icebreaker,
        simulatedContext: { characterId: peerChar, characterTag: peerTag, sharedTopic: sharedContext, messageHistory: [] },
        typing: {},
      })
    } catch (e) {
      console.warn('[SafeSpeak Firestore] Could not write sim room:', e)
    }

    fireMatch(simPayload)
  }, 18000)
}

export async function leaveFirestoreQueue(): Promise<void> {
  const userId = getOrCreateUserId()
  _sessionId = null  // invalidate any active session
  cancelAllListeners()
  try {
    await deleteDoc(doc(db, 'matching_queue', userId))
    console.log(`[SafeSpeak Firestore] 🚪 User ${userId} left the queue`)
  } catch (_) {}
}

// ---- Helpers ----

function deriveSharedContext(c1?: CheckInAnswers, c2?: CheckInAnswers): string {
  const t1 = c1?.topics || []
  const t2 = c2?.topics || []
  const common = t1.filter(x => t2.includes(x))
  if (common.length > 0) return topicToFriendly(common[0])
  if (t1.length > 0 && t2.length > 0) return `${topicToFriendly(t1[0])} & ${topicToFriendly(t2[0])}`
  if (t1.length > 0) return topicToFriendly(t1[0])
  if (t2.length > 0) return topicToFriendly(t2[0])
  return 'carrying daily stress & thoughts'
}

function deriveSoloContext(c?: CheckInAnswers): string {
  return topicToFriendly(c?.topics?.[0] || 'exam')
}

function topicToFriendly(id: string): string {
  const map: Record<string, string> = {
    exam: 'exam & study pressure',
    family: 'family expectations',
    body: 'body image & self-comparison',
    relationship: 'a tough relationship moment',
    loneliness: 'feeling lonely',
    habit: 'breaking a tough habit',
    sleep: 'sleepless 3am thoughts',
    work: 'work pressure',
  }
  return map[id] || 'carrying heavy thoughts today'
}

function generateIcebreaker(topic: string): string {
  if (topic.includes('exam')) return 'How long has it been feeling this way for you?'
  if (topic.includes('family')) return 'Is it something specific that happened recently, or has it been building up?'
  if (topic.includes('sleep')) return 'Are your thoughts racing or does everything just feel quiet and heavy?'
  if (topic.includes('lonel')) return 'Do you prefer venting first, or just sharing some quiet comfort?'
  return 'Hey... whatever is on your mind, you have a safe space here.'
}
