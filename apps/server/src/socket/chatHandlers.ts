import { Server, Socket } from 'socket.io'
import { ChatMessage, MatchRequest, ThemedRoomId } from '@safespeak/shared-types'
import { QueueManager } from '../matching/queueManager.js'
import { checkCrisisTier } from '../safety/crisisDetector.js'
import { checkModeration } from '../safety/moderator.js'
import { translateMessage } from '../ai/translator.js'
import { generatePeerResponse } from '../ai/peerSimulator.js'
import { generateReflectionSummary } from '../ai/reflectionGenerator.js'

interface ParticipantInfo {
  socketId: string
  character: any
  tag: string
  language: string
}

interface RoomState {
  roomId: string
  isGroup: boolean
  isSimulated: boolean
  participants: Map<string, ParticipantInfo>
  messages: ChatMessage[]
  startTime: number
  simulatedPeerContext?: {
    characterId: any
    characterTag: string
    sharedTopic: string
    messageHistory: string[]
  }
}

const activeRooms = new Map<string, RoomState>()
const groupRoomParticipants = new Map<ThemedRoomId, Map<string, ParticipantInfo>>()

export function setupSocketHandlers(io: Server) {
  const queueManager = new QueueManager()

  queueManager.setOnMatchFound(({ user1SocketId, user1Payload, user2SocketId, user2Payload }) => {
    const roomState: RoomState = {
      roomId: user1Payload.roomId,
      isGroup: false,
      isSimulated: user1Payload.isSimulatedPeer,
      participants: new Map(),
      messages: [],
      startTime: Date.now(),
    }

    if (user1Payload.isSimulatedPeer) {
      roomState.simulatedPeerContext = {
        characterId: user1Payload.peerCharacter,
        characterTag: user1Payload.peerTag,
        sharedTopic: user1Payload.sharedContext,
        messageHistory: [],
      }
      console.log(`[SafeSpeak Socket] Emitting match_found (simulated) to socket ${user1SocketId}`)
      io.to(user1SocketId).emit('match_found', user1Payload)
    } else if (user2Payload && user2SocketId) {
      console.log(`[SafeSpeak Socket] Emitting match_found (REAL LIVE PAIR) to ${user1SocketId} & ${user2SocketId}`)
      io.to(user1SocketId).emit('match_found', user1Payload)
      io.to(user2SocketId).emit('match_found', user2Payload)
    }
    activeRooms.set(user1Payload.roomId, roomState)
  })

  io.on('connection', (socket: Socket) => {
    console.log(`[SafeSpeak Socket] Client connected: ${socket.id}`)

    // 1. Join Matching Queue
    socket.on('join_queue', (data: MatchRequest) => {
      const enrichedReq: MatchRequest = {
        ...data,
        socketId: socket.id,
        characterTag: data.characterTag || `${data.characterId}#${socket.id.slice(0, 4)}`,
      }
      socket.data.character = data.characterId
      socket.data.tag = enrichedReq.characterTag
      socket.data.language = (data.preferredLanguages && data.preferredLanguages[0]) || 'English'

      console.log(`[SafeSpeak Socket] ${socket.id} joined queue with character ${data.characterId}`)
      queueManager.enqueue(enrichedReq)
    })

    // 2. Leave Matching Queue
    socket.on('leave_queue', () => {
      console.log(`[SafeSpeak Socket] ${socket.id} left queue`)
      queueManager.dequeue(socket.id)
    })

    // 3. Join 1:1 Chat Room
    socket.on('join_chat_room', ({ roomId, character, tag, language }) => {
      socket.join(roomId)
      let room = activeRooms.get(roomId)
      if (!room) {
        room = {
          roomId,
          isGroup: false,
          isSimulated: roomId.includes('sim') || roomId.includes('friend'),
          participants: new Map(),
          messages: [],
          startTime: Date.now(),
        }
        if (roomId.includes('sim') || roomId.includes('friend')) {
          room.simulatedPeerContext = {
            characterId: 'deer',
            characterTag: 'GentleDeer#4821',
            sharedTopic: 'exam stress',
            messageHistory: [],
          }
        }
        activeRooms.set(roomId, room)
      }
      room.participants.set(socket.id, {
        socketId: socket.id,
        character,
        tag: tag || `${character}#${socket.id.slice(0, 4)}`,
        language: language || 'English',
      })
      console.log(`[SafeSpeak Socket] Socket ${socket.id} joined room ${roomId}. Total participants in room: ${room.participants.size}`)
      socket.emit('room_ready', { roomId })
    })

    // 4. Send Message (1:1 and Group)
    socket.on('send_message', async ({ roomId, text, isVoice, voiceAudioUrl }) => {
      const room = activeRooms.get(roomId)
      const senderChar = socket.data.character || 'owl'
      const senderTag = socket.data.tag || 'Anonymous#0000'
      const senderLang = socket.data.language || 'English'

      // A. Crisis Evaluation
      const crisisTier = checkCrisisTier(text)
      if (crisisTier === 2) {
        socket.emit('crisis_alert', {
          tier: 2,
          message: text,
          reason: 'Immediate safety helpline support is available.',
        })
        return
      }

      // B. Moderation Check
      const moderation = checkModeration(text)
      if (moderation.verdict === 'blocked') {
        socket.emit('moderation_blocked', {
          reason: moderation.reason,
          category: moderation.category,
        })
        return
      }

      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      // Base message for sender (shows original text as typed)
      const senderMsg: ChatMessage = {
        id: msgId,
        roomId,
        senderId: socket.id,
        senderCharacter: senderChar,
        senderTag,
        text,
        originalLanguage: senderLang,
        translatedText: text,
        targetLanguage: senderLang,
        time: timeStr,
        timestamp: Date.now(),
        crisisTier: crisisTier as any,
        moderation,
        isVoice: Boolean(isVoice),
        voiceAudioUrl,
      }

      if (room) {
        room.messages.push(senderMsg)
      }

      // Emit to sender
      socket.emit('new_message', senderMsg)

      // Emit to all peers with customized translation per peer's preferred language
      if (room) {
        for (const [peerSocketId, participant] of room.participants.entries()) {
          if (peerSocketId !== socket.id) {
            const targetLang = participant.language || 'English'
            const translation = translateMessage(text, targetLang)

            const peerMsg: ChatMessage = {
              ...senderMsg,
              originalLanguage: translation.originalLang,
              translatedText: translation.translatedText,
              targetLanguage: targetLang,
            }

            io.to(peerSocketId).emit('new_message', peerMsg)
          }
        }
      } else {
        // Fallback broadcast for group rooms
        socket.to(roomId).emit('new_message', senderMsg)
      }

      // If Tier 1 mild concern -> trigger in-chat breathing nudge card for sender
      if (crisisTier === 1) {
        socket.emit('nudge_alert', {
          tier: 1,
          triggerWord: text,
        })
      }

      // D. Handle Simulated Peer Response if applicable
      if (room && room.isSimulated && room.simulatedPeerContext) {
        room.simulatedPeerContext.messageHistory.push(text)
        const peerPersona = room.simulatedPeerContext.characterId

        // Typing indicator
        setTimeout(() => {
          socket.emit('peer_typing', { isTyping: true })
        }, 400)

        const { text: replyText, delayMs } = generatePeerResponse(
          text,
          room.simulatedPeerContext,
          senderLang
        )

        setTimeout(() => {
          socket.emit('peer_typing', { isTyping: false })

          const peerTranslation = translateMessage(replyText, senderLang)
          const peerMsg: ChatMessage = {
            id: `msg_sim_${Date.now()}`,
            roomId,
            senderId: 'sim_peer',
            senderCharacter: peerPersona,
            senderTag: room.simulatedPeerContext!.characterTag,
            text: replyText,
            originalLanguage: peerTranslation.originalLang,
            translatedText: peerTranslation.translatedText,
            targetLanguage: senderLang,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            isSimulatedPeer: true,
          }

          room.messages.push(peerMsg)
          socket.emit('new_message', peerMsg)
        }, delayMs + 600)
      }
    })

    // 5. Typing Indicators
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('peer_typing', { isTyping: true, tag: socket.data.tag })
    })

    socket.on('typing_stop', ({ roomId }) => {
      socket.to(roomId).emit('peer_typing', { isTyping: false, tag: socket.data.tag })
    })

    // 6. Explicit Leave Chat (One-time destruction & notify peer)
    socket.on('leave_chat', ({ roomId }) => {
      const room = activeRooms.get(roomId)
      if (room) {
        socket.to(roomId).emit('peer_left', {
          reason: 'Your conversation partner has left the chat.',
        })
        activeRooms.delete(roomId)
      }
      socket.leave(roomId)
    })

    // 7. End Chat & Request Reflection
    socket.on('end_chat', ({ roomId }) => {
      const room = activeRooms.get(roomId)
      if (room) {
        const summary = generateReflectionSummary(
          room.messages,
          socket.data.character || 'owl',
          room.simulatedPeerContext ? room.simulatedPeerContext.characterTag : 'Peer',
          room.startTime
        )
        // Notify both that chat has ended and give reflection
        io.to(roomId).emit('chat_ended', { summary })
        socket.to(roomId).emit('peer_left', {
          reason: 'Your conversation partner has ended the conversation.',
        })
        activeRooms.delete(roomId)
      }
      socket.leave(roomId)
    })

    // 8. Join Themed Group Room
    socket.on('join_group_room', ({ roomId, character, tag, language }) => {
      const rId = roomId as ThemedRoomId
      socket.join(rId)
      socket.data.character = character
      socket.data.tag = tag
      socket.data.language = language || 'English'

      if (!groupRoomParticipants.has(rId)) {
        groupRoomParticipants.set(rId, new Map())
      }
      groupRoomParticipants.get(rId)!.set(socket.id, {
        socketId: socket.id,
        character,
        tag,
        language: language || 'English',
      })

      const activeCount = groupRoomParticipants.get(rId)!.size
      io.to(rId).emit('group_room_count', { roomId: rId, count: activeCount + 3 })
    })

    // 9. Leave Themed Group Room
    socket.on('leave_group_room', ({ roomId }) => {
      const rId = roomId as ThemedRoomId
      socket.leave(rId)
      if (groupRoomParticipants.has(rId)) {
        groupRoomParticipants.get(rId)!.delete(socket.id)
        const count = groupRoomParticipants.get(rId)!.size
        io.to(rId).emit('group_room_count', { roomId: rId, count: count + 3 })
      }
    })

    // 10. Disconnect cleanup (Auto-notify peer & destroy room)
    socket.on('disconnect', () => {
      console.log(`[SafeSpeak Socket] Client disconnected: ${socket.id}`)
      queueManager.dequeue(socket.id)

      // Notify any 1:1 rooms that this participant disconnected
      for (const [roomId, room] of activeRooms.entries()) {
        if (room.participants.has(socket.id)) {
          socket.to(roomId).emit('peer_left', {
            reason: 'Your conversation partner disconnected.',
          })
          activeRooms.delete(roomId)
        }
      }

      for (const [rId, map] of groupRoomParticipants.entries()) {
        if (map.has(socket.id)) {
          map.delete(socket.id)
          io.to(rId).emit('group_room_count', { roomId: rId, count: map.size + 3 })
        }
      }
    })
  })
}
