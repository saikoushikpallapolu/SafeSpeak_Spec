import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  type Unsubscribe 
} from 'firebase/firestore'
import { db } from './firebase'
import type { CharacterId } from '@safespeak/shared-types'
import { evaluateComprehensiveSafety } from './aiSafetyEngine'

export interface CustomRoom {
  id: string
  name: string
  category: string
  desc: string
  creatorTag: string
  createdAt: number
  activeCount?: number
}

export interface GroupRoomMessage {
  id: string
  text: string
  senderId: string
  senderCharacter: CharacterId
  senderTag: string
  timestamp: number
  time: string
}

// 1. Subscribe to real-time user-created rooms
export function subscribeToRooms(onRooms: (rooms: CustomRoom[]) => void): Unsubscribe {
  const colRef = collection(db, 'custom_rooms')
  const q = query(colRef, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const list: CustomRoom[] = []
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as any) })
    })
    onRooms(list)
  }, (err) => {
    console.warn('[FirestoreRooms] subscribe error:', err)
  })
}

// 2. Create a new custom room
export async function createCustomRoom(data: {
  name: string
  category: string
  desc: string
  creatorTag: string
}): Promise<string> {
  const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  const roomRef = doc(db, 'custom_rooms', roomId)
  await setDoc(roomRef, {
    name: data.name.trim(),
    category: data.category.trim() || 'General',
    desc: data.desc.trim() || 'A safe open space for anyone to join.',
    creatorTag: data.creatorTag,
    createdAt: Date.now(),
    activeCount: 1,
  })
  return roomId
}

// 3. Subscribe to messages inside a custom room
export function subscribeToGroupMessages(
  roomId: string,
  onMessages: (msgs: GroupRoomMessage[]) => void
): Unsubscribe {
  const colRef = collection(db, 'custom_rooms', roomId, 'messages')
  const q = query(colRef, orderBy('timestamp', 'asc'))
  return onSnapshot(q, (snapshot) => {
    const list: GroupRoomMessage[] = []
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as any) })
    })
    onMessages(list)
  }, (err) => {
    console.warn('[FirestoreRooms] messages subscribe error:', err)
  })
}

// 4. Send message inside a room with safety engine validation
export async function sendGroupRoomMessage(
  roomId: string,
  myUserId: string,
  myChar: CharacterId,
  myTag: string,
  text: string
): Promise<{ error?: string; crisisTier?: number }> {
  const clean = text.trim()
  if (!clean) return {}

  const safety = evaluateComprehensiveSafety(clean)
  if (safety.moderation.verdict === 'blocked') {
    return { error: safety.moderation.reason || 'Message violates safety guidelines.' }
  }
  if (safety.crisisTier === 2) {
    return { crisisTier: 2, error: 'Immediate safety helpline support is available.' }
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const colRef = collection(db, 'custom_rooms', roomId, 'messages')
  await addDoc(colRef, {
    text: clean,
    senderId: myUserId,
    senderCharacter: myChar,
    senderTag: myTag,
    timestamp: Date.now(),
    time: timeStr,
  })

  return {}
}
