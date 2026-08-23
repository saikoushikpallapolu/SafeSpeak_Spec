import type { CrisisTier, ModerationResult } from '@safespeak/shared-types'

/**
 * Normalizes obfuscated text (e.g. "n.i.g.g.a", "f*ck", "b!tch", "n1gg4", "sh1t")
 * into canonical lowercase form for robust AI intent matching.
 */
export function normalizeText(raw: string): string {
  if (!raw) return ''
  return raw
    .toLowerCase()
    // Replace common leetspeak characters
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[7]/g, 't')
    // Remove repeated punctuation/spaces between letters (e.g. "f.u.c.k" -> "fuck")
    .replace(/([a-z])[\s._\-*#]+([a-z])/g, '$1$2')
    .replace(/([a-z])[\s._\-*#]+([a-z])/g, '$1$2')
    // Collapse character repetitions (e.g. "fuuuck" -> "fuck", "niiiigga" -> "nigga")
    .replace(/(.)\1{2,}/g, '$1$1')
}

// -------------------------------------------------------------
// 1. AI VULGARITY & HATE SPEECH CLASSIFICATION
// -------------------------------------------------------------

const PROHIBITED_SLURS = [
  /\b(n+i+g+g+[aeiou]+r*|n+i+g+a+|f+a+g+g?o?t?|k+i+k+e|c+h+i+n+k|c+u+n+t|b+i+t+c+h|w+h+o+r+e|s+l+u+t|r+e+t+a+r+d|f+u+c+k|a+s+s+h+o+l+e|d+i+c+k|p+u+s+s+y)\b/i,
  /\b(m+a+d+a+r+c+h+o+d|b+e+h+e+n+c+h+o+d|b+h+o+s+d+i+k+e|c+h+u+t+i+y+a|g+a+n+d+u|r+a+n+d+i|l+a+n+j+a|d+e+n+g+u|t+h+e+v+i+d+y+a|p+u+n+d+a|s+a+a+l+e|k+u+t+t+e|h+a+r+a+m+i)\b/i,
]

const HARASSMENT_PATTERNS = [
  /\b(kill yourself|kys|go die|nobody loves you|you should die|die in a hole|piece of shit|worthless piece|eat shit|rot in hell)\b/i,
  /\b(mar ja saale|mar ja kutte|chup chap mar|chachi po|santhi po)\b/i,
]

const HARMFUL_ADVICE_PATTERNS = [
  /\b(stop (taking\s+)?(your\s+)?(antidepressants|medication|medicine|prescriptions|pills))\b/i,
  /\b(drink (bleach|bleaching|kerosene)|take \d+ pills|overdose on|jump off|hang yourself|slit your wrists)\b/i,
]

const SOFT_NUDGE_PATTERNS = [
  /\b(stop crying|you'?re just being dramatic|drama queen|attention seeker|grow up|loser|get over it already|you are stupid)\b/i,
  /\b(natak band kar|overacting mat kar|dramebaaz|acting apu|over action cheyyaku)\b/i,
]

export function evaluateAiSafety(text: string): ModerationResult {
  if (!text || typeof text !== 'string') return { verdict: 'clean' }
  const clean = text.trim()
  const normalized = normalizeText(clean)

  // Check slurs and hate speech
  for (const pattern of PROHIBITED_SLURS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'blocked',
        category: 'hate_speech',
        reason: 'Message blocked: Contains prohibited profanity, slurs, or abusive language.',
      }
    }
  }

  // Check harassment & threats
  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'blocked',
        category: 'harassment',
        reason: 'Message blocked: Abusive language or harassment violates community guidelines.',
      }
    }
  }

  // Check harmful medical advice
  for (const pattern of HARMFUL_ADVICE_PATTERNS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'blocked',
        category: 'harmful_medical',
        reason: 'Message blocked: Giving harmful or unverified medical advice is restricted.',
      }
    }
  }

  // Check soft invalidation
  for (const pattern of SOFT_NUDGE_PATTERNS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'soft_flag',
        category: 'bullying',
        reason: 'This message might feel invalidating. Consider rephrasing with empathy.',
        suggestedRephrase: 'I hear you, and it sounds really difficult.',
      }
    }
  }

  return { verdict: 'approved' }
}

// -------------------------------------------------------------
// 2. AI SUICIDAL & CRISIS INTENT CLASSIFICATION
// -------------------------------------------------------------

const TIER_2_CRISIS_INTENT = [
  /\b(want to|wanna|going to|gonna)\s+(die|end it all|kill myself|hang myself|cut myself)\b/i,
  /\b(suicide|suicidal|end my life|take my own life)\b/i,
  /\b(no reason to live|better off dead|wish i was dead|wish i were dead)\b/i,
  /\b(giving up on life|can'?t go on anymore|want to disappear forever)\b/i,
  /\b(goodbye world|final goodbye|goodbye forever)\b/i,
  /\b(overdose on|slit my wrists|jump off a|swallow all my pills)\b/i,
  /\b(nobody would care if i died|everyone better without me)\b/i,
  /\b(mar jaana chahta|khudkushi|jaan de dunga|mar jaunga|chachi povali|pranam theesukunta|saaganum pola irukku)\b/i,
]

const TIER_1_DISTRESS_INTENT = [
  /\b(so stressed|extreme stress|stressing out|stressed out)\b/i,
  /\b(overwhelmed|overwhelming|can'?t handle this|too much pressure)\b/i,
  /\b(panic attack|anxiety attack|having anxiety|feeling anxious)\b/i,
  /\b(crying non stop|crying all day|can'?t stop crying)\b/i,
  /\b(feeling so down|feeling empty|feeling lonely|so lonely)\b/i,
  /\b(exam pressure|failing my exam|fear of failure)\b/i,
  /\b(burned out|exhausted mentally|mental breakdown|breaking down)\b/i,
  /\b(bahut tension|bohot stress|rona aa raha|ghabrahat|bayam ga undi|edupu vasthondi|azhugaya varudhu)\b/i,
]

export function evaluateAiCrisis(text: string): CrisisTier {
  if (!text || typeof text !== 'string') return 0
  const clean = text.trim()
  const normalized = normalizeText(clean)

  for (const pattern of TIER_2_CRISIS_INTENT) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return 2
    }
  }

  for (const pattern of TIER_1_DISTRESS_INTENT) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return 1
    }
  }

  return 0
}
