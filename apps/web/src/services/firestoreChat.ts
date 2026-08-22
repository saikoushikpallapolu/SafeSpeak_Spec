import { 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  updateDoc, 
  getDoc,
  type Unsubscribe 
} from 'firebase/firestore'
import { db } from './firebase'
import type { CharacterId, ChatMessage, ReflectionSummary } from '@safespeak/shared-types'
import { 
  checkCrisisTier, 
  checkModeration, 
  translateMessage, 
  generatePeerResponse, 
  generateReflectionSummary 
} from './safetyAndTranslation'

export function subscribeToChatRoom(
  roomId: string,
  myUserId: string,
  callbacks: {
    onMessages: (msgs: ChatMessage[]) => void
    onTyping: (isTyping: boolean) => void
    onPeerLeft: (reason: string) => void
    onChatEnded: (summary: ReflectionSummary) => void
  }
): () => void {
  const roomDocRef = doc(db, 'chat_rooms', roomId)
  const messagesColRef = collection(db, 'chat_rooms', roomId, 'messages')
  const messagesQuery = query(messagesColRef, orderBy('timestamp', 'asc'))

  // 1. Subscribe to messages collection
  const unsubMessages: Unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const msgs: ChatMessage[] = []
    snapshot.forEach((d) => {
      msgs.push({ id: d.id, ...(d.data() as any) })
    })
    callbacks.onMessages(msgs)
  })

  // 2. Subscribe to room state (typing, ended, summary)
  const unsubRoom: Unsubscribe = onSnapshot(roomDocRef, (docSnap) => {
    if (!docSnap.exists()) return
    const data = docSnap.data()

    // Typing check
    if (data.typing) {
      const otherTyping = Object.entries(data.typing).some(([uid, isT]) => uid !== myUserId && Boolean(isT))
      callbacks.onTyping(otherTyping)
    }

    // Status check
    if (data.status === 'ended') {
      if (data.summary) {
        callbacks.onChatEnded(data.summary)
      }
      if (data.endedBy && data.endedBy !== myUserId) {
        callbacks.onPeerLeft('Your conversation partner has left the chat.')
      }
    }
  })

  return () => {
    unsubMessages()
    unsubRoom()
  }
}

export async function sendChatMessage(
  roomId: string,
  myUserId: string,
  myChar: CharacterId,
  myTag: string,
  myLanguage: string,
  text: string,
  isVoice: boolean = false,
  peerLanguage: string = 'English'
): Promise<{ error?: string; crisisTier?: number; moderationBlocked?: any }> {
  if (!text.trim()) return {}

  // 1. Crisis Check
  const crisisTier = checkCrisisTier(text)
  if (crisisTier === 2) {
    return {
      crisisTier: 2,
      error: 'Immediate safety helpline support is available.',
    }
  }

  // 2. Moderation Check
  const mod = checkModeration(text)
  if (mod.verdict === 'blocked') {
    return {
      moderationBlocked: mod,
      error: mod.reason,
    }
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const translation = translateMessage(text, peerLanguage)

  const msgPayload: Omit<ChatMessage, 'id'> = {
    roomId,
    senderId: myUserId,
    senderCharacter: myChar,
    senderTag: myTag,
    text: text.trim(),
    originalLanguage: myLanguage,
    translatedText: translation.translatedText,
    targetLanguage: peerLanguage,
    time: timeStr,
    timestamp: Date.now(),
    crisisTier: crisisTier as any,
    moderation: mod,
    isVoice,
  }

  // Write message to Firestore subcollection
  await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), msgPayload)

  // Clear typing indicator for current user
  try {
    await updateDoc(doc(db, 'chat_rooms', roomId), {
      [`typing.${myUserId}`]: false,
    })
  } catch (_) {}

  // 3. If simulated peer room -> trigger AI response
  const roomSnap = await getDoc(doc(db, 'chat_rooms', roomId))
  if (roomSnap.exists()) {
    const roomData = roomSnap.data()
    if (roomData.isSimulated && roomData.simulatedContext) {
      const simContext = roomData.simulatedContext
      simContext.messageHistory = simContext.messageHistory || []
      simContext.messageHistory.push(text)

      // Turn on typing for simulated peer
      await updateDoc(doc(db, 'chat_rooms', roomId), {
        'typing.sim_peer': true,
        simulatedContext: simContext,
      })

      const { text: replyText, delayMs } = generatePeerResponse(
        text,
        simContext,
        myLanguage
      )

      setTimeout(async () => {
        try {
          const peerTranslation = translateMessage(replyText, myLanguage)
          const simMsg: Omit<ChatMessage, 'id'> = {
            roomId,
            senderId: 'sim_peer',
            senderCharacter: simContext.characterId || 'deer',
            senderTag: simContext.characterTag || 'GentleDeer#4821',
            text: replyText,
            originalLanguage: 'English',
            translatedText: peerTranslation.translatedText,
            targetLanguage: myLanguage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            isSimulatedPeer: true,
          }

          await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), simMsg)

          await updateDoc(doc(db, 'chat_rooms', roomId), {
            'typing.sim_peer': false,
          })
        } catch (e) {
          console.warn('[SafeSpeak Firestore] Error adding sim peer reply:', e)
        }
      }, delayMs)
    }
  }

  return { crisisTier }
}

export async function setChatTyping(roomId: string, myUserId: string, isTyping: boolean) {
  try {
    await updateDoc(doc(db, 'chat_rooms', roomId), {
      [`typing.${myUserId}`]: isTyping,
    })
  } catch (_) {}
}

export async function leaveChatRoom(roomId: string, myUserId: string) {
  try {
    await updateDoc(doc(db, 'chat_rooms', roomId), {
      status: 'ended',
      endedBy: myUserId,
    })
  } catch (_) {}
}

export async function endChatRoom(
  roomId: string,
  myUserId: string,
  myChar: CharacterId,
  peerTag: string,
  messages: ChatMessage[],
  startTime: number
): Promise<ReflectionSummary> {
  const summary = generateReflectionSummary(messages, myChar, peerTag, startTime)
  try {
    await updateDoc(doc(db, 'chat_rooms', roomId), {
      status: 'ended',
      endedBy: myUserId,
      summary,
    })
  } catch (_) {}
  return summary
}

// ----------------- Themed Group Rooms -----------------

export function subscribeToGroupRoom(
  roomId: string,
  onMessages: (msgs: ChatMessage[]) => void
): () => void {
  const messagesColRef = collection(db, 'group_rooms', roomId, 'messages')
  const messagesQuery = query(messagesColRef, orderBy('timestamp', 'asc'))

  return onSnapshot(messagesQuery, (snapshot) => {
    const msgs: ChatMessage[] = []
    snapshot.forEach((d) => {
      msgs.push({ id: d.id, ...(d.data() as any) })
    })
    onMessages(msgs)
  })
}

export async function sendGroupRoomMessage(
  roomId: string,
  myUserId: string,
  myChar: CharacterId,
  myTag: string,
  myLanguage: string,
  text: string
): Promise<{ error?: string; crisisTier?: number }> {
  if (!text.trim()) return {}

  const crisisTier = checkCrisisTier(text)
  if (crisisTier === 2) {
    return {
      crisisTier: 2,
      error: 'Immediate safety helpline support is available.',
    }
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const msgPayload: Omit<ChatMessage, 'id'> = {
    roomId,
    senderId: myUserId,
    senderCharacter: myChar,
    senderTag: myTag,
    text: text.trim(),
    originalLanguage: myLanguage,
    translatedText: text.trim(),
    targetLanguage: myLanguage,
    time: timeStr,
    timestamp: Date.now(),
    crisisTier: crisisTier as any,
  }

  await addDoc(collection(db, 'group_rooms', roomId, 'messages'), msgPayload)
  return { crisisTier }
}
