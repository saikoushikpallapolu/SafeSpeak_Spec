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
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'
import type { CharacterId, CheckInAnswers, MatchFoundPayload } from '@safespeak/shared-types'
import { getSimulatedPeerPersona } from './safetyAndTranslation'

// How old (ms) a queue entry can be before it's considered stale/ghost
const STALE_THRESHOLD_MS = 45_000
// How long to wait for a real peer before falling back to AI
const FALLBACK_TIMEOUT_MS = 18_000

export function getOrCreateUserId(): string {
  let id = sessionStorage.getItem('safespeak_user_id')
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
    sessionStorage.setItem('safespeak_user_id', id)
  }
  return id
}

/** Delete all ghost 'waiting' entries older than STALE_THRESHOLD_MS */
async function purgeStaleQueueDocs() {
  try {
    const snap = await getDocs(query(collection(db, 'matching_queue'), where('status', '==', 'waiting')))
    const now = Date.now()
    const deletions: Promise<void>[] = []
    snap.docs.forEach(d => {
      const data = d.data()
      const age = now - (typeof data.createdAt === 'number' ? data.createdAt : 0)
      if (age > STALE_THRESHOLD_MS) {
        console.log(`[SafeSpeak Firestore] 🧹 Purging stale doc: ${d.id} (age: ${Math.round(age / 1000)}s)`)
        deletions.push(deleteDoc(d.ref))
      }
    })
    await Promise.all(deletions)
  } catch (_) {}
}

let _unsubMyDoc: Unsubscribe | null = null
let _unsubQueue: Unsubscribe | null = null
let _fallbackTimer: ReturnType<typeof setTimeout> | null = null
let _sessionId: string | null = null

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
  cancelAllListeners()

  const userId = getOrCreateUserId()
  const myLanguages = checkin.languages || ['English']
  const charTag = `${characterId.charAt(0).toUpperCase() + characterId.slice(1)}#${Math.floor(1000 + Math.random() * 9000)}`
  const joinedAt = Date.now()

  // Fresh session token — all callbacks check this to reject stale invocations
  const sessionId = `${userId}_${joinedAt}`
  _sessionId = sessionId

  console.log(`[SafeSpeak Firestore] 🔍 Joining queue as ${charTag} | session: ${sessionId}`)

  const myDocRef = doc(db, 'matching_queue', userId)

  // Guard so match fires at most once per queue join
  let matched = false
  function fireMatch(payload: MatchFoundPayload) {
    if (matched || _sessionId !== sessionId) return
    matched = true
    cancelAllListeners()
    deleteDoc(myDocRef).catch(() => {})
    sessionStorage.setItem('current_match', JSON.stringify(payload))
    const kind = payload.isSimulatedPeer ? 'AI' : '✅ LIVE'
    console.log(`[SafeSpeak Firestore] ${kind} match fired! Room: ${payload.roomId}`)
    onMatch(payload)
  }

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
      myLanguage: peerData.languages?.[0] || 'English',
      sharedContext, icebreaker, isSimulatedPeer: false,
    }
    const myPayload: MatchFoundPayload = {
      roomId,
      peerSocketId: peerUserId,
      peerCharacter: peerData.characterId,
      peerTag: peerData.characterTag || 'Peer',
      peerLanguage: peerData.languages?.[0] || 'English',
      myCharacter: characterId,
      myTag: charTag,
      myLanguage: myLanguages[0] || 'English',
      sharedContext, icebreaker, isSimulatedPeer: false,
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
      await updateDoc(doc(db, 'matching_queue', peerUserId), {
        status: 'matched',
        matchedPayload: peerPayload,
      })
      console.log(`[SafeSpeak Firestore] 🎉 Live match! ${userId} ↔ ${peerUserId} | Room: ${roomId}`)
      fireMatch(myPayload)
    } catch (e) {
      console.error('[SafeSpeak Firestore] performMatch error:', e)
    }
  }

  // 1. Clean up ghost entries from previous crashed sessions
  await purgeStaleQueueDocs()

  // 2. Write our fresh 'waiting' entry (createdAt as plain number for client-side age filtering)
  try {
    await setDoc(myDocRef, {
      userId, characterId, characterTag: charTag, checkin, languages: myLanguages,
      status: 'waiting',
      createdAt: joinedAt,   // plain number for easy age comparison
      matchedPayload: null,
    })
    console.log(`[SafeSpeak Firestore] 📝 Written to queue (createdAt: ${joinedAt})`)
  } catch (e) {
    console.error('[SafeSpeak Firestore] ❌ Failed to write queue entry:', e)
    return
  }

  // 3. Listen to MY own doc — another user may update it to 'matched' at any time
  _unsubMyDoc = onSnapshot(myDocRef, (snap) => {
    if (!snap.exists() || matched || _sessionId !== sessionId) return
    const data = snap.data()
    if (data?.status === 'matched' && data?.matchedPayload) {
      console.log('[SafeSpeak Firestore] 📬 Matched via doc update!')
      fireMatch(data.matchedPayload as MatchFoundPayload)
    }
  }, (err) => {
    console.error('[SafeSpeak Firestore] My doc listener error:', err)
  })

  // 4. Watch the whole queue for fresh 'waiting' users (excluding ghosts)
  _unsubQueue = onSnapshot(
    query(collection(db, 'matching_queue'), where('status', '==', 'waiting')),
    (snapshot) => {
      if (matched || _sessionId !== sessionId) return
      const now = Date.now()
      const freshPeers = snapshot.docs.filter(d => {
        if (d.id === userId) return false
        const data = d.data()
        // Only consider docs created within the stale threshold
        const createdAt = typeof data.createdAt === 'number' ? data.createdAt : 0
        const age = now - createdAt
        if (age > STALE_THRESHOLD_MS) {
          console.log(`[SafeSpeak Firestore] ⚠️ Skipping stale doc: ${d.id} (age: ${Math.round(age / 1000)}s)`)
          return false
        }
        return true
      })

      if (freshPeers.length > 0) {
        const peer = freshPeers[0]
        console.log(`[SafeSpeak Firestore] 👀 Fresh peer spotted: ${peer.id} — matching!`)
        performMatch(peer.id, peer.data())
      }
    },
    (err) => {
      console.error('[SafeSpeak Firestore] Queue listener error:', err)
    }
  )

  // 5. Fall back to AI after FALLBACK_TIMEOUT_MS if no real peer found
  _fallbackTimer = setTimeout(async () => {
    if (matched || _sessionId !== sessionId) return
    console.log(`[SafeSpeak Firestore] ⏱️ ${FALLBACK_TIMEOUT_MS / 1000}s elapsed — falling back to AI peer`)

    const candidates: CharacterId[] = ['owl', 'deer', 'penguin', 'panda', 'rabbit', 'bear']
    const peerChar = candidates.filter(c => c !== characterId)[Math.floor(Math.random() * 5)]
    const persona = getSimulatedPeerPersona(peerChar)
    const peerTag = `${persona.name}#${Math.floor(1000 + Math.random() * 9000)}`
    const roomId = `room_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const sharedContext = deriveSoloContext(checkin)
    const icebreaker = generateIcebreaker(sharedContext)

    const simPayload: MatchFoundPayload = {
      roomId, peerSocketId: `sim_${Date.now()}`, peerCharacter: peerChar, peerTag,
      peerLanguage: myLanguages[0] || 'English', myCharacter: characterId, myTag: charTag,
      myLanguage: myLanguages[0] || 'English', sharedContext, icebreaker, isSimulatedPeer: true,
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
  }, FALLBACK_TIMEOUT_MS)
}

export async function leaveFirestoreQueue(): Promise<void> {
  const userId = getOrCreateUserId()
  _sessionId = null
  cancelAllListeners()
  try {
    await deleteDoc(doc(db, 'matching_queue', userId))
    console.log(`[SafeSpeak Firestore] 🚪 Left queue`)
  } catch (_) {}
}

// ---- Context helpers ----

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
    exam: 'exam & study pressure', family: 'family expectations',
    body: 'body image & self-comparison', relationship: 'a tough relationship moment',
    loneliness: 'feeling lonely', habit: 'breaking a tough habit',
    sleep: 'sleepless 3am thoughts', work: 'work pressure',
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
