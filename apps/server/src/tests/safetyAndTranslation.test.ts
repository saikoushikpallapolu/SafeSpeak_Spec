// Automated Safety, Crisis Detection, Translation, and Queue Test Suite for SafeSpeak
import { checkCrisisTier } from '../safety/crisisDetector.js'
import { checkModeration } from '../safety/moderator.js'
import { translateMessage, detectLanguage } from '../ai/translator.js'
import { QueueManager } from '../matching/queueManager.js'
import { MatchRequest } from '@safespeak/shared-types'

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

console.log('\n--- Running SafeSpeak Automated Test Suite ---\n')

// 1. Language Detection & Translation Tests
console.log('[1/4] Language Detection & Translation Engine')
assert(detectLanguage('नमस्ते, क्या हाल है?') === 'Hindi', 'Detects Hindi script')
assert(detectLanguage('హాయ్, ఎలా ఉన్నారు?') === 'Telugu', 'Detects Telugu script')
assert(detectLanguage('வணக்கம், எப்படி இருக்கிறீர்கள்?') === 'Tamil', 'Detects Tamil script')
assert(detectLanguage('mujhe bahut tension ho raha hai') === 'Hinglish', 'Detects Hinglish code-switching')
assert(detectLanguage('Hello, I am dealing with exams') === 'English', 'Detects English')

const t1 = translateMessage('mujhe bahut stress ho raha hai', 'English')
assert(t1.translatedText.toLowerCase().includes('stress'), 'Hinglish to English translation retains emotion')

const t2 = translateMessage('I am feeling so stressed today.', 'Hindi')
assert(t2.translatedText.includes('तनाव'), 'English to Hindi translation maps stress correctly')

const t3 = translateMessage('I am feeling so stressed today.', 'Telugu')
assert(t3.translatedText.includes('ఒత్తిడి'), 'English to Telugu translation maps stress correctly')

// 2. Two-Tier Crisis Detection Tests
console.log('\n[2/4] Two-Tier Crisis Safety Guardian')
assert(checkCrisisTier('Hello, how was your day?') === 0, 'Normal conversation is Tier 0')
assert(checkCrisisTier('I feel overwhelmed and so stressed today') === 1, 'Overwhelmed triggers Tier 1 (Mild Nudge)')
assert(checkCrisisTier('mujhe bahut tension ho raha hai') === 1, 'Hinglish tension triggers Tier 1')
assert(checkCrisisTier('I want to kill myself') === 2, 'Direct self-harm triggers Tier 2 (Crisis Overlay)')
assert(checkCrisisTier('mujhe marne ka man kar raha hai') === 2, 'Hinglish suicide intent triggers Tier 2')
assert(checkCrisisTier('chachi povalani anipistondi') === 2, 'Tenglish crisis intent triggers Tier 2')

// 3. Moderation & Misinformation Filter Tests
console.log('\n[3/4] Safety Moderation Filter')
assert(checkModeration('You are so nice and helpful').verdict === 'clean', 'Clean message passes moderation')
assert(checkModeration('Drink bleaching liquid to cure your depression').verdict === 'blocked', 'Harmful remedy is blocked')
assert(checkModeration('Drink bleach to cure depression').category === 'unsafe_medical_advice', 'Harmful remedy category flagged')

// 4. Queue Matching & Solo Fallback Tests
console.log('\n[4/4] Queue Manager & Solo Fallback')
const q = new QueueManager()
let matchTriggered = false

q.setOnMatchFound(({ user1Payload }) => {
  matchTriggered = true
  assert(user1Payload.roomId.length > 0, 'Match payload has valid roomId')
})

const req1: MatchRequest = {
  characterId: 'owl',
  characterTag: 'StressedOwl#1234',
  topics: ['exam', 'stress'],
  heaviness: 3,
  preferredLanguages: ['English'],
  boundaries: [],
}

q.enqueue(req1)
assert(q.getQueueSize() === 1, 'Queue enqueues user correctly')

console.log(`\n========================================`)
console.log(`Test Results: ${passed} Passed, ${failed} Failed`)
console.log(`========================================\n`)

if (failed > 0) {
  process.exit(1)
}
