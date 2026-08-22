import { CharacterId, MatchFoundPayload, MatchRequest } from '@safespeak/shared-types'
import { getSimulatedPeerPersona } from '../ai/peerSimulator.js'

interface QueueEntry {
  request: MatchRequest
  joinedAt: number
  timeoutId: NodeJS.Timeout
}

export interface MatchFoundResult {
  user1SocketId: string
  user1Payload: MatchFoundPayload
  user2SocketId?: string
  user2Payload?: MatchFoundPayload
}

export class QueueManager {
  private queue: Map<string, QueueEntry> = new Map()
  private onMatchFoundCallback?: (result: MatchFoundResult) => void
  private fallbackDelayMs: number

  constructor(onMatchFound?: (result: MatchFoundResult) => void, fallbackDelayMs: number = 25000) {
    this.onMatchFoundCallback = onMatchFound
    this.fallbackDelayMs = fallbackDelayMs
  }

  public setOnMatchFound(cb: (result: MatchFoundResult) => void) {
    this.onMatchFoundCallback = cb
  }

  public enqueue(request: MatchRequest): void {
    // Remove existing if any
    this.dequeue(request.socketId)

    // Check if another real user is waiting (unconditional matching for ANY 2 people)
    const waitingEntry = this.findBestMatch(request)

    if (waitingEntry) {
      // Clear waiting user's fallback timer
      clearTimeout(waitingEntry.timeoutId)
      this.queue.delete(waitingEntry.request.socketId)

      // Create live pair match between two real devices
      const roomId = `room_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const sharedContext = this.calculateSharedContext(request, waitingEntry.request)
      const icebreaker = this.generateIcebreaker(sharedContext)

      // user1 is the waiting user (sock_user1)
      const user1Payload: MatchFoundPayload = {
        roomId,
        peerSocketId: request.socketId,
        peerCharacter: request.characterId,
        peerTag: request.characterTag || 'Peer',
        peerLanguage: (request.preferredLanguages && request.preferredLanguages[0]) || 'English',
        myCharacter: waitingEntry.request.characterId,
        myTag: waitingEntry.request.characterTag || 'You',
        myLanguage: (waitingEntry.request.preferredLanguages && waitingEntry.request.preferredLanguages[0]) || 'English',
        sharedContext,
        icebreaker,
        isSimulatedPeer: false,
      }

      // user2 is the newcomer (sock_user2)
      const user2Payload: MatchFoundPayload = {
        roomId,
        peerSocketId: waitingEntry.request.socketId,
        peerCharacter: waitingEntry.request.characterId,
        peerTag: waitingEntry.request.characterTag || 'Peer',
        peerLanguage: (waitingEntry.request.preferredLanguages && waitingEntry.request.preferredLanguages[0]) || 'English',
        myCharacter: request.characterId,
        myTag: request.characterTag || 'You',
        myLanguage: (request.preferredLanguages && request.preferredLanguages[0]) || 'English',
        sharedContext,
        icebreaker,
        isSimulatedPeer: false,
      }

      console.log(`[SafeSpeak Queue] Matched two real users: ${waitingEntry.request.socketId} <-> ${request.socketId} in room ${roomId}`)

      if (this.onMatchFoundCallback) {
        this.onMatchFoundCallback({
          user1SocketId: waitingEntry.request.socketId,
          user1Payload,
          user2SocketId: request.socketId,
          user2Payload,
        })
      }
      return
    }

    // No immediate user: add to queue and wait before fallback
    const timeoutId = setTimeout(() => {
      this.triggerSimulatedMatch(request.socketId)
    }, this.fallbackDelayMs)

    this.queue.set(request.socketId, {
      request,
      joinedAt: Date.now(),
      timeoutId,
    })

    console.log(`[SafeSpeak Queue] Socket ${request.socketId} enqueued. Total waiting in queue: ${this.queue.size}`)
  }

  public dequeue(socketId: string): void {
    const entry = this.queue.get(socketId)
    if (entry) {
      clearTimeout(entry.timeoutId)
      this.queue.delete(socketId)
      console.log(`[SafeSpeak Queue] Socket ${socketId} dequeued. Total waiting in queue: ${this.queue.size}`)
    }
  }

  public getQueueSize(): number {
    return this.queue.size
  }

  private triggerSimulatedMatch(socketId: string) {
    const entry = this.queue.get(socketId)
    if (!entry) return

    this.queue.delete(socketId)
    const req = entry.request

    // Choose complementary character
    const candidates: CharacterId[] = ['owl', 'deer', 'penguin', 'panda', 'rabbit', 'bear']
    const available = candidates.filter(c => c !== req.characterId)
    const peerChar = available[Math.floor(Math.random() * available.length)]
    const persona = getSimulatedPeerPersona(peerChar)

    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const peerTag = `${persona.name}#${randomSuffix}`

    const sharedContext = this.deriveSoloContext(req)
    const icebreaker = this.generateIcebreaker(sharedContext)
    const roomId = `room_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const user1Payload: MatchFoundPayload = {
      roomId,
      peerSocketId: `sim_${Date.now()}`,
      peerCharacter: peerChar,
      peerTag,
      peerLanguage: (req.preferredLanguages && req.preferredLanguages[0]) || 'English',
      myCharacter: req.characterId,
      myTag: req.characterTag || 'You',
      myLanguage: (req.preferredLanguages && req.preferredLanguages[0]) || 'English',
      sharedContext,
      icebreaker,
      isSimulatedPeer: true,
    }

    console.log(`[SafeSpeak Queue] Solo fallback triggered for socket ${socketId}`)

    if (this.onMatchFoundCallback) {
      this.onMatchFoundCallback({
        user1SocketId: socketId,
        user1Payload,
      })
    }
  }

  private findBestMatch(req: MatchRequest): QueueEntry | null {
    if (this.queue.size === 0) return null

    // Unconditionally pick the first waiting other user
    const entries = Array.from(this.queue.values())
    const otherEntries = entries.filter(e => e.request.socketId !== req.socketId)
    return otherEntries[0] || null
  }

  private calculateSharedContext(req1: MatchRequest, req2: MatchRequest): string {
    const t1 = req1.checkin?.topics || []
    const t2 = req2.checkin?.topics || []
    const common = t1.filter(x => t2.includes(x))

    if (common.length > 0) {
      return this.topicToFriendly(common[0])
    }

    if (t1.length > 0 && t2.length > 0) {
      return `${this.topicToFriendly(t1[0])} & ${this.topicToFriendly(t2[0])}`
    }

    if (t1.length > 0) return this.topicToFriendly(t1[0])
    if (t2.length > 0) return this.topicToFriendly(t2[0])
    return 'carrying daily stress & thoughts'
  }

  private deriveSoloContext(req: MatchRequest): string {
    const topics = req.checkin?.topics || []
    if (topics.length > 0) {
      return this.topicToFriendly(topics[0])
    }
    return 'exam & deadline pressure'
  }

  private topicToFriendly(topicId: string): string {
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

  private generateIcebreaker(topic: string): string {
    if (topic.includes('exam')) return 'How long has it been feeling this way for you?'
    if (topic.includes('family')) return 'Is it something specific that happened recently, or has it been building up?'
    if (topic.includes('sleep') || topic.includes('3am')) return 'Are your thoughts racing or does everything just feel quiet and heavy?'
    if (topic.includes('lonel')) return 'Do you prefer venting first, or just sharing some quiet comfort?'
    return 'Hey... whatever is on your mind, you have a safe space here.'
  }
}
