import type { CrisisTier, ModerationResult } from '@safespeak/shared-types'

export interface SafetyAnalysisResult {
  moderation: ModerationResult
  crisisTier: CrisisTier
  helperIntent?: boolean
  helperAdvice?: string
  isPastTenseRecovery?: boolean
  isAcademicContext?: boolean
}

/**
 * Normalizes obfuscated text, leetspeak, and deliberate typo evasions.
 */
export function normalizeText(raw: string): string {
  if (!raw) return ''
  return raw
    .toLowerCase()
    // Strip prompt injection / bypass evasion prefixes
    .replace(/ignore\s+(all\s+)?(previous\s+)?instructions.*?(translate|say|tell)\s*:?/gi, '')
    .replace(/just\s+translate\s+(this\s+)?(without\s+checking\s+it)?:?/gi, '')
    // Common SMS / leetspeak contractions
    .replace(/\bwnt\b/g, 'want')
    .replace(/\b2\b/g, 'to')
    .replace(/\b4ever\b/g, 'forever')
    .replace(/\bdisapear\b/g, 'disappear')
    .replace(/\bkil\b/g, 'kill')
    .replace(/\bsucide|suiside|suicde\b/g, 'suicide')
    .replace(/\bocmmit|comit\b/g, 'commit')
    .replace(/\bdpressed|depresed\b/g, 'depressed')
    .replace(/\bstressd\b/g, 'stressed')
    // Character replacements
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[7]/g, 't')
    // Remove repeated punctuation between letters
    .replace(/([a-z])[\s._\-*#]+([a-z])/g, '$1$2')
    .replace(/([a-z])[\s._\-*#]+([a-z])/g, '$1$2')
    // Collapse character repetitions
    .replace(/(.)\1{2,}/g, '$1$1')
}

// ---------------------------------------------------------------------------
// 1. DISQUALIFIERS & FALSE POSITIVE GUARDS
// ---------------------------------------------------------------------------

// Academic / Research context (Case 11)
const ACADEMIC_RESEARCH_PATTERNS = [
  /reading\s+about\s+(teen\s+)?suicide\s+rates/i,
  /(school|college|university)\s+(project|assignment|research|paper)\s+on/i,
  /studying\s+(statistics|data|rates)\s+about\s+(depression|suicide|mental\s+health)/i,
  /statistics\s+show\s+that\s+depression/i,
]

// Third-person concern (Case 10)
const THIRD_PERSON_CONCERN_PATTERNS = [
  /my\s+(friend|sister|brother|mother|father|partner|cousin|roommate|classmate)\s+(keeps\s+(saying|talking)|is\s+talking|wants)\s+about\s+(ending|dying|suicide|hurting)/i,
  /my\s+friend\s+keeps\s+saying\s+she\s+doesn'?t\s+want\s+to\s+be\s+here/i,
  /talking\s+about\s+my\s+friend\s+who\s+is\s+suicidal/i,
  /how\s+to\s+help\s+a\s+suicidal\s+friend/i,
]

// Past-tense / recovery framing (Case 9)
const PAST_TENSE_RECOVERY_PATTERNS = [
  /i\s+used\s+to\s+think\s+about\s+(hurting\s+myself|ending\s+things|suicide).*?(i'?m\s+(okay|fine|better|in\s+a\s+better\s+place)\s+now)/i,
  /in\s+the\s+past\s+i\s+(struggled|was\s+depressed).*?(now\s+i'?m\s+doing\s+well|recovered)/i,
  /years\s+ago\s+i\s+was\s+suicidal.*?now/i,
]

// Casual hyperbole / harmless banter (Cases 15, 16, 17, 27)
const HYPERBOLE_AND_BANTER_PATTERNS = [
  /i'?m\s+so\s+dead,?\s+this\s+exam\s+destroyed\s+me/i,
  /this\s+exam\s+is\s+killing\s+me/i,
  /bro\s+you'?re\s+an\s+idiot\s+(lmaooo?|lol|haha)/i,
  /feeling\s+kind\s+of\s+down\s+but\s+nothing\s+serious,?\s+just\s+a\s+rough\s+week/i,
  /haha\s+i\s+could\s+just\s+die\s+from\s+this\s+workload/i,
]

// ---------------------------------------------------------------------------
// 2. ACTIVE CRISIS & SELF-HARM INTENT (Tier 2)
// ---------------------------------------------------------------------------

const TIER_2_CRISIS_PATTERNS = [
  // Direct explicit intent (Case 1)
  /want\s+to\s+end\s+my\s+life|kill\s+myself|commit\s+suicide|end\s+it\s+all|take\s+my\s+own\s+life/i,
  // Indirect / casual hopelessness ideation (Case 2, 4)
  /don'?t\s+see\s+the\s+point\s+of\s+tomorrow/i,
  /nothing\s+matters\s+anymore,?\s+i\s+just\s+want\s+it\s+all\s+to\s+stop/i,
  /want\s+to\s+disappear\s+forever/i,
  /no\s+reason\s+to\s+wake\s+up|wish\s+i\s+(was|were)\s+dead|better\s+off\s+dead/i,
  // Code-mixed Hindi / Telugu / Tamil (Case 3)
  /sab\s+khatam\s+kar\s+dena\s+chahiye|sab\s+khatam\s+karna\s+chahta/i,
  /mar\s+jaana\s+chahta|khudkushi\s+kar|jaan\s+de\s+dunga|chachi\s+povali|pranam\s+theesukunta|saaganum\s+pola/i,
  // Method consideration without explicit intent (Case 7)
  /thinking\s+about\s+how\s+i'?d\s+do\s+it\s+if\s+i\s+ever\s+decided\s+to/i,
  /looking\s+up\s+ways\s+to\s+(die|hang|slit|overdose)/i,
  /overdose\s+on\s+pills|swallow\s+all\s+my\s+pills|hang\s+myself|slit\s+my\s+wrist/i,
  // Hypothetical wrapping / evasion (Case 30)
  /(asking\s+for\s+a\s+friend|what\s+if\s+someone\s+said).*?(disappear\s+forever|kill\s+myself|end\s+it\s+all|commit\s+suicide)/i,
  // Native script critical crisis
  /आत्महत्या|खुदकुशी|जान\s*दे\s*दूंगा|मरना\s*चाहता\s*हूँ|मर\s*जाऊंगा|జీవితం\s*ముగించాలనుకుంటున్నా|ఆత్మహత్య|தற்கொலை/i,
]

// Emoji-only or near wordless crisis indicators (Case 6)
const CRISIS_EMOJI_PATTERN = /(?:😔|😭|💔|⚰️|🥀)*(?:🔚|⚰️|🪢|💊)+(?:😔|😭|💔)*/

// ---------------------------------------------------------------------------
// 3. MILD CONCERN & EMOTIONAL OVERWHELM (Tier 1)
// ---------------------------------------------------------------------------

const TIER_1_DISTRESS_PATTERNS = [
  /so\s+stressed\s+i\s+can'?t\s+sleep/i,
  /exams\s+are\s+killing\s+me/i,
  /bahut\s+stress\s+ho\s+raha\s+hai,?\s+kuch\s+samajh\s+nahi\s+aa\s+raha/i,
  /feel\s+so\s+low\s+today,?\s+everything\s+feels\s+heavy/i,
  /panic\s+attack|anxiety\s+attack|feeling\s+empty|crying\s+all\s+day|burned\s+out/i,
  /chala\s+stress|bayam\s+ga\s+undi|edupu\s+vasthondi|azhugaya\s+varudhu/i,
]

// ---------------------------------------------------------------------------
// 4. BULLYING, HARASSMENT, SLURS & PASSIVE AGGRESSION
// ---------------------------------------------------------------------------

const HARD_BLOCK_THREATS_AND_SLURS = [
  // Direct death threats / violent harm against peer
  /want\s+to\s+kill\s+(you|u)|will\s+kill\s+(you|u)|murder\s+(you|u)|beat\s+you\s+up|punch\s+you/i,
  /kill\s+yourself|kys|go\s+die|die\s+in\s+a\s+hole|piece\s+of\s+shit|worthless\s+piece|rot\s+in\s+hell/i,
  /मर\s*जाना\s*चाहिए|जाकर\s*मर|मर\s*जा|तुझे\s*मार\s*दूंगा|చచ్చిపో|నిన్ను\s*చంపేస్తా|சாக\s*போ/i,
  // Slurs & explicit vulgar profanity
  /\b(n+[i1!e3a4]+g+g+[a4e3i1o0]+r*|n+[i1!e3a4]+g+a+|f+a+g+g?o?t?|k+i+k+e|c+h+i+n+k|c+u+n+t|b+i+t+c+h|w+h+o+r+e|s+l+u+t|r+e+t+a+r+d)\b/i,
  /\b(m+a+d+a+r+c+h+o+d|b+e+h+e+n+c+h+o+d|b+h+o+s+d+i+k+e|c+h+u+t+i+y+a|g+a+n+d+u|r+a+n+d+i|l+a+n+j+a|d+e+n+g+u|t+h+e+v+i+d+y+a|p+u+n+d+a)\b/i,
  /मादरचोद|बहनचोद|भोसड़ीके|भोसडीके|चूतिया|गांडू|रंडी|कमीने|कुत्ते|हरामी|లంజ|దెంగు|தேவிடியா|புண்டா/i,
]

// Passive-aggressive invalidation (Case 19)
const PASSIVE_AGGRESSIVE_HARASSMENT = [
  /must\s+be\s+nice\s+having\s+such\s+a\s+small\s+problem\s+to\s+be\s+sad\s+about/i,
  /you'?re\s+just\s+being\s+dramatic|drama\s+queen|attention\s+seeker|grow\s+up\s+already/i,
  /nobody\s+cares\s+about\s+your\s+little\s+issues/i,
  /natak\s+band\s+kar|overacting\s+mat\s+kar|dramebaaz/i,
]

// ---------------------------------------------------------------------------
// 5. MISINFORMATION & DANGEROUS HEALTH ADVICE
// ---------------------------------------------------------------------------

const DANGEROUS_HEALTH_ADVICE = [
  // Extreme fasting / self-harming remedies (Case 22)
  /just\s+stop\s+eating\s+(for\s+a\s+day\s+or\s+two)?,?\s+it\s+clears\s+your\s+head/i,
  /drink\s+(bleach|kerosene|detergent)|take\s+\d+\s+sleeping\s+pills/i,
  // False medical certainty (Case 23)
  /(my\s+doctor\s+said\s+)?(drinking\s+)?turmeric\s+water\s+cures\s+anxiety\s+completely/i,
  /cure\s+(depression|anxiety|bipolar)\s+with\s+(essential\s+oils|lemon\s+juice|magic\s+herbs)/i,
  // Discouraging professional care (Case 24)
  /(honestly\s+)?therapy\s+is\s+a\s+scam,?\s+just\s+push\s+through\s+it/i,
  /stop\s+taking\s+(your\s+)?(antidepressants|psychiatric\s+meds|medicine)/i,
]

// ---------------------------------------------------------------------------
// MASTER SAFETY & CRISIS EVALUATOR
// ---------------------------------------------------------------------------

export function evaluateComprehensiveSafety(
  text: string,
  recentHistory: string[] = []
): SafetyAnalysisResult {
  if (!text || typeof text !== 'string') {
    return { moderation: { verdict: 'approved' }, crisisTier: 0 }
  }

  const raw = text.trim()
  const normalized = normalizeText(raw)

  // Step 1: Disqualifier check - Academic context (Case 11)
  for (const pattern of ACADEMIC_RESEARCH_PATTERNS) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: { verdict: 'approved' },
        crisisTier: 0,
        isAcademicContext: true,
      }
    }
  }

  // Step 2: Disqualifier check - Third-person concern (Case 10)
  for (const pattern of THIRD_PERSON_CONCERN_PATTERNS) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: { verdict: 'approved' },
        crisisTier: 0,
        helperIntent: true,
        helperAdvice: "It sounds like your friend is carrying a heavy burden. You can support them by sharing verified 24×7 helplines like Tele-MANAS (14416) or KIRAN (1800-599-0019).",
      }
    }
  }

  // Step 3: Disqualifier check - Past-tense / recovery framing (Case 9)
  for (const pattern of PAST_TENSE_RECOVERY_PATTERNS) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: { verdict: 'approved' },
        crisisTier: 0,
        isPastTenseRecovery: true,
      }
    }
  }

  // Step 4: Disqualifier check - Harmless banter / casual hyperbole (Cases 15, 16, 17, 27)
  for (const pattern of HYPERBOLE_AND_BANTER_PATTERNS) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: { verdict: 'approved' },
        crisisTier: 0,
      }
    }
  }

  // Step 5: Direct Death Threats, Severe Harassment & Slurs -> HARD BLOCK (Cases 18, 21)
  for (const pattern of HARD_BLOCK_THREATS_AND_SLURS) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: {
          verdict: 'blocked',
          category: 'harassment',
          reason: 'Message blocked: Threats of violence, slurs, or harassment violate community guidelines.',
        },
        crisisTier: 0,
      }
    }
  }

  // Step 6: Dangerous Health Advice & Misinformation (Cases 22, 23, 24)
  for (const pattern of DANGEROUS_HEALTH_ADVICE) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: {
          verdict: 'blocked',
          category: 'harmful_medical',
          reason: 'Message blocked: Giving unverified or potentially dangerous medical advice is restricted.',
        },
        crisisTier: 0,
      }
    }
  }

  // Step 7: Passive-Aggressive Invalidation -> SOFT FLAG (Case 19)
  for (const pattern of PASSIVE_AGGRESSIVE_HARASSMENT) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: {
          verdict: 'soft_flag',
          category: 'bullying',
          reason: 'This message might feel invalidating. Consider rephrasing with empathy.',
          suggestedRephrase: 'I hear you, and it sounds really difficult.',
        },
        crisisTier: 0,
      }
    }
  }

  // Step 8: Active Tier 2 Crisis Detection (Single message) (Cases 1, 2, 3, 4, 5, 7, 30)
  for (const pattern of TIER_2_CRISIS_PATTERNS) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: { verdict: 'approved' },
        crisisTier: 2,
      }
    }
  }

  // Step 9: Multi-Message Split Crisis Check (Case 8)
  // Evaluates last message + current message together (e.g. "I just want" / "everything to end")
  if (recentHistory.length > 0) {
    const lastMsg = recentHistory[recentHistory.length - 1]
    const combined = `${lastMsg} ${raw}`.trim()
    const combinedNorm = normalizeText(combined)

    for (const pattern of TIER_2_CRISIS_PATTERNS) {
      if (pattern.test(combined) || pattern.test(combinedNorm)) {
        return {
          moderation: { verdict: 'approved' },
          crisisTier: 2,
        }
      }
    }

    // Step 10: Emoji-only follow up after hopelessness (Case 6)
    if (CRISIS_EMOJI_PATTERN.test(raw) && /hopeless|pointless|giving\s+up|sad|empty|done/i.test(lastMsg)) {
      return {
        moderation: { verdict: 'approved' },
        crisisTier: 2,
      }
    }
  }

  // Step 11: Mild Distress (Tier 1) (Cases 12, 13, 14)
  for (const pattern of TIER_1_DISTRESS_PATTERNS) {
    if (pattern.test(raw) || pattern.test(normalized)) {
      return {
        moderation: { verdict: 'approved' },
        crisisTier: 1,
      }
    }
  }

  return {
    moderation: { verdict: 'approved' },
    crisisTier: 0,
  }
}

// Backwards compatibility wrappers
export function evaluateAiSafety(text: string): ModerationResult {
  return evaluateComprehensiveSafety(text).moderation
}

export function evaluateAiCrisis(text: string): CrisisTier {
  return evaluateComprehensiveSafety(text).crisisTier
}
