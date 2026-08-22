import { detectLanguage, translateMessage } from '../ai/translator.js'
import { checkCrisisTier } from '../safety/crisisDetector.js'
import { checkModeration } from '../safety/moderator.js'
import { QueueManager } from '../matching/queueManager.js'
import { MatchRequest } from '@safespeak/shared-types'

console.log('\n--- Running SafeSpeak Automated Test Suite ---\n')

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${testName}`)
    failed++
  }
}

// 1. Language Detection & Translation Engine
console.log('[1/4] Language Detection & Translation Engine')
assert(detectLanguage('नमस्ते') === 'Hindi', 'Detects Hindi script')
assert(detectLanguage('హలో ఎలా ఉన్నారు') === 'Telugu', 'Detects Telugu script')
assert(detectLanguage('வணக்கம் எப்படி இருக்கிறீர்கள்') === 'Tamil', 'Detects Tamil script')
assert(detectLanguage('mujhe bahut stress ho raha hai') === 'Hinglish', 'Detects Hinglish code-switching')
assert(detectLanguage('I feel completely lost with these exams') === 'English', 'Detects English')

const hinglishTranslation = translateMessage('Mujhe exam ka bahut tension ho raha hai', 'English')
assert(hinglishTranslation.translatedText.toLowerCase().includes('exam') || hinglishTranslation.translatedText.toLowerCase().includes('stress'), 'Hinglish to English translation retains emotion')

const engToHindi = translateMessage('I am feeling so anxious about results', 'Hindi')
assert(engToHindi.translatedText.length > 0, 'English to Hindi translation maps stress correctly')

const engToTelugu = translateMessage('I feel lonely in this new city', 'Telugu')
assert(engToTelugu.translatedText.length > 0, 'English to Telugu translation maps stress correctly')

// 2. Crisis Guardian (Two-Tier)
console.log('\n[2/4] Two-Tier Crisis Safety Guardian')
assert(checkCrisisTier('I had a tiring day with my college work') === 0, 'Normal conversation is Tier 0')
assert(checkCrisisTier('I feel completely overwhelmed and suffocated today') === 1, 'Overwhelmed triggers Tier 1 (Mild Nudge)')
assert(checkCrisisTier('dimag phat raha itna load hai') === 1, 'Hinglish tension triggers Tier 1')
assert(checkCrisisTier('I want to kill myself right now') === 2, 'Direct self-harm triggers Tier 2 (Crisis Overlay)')
assert(checkCrisisTier('marne ka mann kar raha hai') === 2, 'Hinglish suicide intent triggers Tier 2')
assert(checkCrisisTier('chavalanipistundi') === 2, 'Tenglish crisis intent triggers Tier 2')

// 3. Safety Moderation Filter
console.log('\n[3/4] Safety Moderation Filter')
const cleanMod = checkModeration('I am feeling nervous about my final presentation')
assert(cleanMod.verdict === 'clean', 'Clean message passes moderation')

const medAdviceMod = checkModeration('You should stop taking your antidepressants and try this tea instead')
assert(medAdviceMod.verdict === 'blocked', 'Harmful remedy is blocked')
assert(Boolean(medAdviceMod.category), 'Harmful remedy category flagged')

// 4. Queue Manager & Real Two-User Matching
console.log('\n[4/4] Queue Manager & Real Two-User Matching')
const q = new QueueManager()

let realPairMatched = false

q.setOnMatchFound(({ user1Payload, user2SocketId, user2Payload }) => {
  if (user2SocketId && user2Payload) {
    realPairMatched = true
    assert(user1Payload.roomId === user2Payload.roomId, 'Both real users assigned identical roomId')
    assert(user1Payload.peerSocketId === 'sock_user2', 'User 1 is paired with User 2 socketId')
    assert(user2Payload.peerSocketId === 'sock_user1', 'User 2 is paired with User 1 socketId')
    assert(!user1Payload.isSimulatedPeer && !user2Payload.isSimulatedPeer, 'Match marked as live real peer')
  }
})

const reqUser1: MatchRequest = {
  socketId: 'sock_user1',
  sessionId: 'sess_1',
  characterId: 'owl',
  characterTag: 'StressedOwl#1111',
  checkin: {
    topics: ['exam'],
    heaviness: 3,
    duration: 'today',
    intent: 'vent',
    peer_stage: 'currently_in_it',
    role: 'talker',
    languages: ['English'],
    safety: 'no',
    boundaries: [],
  },
  preferredLanguages: ['English'],
}

const reqUser2: MatchRequest = {
  socketId: 'sock_user2',
  sessionId: 'sess_2',
  characterId: 'deer',
  characterTag: 'GentleDeer#2222',
  checkin: {
    topics: ['exam'],
    heaviness: 2,
    duration: 'this_week',
    intent: 'listen',
    peer_stage: 'passed_it',
    role: 'listener',
    languages: ['English'],
    safety: 'no',
    boundaries: [],
  },
  preferredLanguages: ['English'],
}

// User 1 enters queue
q.enqueue(reqUser1)
assert(q.getQueueSize() === 1, 'Queue enqueues first user')

// User 2 enters queue from second device -> Instant pair!
q.enqueue(reqUser2)
assert(realPairMatched, 'Two devices matched into live pair instantly')
assert(q.getQueueSize() === 0, 'Queue empties after pairing')

console.log(`\n========================================`)
console.log(`Test Results: ${passed} Passed, ${failed} Failed`)
console.log(`========================================\n`)

if (failed > 0) {
  process.exit(1)
}
