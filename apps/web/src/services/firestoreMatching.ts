import { 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  type Unsubscribe,
  updateDoc 
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

let queueUnsubscribe: Unsubscribe | null = null
let fallbackTimer: NodeJS.Timeout | null = null

export async function joinFirestoreQueue(
  characterId: CharacterId,
  checkin: CheckInAnswers,
  onMatch: (payload: MatchFoundPayload) => void
): Promise<void> {
  const userId = getOrCreateUserId()
  const charTag = `${characterId.charAt(0).toUpperCase() + characterId.slice(1)}#${Math.floor(1000 + Math.random() * 9000)}`
  const myLanguages = checkin.languages || ['English']

  console.log(`[SafeSpeak Firestore] User ${userId} joining queue as ${charTag}`)

  // 1. Clean up any previous state
  if (queueUnsubscribe) {
    queueUnsubscribe()
    queueUnsubscribe = null
  }
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }

  const myDocRef = doc(db, 'matching_queue', userId)

  // 2. Look for any existing waiting user in the queue
  try {
    const q = query(
      collection(db, 'matching_queue'),
      where('status', '==', 'waiting')
    )
    const snapshot = await getDocs(q)
    const candidates = snapshot.docs.filter((d) => d.id !== userId)

    if (candidates.length > 0) {
      // Found a waiting peer! Match instantly!
      const peerDoc = candidates[0]
      const peerData = peerDoc.data()
      const peerUserId = peerDoc.id

      const roomId = `room_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const sharedContext = deriveSharedContext(checkin, peerData.checkin)
      const icebreaker = generateIcebreaker(sharedContext)

      // Payload for the waiting peer
      const peerPayload: MatchFoundPayload = {
        roomId,
        peerSocketId: userId,
        peerCharacter: characterId,
        peerTag: charTag,
        peerLanguage: myLanguages[0] || 'English',
        myCharacter: peerData.characterId,
        myTag: peerData.characterTag || 'You',
        myLanguage: (peerData.languages && peerData.languages[0]) || 'English',
        sharedContext,
        icebreaker,
        isSimulatedPeer: false,
      }

      // Payload for this newcomer
      const myPayload: MatchFoundPayload = {
        roomId,
        peerSocketId: peerUserId,
        peerCharacter: peerData.characterId,
        peerTag: peerData.characterTag || 'Peer',
        peerLanguage: (peerData.languages && peerData.languages[0]) || 'English',
        myCharacter: characterId,
        myTag: charTag,
        myLanguage: myLanguages[0] || 'English',
        sharedContext,
        icebreaker,
        isSimulatedPeer: false,
      }

      // Initialize the room doc in Firestore
      await setDoc(doc(db, 'chat_rooms', roomId), {
        roomId,
        status: 'active',
        isSimulated: false,
        createdAt: Date.now(),
        users: [
          { userId: peerUserId, character: peerData.characterId, tag: peerData.characterTag, language: peerData.languages?.[0] || 'English' },
          { userId, character: characterId, tag: charTag, language: myLanguages[0] || 'English' },
        ],
        sharedContext,
        icebreaker,
        typing: {},
      })

      // Notify the waiting peer by updating their queue doc
      await updateDoc(peerDoc.ref, {
        status: 'matched',
        matchedPayload: peerPayload,
      })

      console.log(`[SafeSpeak Firestore] Real 2-device match created: ${userId} <-> ${peerUserId} in room ${roomId}`)

      // Set our session match and trigger callback
      sessionStorage.setItem('current_match', JSON.stringify(myPayload))
      onMatch(myPayload)
      return
    }
  } catch (err) {
    console.warn('[SafeSpeak Firestore] Error querying queue, proceeding to enqueue:', err)
  }

  // 3. If no immediate peer, write our doc as 'waiting'
  await setDoc(myDocRef, {
    userId,
    characterId,
    characterTag: charTag,
    checkin,
    languages: myLanguages,
    status: 'waiting',
    createdAt: Date.now(),
    matchedPayload: null,
  })

  // 4. Listen for another user matching us
  queueUnsubscribe = onSnapshot(myDocRef, (docSnap) => {
    if (!docSnap.exists()) return
    const data = docSnap.data()
    if (data.status === 'matched' && data.matchedPayload) {
      console.log('[SafeSpeak Firestore] Matched via listener!', data.matchedPayload)
      if (fallbackTimer) clearTimeout(fallbackTimer)
      deleteDoc(myDocRef).catch(() => {})
      if (queueUnsubscribe) {
        queueUnsubscribe()
        queueUnsubscribe = null
      }
      sessionStorage.setItem('current_match', JSON.stringify(data.matchedPayload))
      onMatch(data.matchedPayload)
    }
  })

  // 5. Fallback timer (18 seconds) for solo AI peer if no real peer arrives
  fallbackTimer = setTimeout(async () => {
    console.log('[SafeSpeak Firestore] Fallback to simulated AI peer')
    const candidates: CharacterId[] = ['owl', 'deer', 'penguin', 'panda', 'rabbit', 'bear']
    const available = candidates.filter((c) => c !== characterId)
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

    deleteDoc(myDocRef).catch(() => {})
    if (queueUnsubscribe) {
      queueUnsubscribe()
      queueUnsubscribe = null
    }

    sessionStorage.setItem('current_match', JSON.stringify(simPayload))
    onMatch(simPayload)
  }, 18000)
}

export async function leaveFirestoreQueue(): Promise<void> {
  const userId = getOrCreateUserId()
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }
  if (queueUnsubscribe) {
    queueUnsubscribe()
    queueUnsubscribe = null
  }
  try {
    await deleteDoc(doc(db, 'matching_queue', userId))
    console.log(`[SafeSpeak Firestore] User ${userId} removed from matching queue`)
  } catch (err) {
    console.warn('[SafeSpeak Firestore] Error leaving queue:', err)
  }
}

function deriveSharedContext(c1?: CheckInAnswers, c2?: CheckInAnswers): string {
  const t1 = c1?.topics || []
  const t2 = c2?.topics || []
  const common = t1.filter((x) => t2.includes(x))
  if (common.length > 0) return topicToFriendly(common[0])
  if (t1.length > 0 && t2.length > 0) return `${topicToFriendly(t1[0])} & ${topicToFriendly(t2[0])}`
  if (t1.length > 0) return topicToFriendly(t1[0])
  if (t2.length > 0) return topicToFriendly(t2[0])
  return 'carrying daily stress & thoughts'
}

function deriveSoloContext(c?: CheckInAnswers): string {
  const topics = c?.topics || []
  if (topics.length > 0) return topicToFriendly(topics[0])
  return 'exam & deadline pressure'
}

function topicToFriendly(topicId: string): string {
  switch (topicId) {
    case 'exam': return 'exam & study pressure'
    case 'family': return 'family expectations'
    case 'body': return 'body image & self-comparison'
    case 'relationship': return 'a tough relationship moment'
    case 'loneliness': return 'feeling lonely'
    case 'habit': return 'breaking a tough habit'
    case 'sleep': return 'sleepless 3am thoughts'
    case 'work': return 'work pressure'
    default: return 'carrying heavy thoughts today'
  }
}

function generateIcebreaker(topic: string): string {
  if (topic.includes('exam')) return 'How long has it been feeling this way for you?'
  if (topic.includes('family')) return 'Is it something specific that happened recently, or has it been building up?'
  if (topic.includes('sleep') || topic.includes('3am')) return 'Are your thoughts racing or does everything just feel quiet and heavy?'
  if (topic.includes('lonel')) return 'Do you prefer venting first, or just sharing some quiet comfort?'
  return 'Hey... whatever is on your mind, you have a safe space here.'
}
