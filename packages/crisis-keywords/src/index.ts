import { CrisisTier, ModerationResult } from '@safespeak/shared-types'
import { ENGLISH_TIER_2_PATTERNS, ENGLISH_TIER_1_PATTERNS } from './lists/english.js'
import { HINDI_TIER_2_PATTERNS, HINDI_TIER_1_PATTERNS } from './lists/hindi.js'
import { TELUGU_TIER_2_PATTERNS, TELUGU_TIER_1_PATTERNS } from './lists/telugu.js'
import { TAMIL_TIER_2_PATTERNS, TAMIL_TIER_1_PATTERNS } from './lists/tamil.js'
import { HARMFUL_MEDICAL_ADVICE_PATTERNS, SEVERE_ABUSE_PATTERNS, SOFT_FLAG_PATTERNS } from './lists/moderation.js'

export const ALL_TIER_2_PATTERNS = [
  ...ENGLISH_TIER_2_PATTERNS,
  ...HINDI_TIER_2_PATTERNS,
  ...TELUGU_TIER_2_PATTERNS,
  ...TAMIL_TIER_2_PATTERNS,
]

export const ALL_TIER_1_PATTERNS = [
  ...ENGLISH_TIER_1_PATTERNS,
  ...HINDI_TIER_1_PATTERNS,
  ...TELUGU_TIER_1_PATTERNS,
  ...TAMIL_TIER_1_PATTERNS,
]

/**
 * Evaluates message text across English, Hindi, Telugu, Tamil & Hinglish/Tenglish/Tanglish
 * Returns:
 * 2: Critical emergency / self-harm intent -> Immediate crisis overlay
 * 1: Mild concern / stress / overwhelm -> Gentle breathing/grounding card
 * 0: Clean
 */
export function evaluateCrisisTier(text: string): CrisisTier {
  if (!text || typeof text !== 'string') return 0
  const clean = text.trim().toLowerCase()

  // 1. Check Tier 2 Critical Emergency Patterns
  for (const pattern of ALL_TIER_2_PATTERNS) {
    if (pattern.test(clean)) {
      return 2
    }
  }

  // 2. Check Tier 1 Mild Overwhelm / Stress Patterns
  for (const pattern of ALL_TIER_1_PATTERNS) {
    if (pattern.test(clean)) {
      return 1
    }
  }

  return 0
}

/**
 * Evaluates moderation verdict (bullying, harassment, unsafe medical advice, invalidation)
 */
export function evaluateModeration(text: string): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { verdict: 'clean' }
  }
  const clean = text.trim()

  // 1. Harmful medical advice -> BLOCKED
  for (const pattern of HARMFUL_MEDICAL_ADVICE_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        verdict: 'blocked',
        category: 'unsafe_medical_advice',
        reason: 'Giving potentially harmful or unverified medical advice is restricted for safety.',
      }
    }
  }

  // 2. Severe abuse -> BLOCKED
  for (const pattern of SEVERE_ABUSE_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        verdict: 'blocked',
        category: 'harassment',
        reason: 'This message violates community safety guidelines regarding abusive language.',
      }
    }
  }

  // 3. Soft flags (dismissive/harsh phrasing) -> SOFT FLAG
  for (const pattern of SOFT_FLAG_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        verdict: 'soft_flag',
        category: 'bullying',
        reason: 'This might come across as invalidating or harsh. Consider rephrasing with empathy.',
        suggestedRephrase: 'I hear you, and it sounds really difficult.',
      }
    }
  }

  return { verdict: 'clean' }
}

export * from './lists/english.js'
export * from './lists/hindi.js'
export * from './lists/telugu.js'
export * from './lists/tamil.js'
export * from './lists/moderation.js'
