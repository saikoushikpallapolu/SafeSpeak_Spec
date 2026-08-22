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

const STALE_THRESHOLD_MS = 60_000
const FALLBACK_TIMEOUT_MS = 22_000

export function getOrCreateUserId(): string {
  let id = sessionStorage.getItem('safespeak_user_id')
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
    sessionStorage.setItem('safespeak_user_id', id)
  }
  return id
}

async function purgeStaleQueueDocs() {
  try {
    const snap = await getDocs(query(collection(db, 'matching_queue'), where('status', '==', 'waiting')))
    const now = Date.now()
    const deletions: Promise<void>[] = []
    snap.docs.forEach(d => {
      const data = d.data()
      const age = now - (typeof data.createdAt === 'number' ? data.createdAt : 0)
      if (age > STALE_THRESHOLD_MS) {
        deletions.push(deleteDoc(d.ref))
      }
    })
    await Promise.all(deletions)
  } catch (_) {}
}

let _unsubMyDoc: Unsubscribe | null = null
let _unsubQueue: Unsubscribe | null = null
let _fallbackTimer: ReturnType<typeof setTimeout> | null = null
let _activeSessionToken: string | null = null

function cleanupListeners() {
  if (_unsubMyDoc) { _unsubMyDoc(); _unsubMyDoc = null }
  if (_unsubQueue) { _unsubQueue(); _unsubQueue = null }
  if (_fallbackTimer) { clearTimeout(_fallbackTimer); _fallbackTimer = null }
}

export async function joinFirestoreQueue(
  characterId: CharacterId,
  checkin: CheckInAnswers,
  onMatch: (payload: MatchFoundPayload) => void
): Promise<void> {
  cleanupListeners()

  const userId = getOrCreateUserId()
  const myLanguages = checkin.languages || ['English']
  const charTag = `${characterId.charAt(0).toUpperCase() + characterId.slice(1)}#${Math.floor(1000 + Math.random() * 9000)}`
  const joinedAt = Date.now()
  const sessionToken = `${userId}_${joinedAt}`
  _activeSessionToken = sessionToken

  console.log(`[SafeSpeak Firestore] 🚀 User ${userId} (${charTag}) joined queue [Token: ${sessionToken}]`)

  const myDocRef = doc(db, 'matching_queue', userId)
  let isMatched = false

  function completeMatch(payload: MatchFoundPayload) {
    if (isMatched || _activeSessionToken !== sessionToken) return
    isMatched = true
    cleanupListeners()
    _activeSessionToken = null
    deleteDoc(myDocRef).catch(() => {})
    sessionStorage.setItem('current_match', JSON.stringify(payload))
    console.log(`[SafeSpeak Firestore] 🎯 Match confirmed! Room: ${payload.roomId} (Simulated: ${payload.isSimulatedPeer})`)
    onMatch(payload)
  }

  // Purge any stale leftover queue docs first
  await purgeStaleQueueDocs()

  // 1. Write my waiting document to matching_queue
  try {
    await setDoc(myDocRef, {
      userId,
      characterId,
      characterTag: charTag,
      checkin,
      languages: myLanguages,
      status: 'waiting',
      createdAt: joinedAt,
      matchedPayload: null,
    })
  } catch (err) {
    console.error('[SafeSpeak Firestore] Error writing queue doc:', err)
    return
  }

  // 2. Listen to MY OWN document — if peer matched us, status will become 'matched'
  _unsubMyDoc = onSnapshot(myDocRef, (snap) => {
    if (!snap.exists() || isMatched || _activeSessionToken !== sessionToken) return
    const data = snap.data()
    if (data?.status === 'matched' && data?.matchedPayload) {
      console.log('[SafeSpeak Firestore] 📬 Received match from peer!', data.matchedPayload)
      completeMatch(data.matchedPayload as MatchFoundPayload)
    }
  })

  // 3. Watch for ANY other waiting peer in the queue
  const queueQuery = query(
    collection(db, 'matching_queue'),
    where('status', '==', 'waiting')
  )

  _unsubQueue = onSnapshot(queueQuery, async (snapshot) => {
    if (isMatched || _activeSessionToken !== sessionToken) return
    const now = Date.now()

    const candidates = snapshot.docs.filter((d) => {
      if (d.id === userId) return false
      const data = d.data()
      const age = now - (typeof data.createdAt === 'number' ? data.createdAt : 0)
      return age < STALE_THRESHOLD_MS
    })

    if (candidates.length > 0) {
      const peerDoc = candidates[0]
      const peerUserId = peerDoc.id
      const peerData = peerDoc.data()

      // TIE-BREAKER: Only the user with the smaller userId string creates the room.
      // This prevents race condition collisions where both users try to create rooms simultaneously.
      if (userId < peerUserId) {
        console.log(`[SafeSpeak Firestore] ⚡ Initiating match with peer: ${peerUserId} (Tie-breaker won: ${userId} < ${peerUserId})`)

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
          myTag: peerData.characterTag || 'Peer',
          myLanguage: peerData.languages?.[0] || 'English',
          sharedContext,
          icebreaker,
          isSimulatedPeer: false,
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
          sharedContext,
          icebreaker,
          isSimulatedPeer: false,
        }

        try {
          // Create the room document
          await setDoc(doc(db, 'chat_rooms', roomId), {
            roomId,
            status: 'active',
            isSimulated: false,
            createdAt: Date.now(),
            users: [
              { userId, character: characterId, tag: charTag, language: myLanguages[0] || 'English' },
              { userId: peerUserId, character: peerData.characterId, tag: peerData.characterTag, language: peerData.languages?.[0] || 'English' },
            ],
            sharedContext,
            icebreaker,
            typing: {},
          })

          // Update the peer's document to trigger their onSnapshot listener
          await updateDoc(doc(db, 'matching_queue', peerUserId), {
            status: 'matched',
            matchedPayload: peerPayload,
          })

          console.log(`[SafeSpeak Firestore] 🎉 Room ${roomId} created and peer notified!`)
          completeMatch(myPayload)
        } catch (e) {
          console.error('[SafeSpeak Firestore] Error creating room:', e)
        }
      } else {
        console.log(`[SafeSpeak Firestore] ⏳ Waiting for peer ${peerUserId} to create room (Tie-breaker: ${peerUserId} < ${userId})`)
      }
    }
  })

  // 4. Fallback to AI persona if no peer joins within timeout
  _fallbackTimer = setTimeout(async () => {
    if (isMatched || _activeSessionToken !== sessionToken) return
    console.log(`[SafeSpeak Firestore] ⏱️ Timeout (${FALLBACK_TIMEOUT_MS / 1000}s) reached without real peer. Connecting to AI persona...`)

    const candidates: CharacterId[] = ['owl', 'deer', 'penguin', 'panda', 'rabbit', 'bear']
    const peerChar = candidates.filter(c => c !== characterId)[Math.floor(Math.random() * 5)]
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
        roomId,
        status: 'active',
        isSimulated: true,
        createdAt: Date.now(),
        users: [
          { userId, character: characterId, tag: charTag, language: myLanguages[0] || 'English' },
          { userId: 'sim_peer', character: peerChar, tag: peerTag, language: myLanguages[0] || 'English' },
        ],
        sharedContext,
        icebreaker,
        simulatedContext: {
          characterId: peerChar,
          characterTag: peerTag,
          sharedTopic: sharedContext,
          messageHistory: [],
        },
        typing: {},
      })
    } catch (_) {}

    completeMatch(simPayload)
  }, FALLBACK_TIMEOUT_MS)
}

export async function leaveFirestoreQueue(): Promise<void> {
  const userId = getOrCreateUserId()
  _activeSessionToken = null
  cleanupListeners()
  try {
    await deleteDoc(doc(db, 'matching_queue', userId))
    console.log(`[SafeSpeak Firestore] User ${userId} removed from queue`)
  } catch (_) {}
}

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
