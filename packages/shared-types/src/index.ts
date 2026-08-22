export const SAFE_SPEAK_VERSION = '1.0.0'

export type CharacterId = 'penguin' | 'owl' | 'panda' | 'rabbit' | 'bear' | 'deer'

export interface CharacterMeta {
  id: CharacterId
  name: string
  animal: string
  situation: string
  description: string
  deeperContext: string
  trait: string
  emoji: string
  accentColor: string
  traits: string[]
  tagPrefix: string
}

export type SupportedLanguage = 'English' | 'Hindi' | 'Telugu' | 'Tamil' | 'Hinglish' | 'Other'

export interface CheckInAnswers {
  topics: string[]
  duration: string
  heaviness: number
  intent: string
  peer_stage: string
  role: string
  boundaries: string[]
  languages: string[]
  safety: 'yes' | 'no' | 'prefer_not_to_say' | ''
}

export type CrisisTier = 0 | 1 | 2
// 0 = Clean / No crisis detected
// 1 = Mild concern (stress, sadness, overwhelm) -> trigger gentle in-chat breathing nudge
// 2 = Serious crisis / self-harm danger -> immediate full-screen helpline overlay & block broadcast

export type ModerationVerdict = 'clean' | 'soft_flag' | 'blocked'

export interface ModerationResult {
  verdict: ModerationVerdict
  category?: 'bullying' | 'harassment' | 'hate' | 'unsafe_medical_advice' | 'explicit' | null
  reason?: string
  suggestedRephrase?: string
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderCharacter: CharacterId
  senderTag: string
  text: string
  originalLanguage?: string
  translatedText?: string
  targetLanguage?: string
  time: string
  timestamp: number
  crisisTier?: CrisisTier
  moderation?: ModerationResult
  isVoice?: boolean
  voiceAudioUrl?: string
  isSimulatedPeer?: boolean
  reactions?: string[]
}

export interface MatchRequest {
  socketId: string
  sessionId: string
  characterId: CharacterId
  characterTag: string
  checkin: CheckInAnswers
  preferredLanguages: string[]
}

export interface MatchFoundPayload {
  roomId: string
  peerSocketId: string
  peerCharacter: CharacterId
  peerTag: string
  peerLanguage: string
  myCharacter: CharacterId
  myTag: string
  myLanguage: string
  sharedContext: string
  icebreaker: string
  isSimulatedPeer: boolean
}

export type ThemedRoomId = 'exam' | 'city' | 'habit' | 'night' | 'body' | 'work'

export interface ThemedRoomMeta {
  id: ThemedRoomId
  name: string
  desc: string
  emoji: string
  activeCount: number
  color: string
}

export interface ReflectionSummary {
  topicsDiscussed: string[]
  durationMinutes: number
  messageCount: number
  helpfulTakeaways: string[]
  characterName: string
  peerName: string
  sentiment: string
}

export type EndChatReactionEmoji = '🌿' | '☀️' | '🌊' | '🤍'

export interface EndChatReaction {
  emoji: EndChatReactionEmoji
  label: string
}
