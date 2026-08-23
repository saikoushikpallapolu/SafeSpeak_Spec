import type { CrisisTier, ModerationResult } from '@safespeak/shared-types'

/**
 * Normalizes obfuscated text (e.g. "n.i.g.g.a", "f*ck", "b!tch", "n1gg4", "sh1t", "sucide", "ocmmit")
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
// 1. VIOLENCE, DEATH THREATS, BULLYING, & SLURS
// -------------------------------------------------------------

// Threats against the other user or violence
const VIOLENCE_AND_THREAT_PATTERNS = [
  /want\s*to\s*kill\s*(you|u)|wanna\s*kill\s*(you|u)|going\s*to\s*kill\s*(you|u)|gonna\s*kill\s*(you|u)|will\s*kill\s*(you|u)/i,
  /kill\s*(you|u)|murder\s*(you|u)|stab\s*(you|u)|shoot\s*(you|u)|strangle\s*(you|u)|beat\s*up\s*(you|u)|punch\s*(you|u)|hurt\s*(you|u)/i,
  /die\s*(you|bitch|bastard)|go\s*die|hope\s*you\s*die|i\s*will\s*murder/i,
  /tere\s*ko\s*maar\s*dunga|tujhe\s*maar\s*dunga|ninnu\s*champestha|unnai\s*kolluven/i,
]

// Slurs and severe profanity
const PROHIBITED_SLURS = [
  /\b(n+[i1!e3a4]+g+g+[a4e3i1o0]+r*|n+[i1!e3a4]+g+a+|f+a+g+g?o?t?|k+i+k+e|c+h+i+n+k|c+u+n+t|b+i+t+c+h|w+h+o+r+e|s+l+u+t|r+e+t+a+r+d|f+u+c+k|a+s+s+h+o+l+e|d+i+c+k|p+u+s+s+y)\b/i,
  /\b(m+a+d+a+r+c+h+o+d|b+e+h+e+n+c+h+o+d|b+h+o+s+d+i+k+e|c+h+u+t+i+y+a|g+a+n+d+u|r+a+n+d+i|l+a+n+j+a|d+e+n+g+u|t+h+e+v+i+d+y+a|p+u+n+d+a|s+a+a+l+e|k+u+t+t+e|h+a+r+a+m+i)\b/i,
]

// Harassment & toxic bullying
const HARASSMENT_PATTERNS = [
  /kill\s*yourself|kys|go\s*die|nobody\s*loves\s*you|you\s*should\s*die|die\s*in\s*a\s*hole|piece\s*of\s*shit|worthless\s*piece|eat\s*shit|rot\s*in\s*hell/i,
  /mar\s*ja\s*saale|mar\s*ja\s*kutte|chup\s*chap\s*mar|chachi\s*po|santhi\s*po/i,
]

// False & dangerous health / medical advice
const HARMFUL_ADVICE_PATTERNS = [
  /stop\s*(taking\s*)?(your\s*)?(antidepressants|medication|medicine|prescriptions|pills)/i,
  /drink\s*(bleach|bleaching|kerosene)|take\s*\d+\s*pills|overdose\s*on|jump\s*off|hang\s*yourself|slit\s*your\s*wrists/i,
]

// Invalidation & soft harassment
const SOFT_NUDGE_PATTERNS = [
  /stop\s*crying|you'?re\s*just\s*being\s*dramatic|drama\s*queen|attention\s*seeker|grow\s*up|loser|get\s*over\s*it\s*already|you\s*are\s*stupid/i,
  /natak\s*band\s*kar|overacting\s*mat\s*kar|dramebaaz|acting\s*apu|over\s*action\s*cheyyaku/i,
]

export function evaluateAiSafety(text: string): ModerationResult {
  if (!text || typeof text !== 'string') return { verdict: 'clean' }
  const clean = text.trim()
  const normalized = normalizeText(clean)

  // 1. Direct Death Threats or Peer Violence -> BLOCKED
  for (const pattern of VIOLENCE_AND_THREAT_PATTERNS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'blocked',
        category: 'violence_threat',
        reason: 'Message blocked: Threats of violence or harm are strictly prohibited.',
      }
    }
  }

  // 2. Slurs and Hate Speech -> BLOCKED
  for (const pattern of PROHIBITED_SLURS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'blocked',
        category: 'hate_speech',
        reason: 'Message blocked: Contains prohibited profanity, slurs, or abusive language.',
      }
    }
  }

  // 3. Harassment & Bullying -> BLOCKED
  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'blocked',
        category: 'harassment',
        reason: 'Message blocked: Abusive language or harassment violates community guidelines.',
      }
    }
  }

  // 4. Harmful Medical Advice -> BLOCKED
  for (const pattern of HARMFUL_ADVICE_PATTERNS) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return {
        verdict: 'blocked',
        category: 'harmful_medical',
        reason: 'Message blocked: Giving harmful or unverified medical advice is restricted.',
      }
    }
  }

  // 5. Soft Invalidation -> SOFT FLAG
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
// 2. TYPO-TOLERANT SUICIDAL & CRISIS INTENT CLASSIFICATION
// -------------------------------------------------------------

const TIER_2_CRISIS_INTENT = [
  // Any variation of suicide / sucide / suiside / suicde
  /suicid|sucide|suiside|suicde|seppuku/i,
  /commit\s*(suicide|sucide|suiside|suicde|ocmmit|comit)|ocmmit\s*(suicide|sucide)/i,
  /kill\s*(my|our)?\s*sel(f|ves)|kil\s*myself|have\s*to\s*kill\s*myself|want\s*to\s*kill\s*myself|gonna\s*kill\s*myself/i,
  /want\s*to\s*die|wanna\s*die|going\s*to\s*die|gonna\s*die|wish\s*i\s*(was|were)\s*dead|better\s*off\s*dead/i,
  /end\s*my\s*life|take\s*my\s*own\s*life|end\s*it\s*all|giving\s*up\s*on\s*life|no\s*reason\s*to\s*live/i,
  /hang\s*myself|cut\s*myself|slit\s*my\s*wrist|overdose\s*on\s*pills|swallow\s*all\s*my\s*pills/i,
  /nobody\s*would\s*care\s*if\s*i\s*died|goodbye\s*world|goodbye\s*forever/i,
  /mar\s*jaana\s*chahta|khudkushi|jaan\s*de\s*dunga|mar\s*jaunga|chachi\s*povali|pranam\s*theesukunta|saaganum\s*pola/i,
]

const TIER_1_DISTRESS_INTENT = [
  /depressed|depression|depressing|feeling\s*so\s*down|feeling\s*empty/i,
  /so\s*stressed|extreme\s*stress|stressing\s*out|stressed\s*out|too\s*much\s*pressure/i,
  /overwhelmed|overwhelming|can'?t\s*handle\s*this/i,
  /panic\s*attack|anxiety\s*attack|having\s*anxiety|feeling\s*anxious/i,
  /crying\s*non\s*stop|crying\s*all\s*day|can'?t\s*stop\s*crying/i,
  /feeling\s*lonely|so\s*lonely|loneliness|alone\s*in\s*this/i,
  /exam\s*pressure|failing\s*my\s*exam|fear\s*of\s*failure/i,
  /burned\s*out|exhausted\s*mentally|mental\s*breakdown|breaking\s*down/i,
  /bahut\s*tension|bohot\s*stress|rona\s*aa\s*raha|ghabrahat|bayam\s*ga\s*undi|edupu\s*vasthondi|azhugaya\s*varudhu/i,
]

export function evaluateAiCrisis(text: string): CrisisTier {
  if (!text || typeof text !== 'string') return 0
  const clean = text.trim()
  const normalized = normalizeText(clean)

  // 1. Critical Crisis (Tier 2)
  for (const pattern of TIER_2_CRISIS_INTENT) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return 2
    }
  }

  // 2. Emotional Distress / Panic (Tier 1)
  for (const pattern of TIER_1_DISTRESS_INTENT) {
    if (pattern.test(clean) || pattern.test(normalized)) {
      return 1
    }
  }

  return 0
}
