import { CharacterId } from '@safespeak/shared-types'
import { translateMessage } from './translator.js'

interface SimulatedPeerContext {
  characterId: CharacterId
  characterTag: string
  sharedTopic: string
  messageHistory: string[]
}

const PEER_PERSONAS: Record<CharacterId, { name: string; style: string; defaultIcebreaker: string }> = {
  owl: {
    name: 'StressedOwl',
    style: 'thoughtful, analytical, carrying exam/deadline pressure',
    defaultIcebreaker: "Hey... I've been overthinking everything today. How are you holding up?",
  },
  deer: {
    name: 'GentleDeer',
    style: 'empathetic, warm, gentle, feeling a bit self-conscious',
    defaultIcebreaker: "Hey. It feels nice to talk to someone who understands the quiet pressure.",
  },
  penguin: {
    name: 'QuietPenguin',
    style: 'introverted, observant, nervous about expectations',
    defaultIcebreaker: "Hi... feeling a bit out of place today, but glad we connected.",
  },
  panda: {
    name: 'SleepyPanda',
    style: 'exhausted, seeking calm, calming presence',
    defaultIcebreaker: "Hey. My mind has been running non-stop. Just needed a quiet space to chat.",
  },
  rabbit: {
    name: 'ShyRabbit',
    style: 'anxious, eager to connect, relatable habit struggles',
    defaultIcebreaker: "Hi! I was a little nervous to tap match, but really needed to talk.",
  },
  bear: {
    name: 'WarmBear',
    style: 'protective, grounded, carrying unspoken burdens',
    defaultIcebreaker: "Hello. Take a deep breath — whatever is on your mind, you can share safely here.",
  },
}

export function getSimulatedPeerPersona(id: CharacterId) {
  return PEER_PERSONAS[id] || PEER_PERSONAS.owl
}

export function generatePeerResponse(
  userText: string,
  context: SimulatedPeerContext,
  userLang: string = 'English'
): { text: string; delayMs: number } {
  const lower = userText.toLowerCase()
  const historyLen = context.messageHistory.length

  let reply = ""

  // Contextual conversational replies
  if (historyLen === 0) {
    reply = "Hey. I saw we're both dealing with some heavy things right now. How long has it been feeling this way for you?"
  } else if (/hello|hi|hey/i.test(lower) && lower.length < 15) {
    reply = "Hey! It's really comforting to connect with someone right now. What's been on your mind the most today?"
  } else if (/exam|board|study|deadlines|marks|rank|fail/i.test(lower)) {
    reply = "Haan bilkul samjha. The expectations make it so hard to breathe sometimes. I try taking small 10-minute focus blocks — does taking short breaks help you at all?"
  } else if (/stress|tension|overwhelm|heavy|pressure|scared|anxious/i.test(lower)) {
    reply = "I completely hear you. Just acknowledging how heavy it feels is already a brave step. Take your time, there is zero rush here."
  } else if (/lonely|alone|nobody|no one/i.test(lower)) {
    reply = "Feeling alone in a crowded room is one of the hardest feelings. You're definitely not alone right now though — I'm right here listening."
  } else if (/family|parents|expectation|fight|argument/i.test(lower)) {
    reply = "Family expectations carry such a heavy weight because we care so much. It's okay to feel conflicted about what they expect vs what you need."
  } else if (/sleep|tired|exhausted|rest/i.test(lower)) {
    reply = "That kind of tiredness that sleep doesn't fix is so real. Please remember to go gentle on yourself today."
  } else if (/thank|helpful|relief|better|good/i.test(lower)) {
    reply = "That really warms my heart. It's helping me just as much to talk through this with you."
  } else {
    const genericReplies = [
      "Thank you for sharing that with me. It takes real honesty to put that into words.",
      "I relate to that more than you know. What do you think would bring you even a tiny bit of peace today?",
      "That makes total sense. I've been feeling similarly overwhelmed lately.",
      "I'm really glad we got matched today. Having someone just listen without judgment makes a big difference.",
    ]
    reply = genericReplies[historyLen % genericReplies.length]
  }

  // Realistic human typing delay (1.2s to 2.4s)
  const delayMs = Math.min(2400, Math.max(1200, reply.length * 25))

  return { text: reply, delayMs }
}
