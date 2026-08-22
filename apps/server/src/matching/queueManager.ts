import { CharacterId, MatchFoundPayload, MatchRequest } from '@safespeak/shared-types'
import { getSimulatedPeerPersona } from '../ai/peerSimulator.js'

interface QueueEntry {
  request: MatchRequest
  joinedAt: number
  timeoutId: NodeJS.Timeout
}

export class QueueManager {
  private queue: Map<string, QueueEntry> = new Map()
  private onMatchFoundCallback?: (payloads: { user1Payload: MatchFoundPayload; user2Payload?: MatchFoundPayload }) => void

  constructor(onMatchFound?: (payloads: { user1Payload: MatchFoundPayload; user2Payload?: MatchFoundPayload }) => void) {
    this.onMatchFoundCallback = onMatchFound
  }

  public setOnMatchFound(cb: (payloads: { user1Payload: MatchFoundPayload; user2Payload?: MatchFoundPayload }) => void) {
    this.onMatchFoundCallback = cb
  }

  public enqueue(request: MatchRequest): void {
    // Remove if already in queue
    this.dequeue(request.socketId)

    // Check if there is another user waiting
    const waitingEntry = this.findBestMatch(request)

    if (waitingEntry) {
      // Clear their fallback timer
      clearTimeout(waitingEntry.timeoutId)
      this.queue.delete(waitingEntry.request.socketId)

      // Create live pair match
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const sharedContext = this.calculateSharedContext(request, waitingEntry.request)
      const icebreaker = this.generateIcebreaker(sharedContext)

      const user1Payload: MatchFoundPayload = {
        roomId,
        peerSocketId: waitingEntry.request.socketId,
        peerCharacter: waitingEntry.request.characterId,
        peerTag: waitingEntry.request.characterTag,
        peerLanguage: waitingEntry.request.preferredLanguages[0] || 'English',
        myCharacter: request.characterId,
        myTag: request.characterTag,
        myLanguage: request.preferredLanguages[0] || 'English',
        sharedContext,
        icebreaker,
        isSimulatedPeer: false,
      }

      const user2Payload: MatchFoundPayload = {
        roomId,
        peerSocketId: request.socketId,
        peerCharacter: request.characterId,
        peerTag: request.characterTag,
        peerLanguage: request.preferredLanguages[0] || 'English',
        myCharacter: waitingEntry.request.characterId,
        myTag: waitingEntry.request.characterTag,
        myLanguage: waitingEntry.request.preferredLanguages[0] || 'English',
        sharedContext,
        icebreaker,
        isSimulatedPeer: false,
      }

      if (this.onMatchFoundCallback) {
        this.onMatchFoundCallback({ user1Payload, user2Payload })
      }
      return
    }

    // No immediate match: add to queue and start 3.5s simulated peer fallback timer
    const timeoutId = setTimeout(() => {
      this.triggerSimulatedMatch(request.socketId)
    }, 3500)

    this.queue.set(request.socketId, {
      request,
      joinedAt: Date.now(),
      timeoutId,
    })
  }

  public dequeue(socketId: string): void {
    const entry = this.queue.get(socketId)
    if (entry) {
      clearTimeout(entry.timeoutId)
      this.queue.delete(socketId)
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
      peerLanguage: req.preferredLanguages[0] || 'English',
      myCharacter: req.characterId,
      myTag: req.characterTag,
      myLanguage: req.preferredLanguages[0] || 'English',
      sharedContext,
      icebreaker,
      isSimulatedPeer: true,
    }

    if (this.onMatchFoundCallback) {
      this.onMatchFoundCallback({ user1Payload })
    }
  }

  private findBestMatch(req: MatchRequest): QueueEntry | null {
    if (this.queue.size === 0) return null

    // Pick first available waiting user
    const entries = Array.from(this.queue.values())
    return entries[0] || null
  }

  private calculateSharedContext(req1: MatchRequest, req2: MatchRequest): string {
    const t1 = req1.checkin?.topics || []
    const t2 = req2.checkin?.topics || []
    const common = t1.filter(x => t2.includes(x))

    if (common.includes('exam')) return 'exam & academic pressure'
    if (common.includes('family')) return 'family expectations'
    if (common.includes('body')) return 'body image & self-doubt'
    if (common.includes('loneliness')) return 'navigating loneliness'
    if (common.includes('habit')) return 'trying to break a tough habit'
    if (common.includes('sleep')) return 'trouble sleeping & restless thoughts'
    if (common.includes('work')) return 'work & career stress'

    if (t1.length > 0) return this.topicToFriendly(t1[0])
    return 'the weight of a heavy day'
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
