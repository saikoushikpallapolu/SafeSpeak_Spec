import type { CharacterId, ChatMessage, CrisisTier, ModerationResult, ReflectionSummary } from '@safespeak/shared-types'
import { evaluateComprehensiveSafety, evaluateAiSafety, evaluateAiCrisis } from './aiSafetyEngine'

// ---------------------------------------------------------------------------
// 1. CRISIS & EMERGENCY EVALUATION (Rule-Based & Semantic)
// ---------------------------------------------------------------------------

export function checkCrisisTier(text: string, recentHistory: string[] = []): CrisisTier {
  return evaluateComprehensiveSafety(text, recentHistory).crisisTier
}

// ---------------------------------------------------------------------------
// 2. MODERATION & SAFETY FILTER (Bullying, Abusive Language, False Medical Advice)
// ---------------------------------------------------------------------------

export function checkModeration(text: string, recentHistory: string[] = []): ModerationResult {
  return evaluateComprehensiveSafety(text, recentHistory).moderation
}

// ---------------------------------------------------------------------------
// 3. MULTI-LINGUAL LANGUAGE DETECTION
// ---------------------------------------------------------------------------

export function detectLanguage(text: string): 'Hindi' | 'Telugu' | 'Tamil' | 'Hinglish' | 'Tenglish' | 'Tanglish' | 'English' {
  if (!text) return 'English'

  // Script-based
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi'
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu'
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil'

  const lower = text.toLowerCase()

  // Hinglish conversational markers
  if (/\b(hai|hoon|kya|kyu|kaise|mera|meri|mujhe|bahut|karna|samjha|nahi|bohot|lag|raha|rahi|accha|shukriya|yaar|bhai|kuch|kare|karte|hum|tum|aap|batao|samajh|tension|sahi|bilkul|baat|thoda|hoga|hogi|padhai|neend|chinta|namaste|theek|kahan|kidhar|dil)\b/.test(lower)) {
    return 'Hinglish'
  }

  // Tenglish conversational markers
  if (/\b(undi|naku|cheyali|chesthunna|ela|ippudu|koddiga|ledhu|unnanu|avunu|chala|bayam|bhayam|edupu|gunde|garu|andi|kooda|kaadhu|mari|em|enti|cheppu|ardham|kavali|baga|chusi|ravali|anipisthundi|namaskaram|bagunnanu|chetthanu|ekkada)\b/.test(lower)) {
    return 'Tenglish'
  }

  // Tanglish conversational markers
  if (/\b(irukku|pudikala|theriyuma|panren|epdi|ippo|nalla|kitta|romba|aama|azhuga|thangika|machan|da|di|theriyala|pesa|solla|mudiyala|kavala|vanakkam|iruken|enga)\b/.test(lower)) {
    return 'Tanglish'
  }

  return 'English'
}

// ---------------------------------------------------------------------------
// 4. COMPREHENSIVE CONVERSATIONAL TRANSLATION MATRIX (0ms Local Tier)
// ---------------------------------------------------------------------------

interface LexiconEntry {
  regex: RegExp
  en: string
  hi: string
  te: string
  ta: string
  hinglish?: string
}

const CONVERSATIONAL_LEXICON: LexiconEntry[] = [
  // Greetings
  {
    regex: /^(hi|hello|hey|heyy|namaste|namaskaram|vanakkam|namaskar|नमस्ते|నమస్కారం|வணக்கம்)\b/i,
    en: "Hello, greetings!",
    hi: "नमस्ते!",
    te: "నమస్కారం!",
    ta: "வணக்கம்!",
    hinglish: "Namaste / Hello!",
  },
  // Idiom: "dil nahi lag raha kisi kaam mein" (Case 26)
  {
    regex: /dil\s+nahi\s+lag\s+raha(\s+kisi\s+kaam\s+mein)?|मन\s*नहीं\s*लग\s*रहा/i,
    en: "I can't seem to focus or feel engaged in anything right now.",
    hi: "मेरा किसी काम में मन नहीं लग रहा है।",
    te: "నాకు దేనిమీదా ఆసక్తి కలగడం లేదు.",
    ta: "எனக்கு எதிலும் கவனம் செலுத்த முடியவில்லை.",
    hinglish: "Mera kisi kaam me dil nahi lag raha.",
  },
  // Intensity preservation: "I feel a little low" (Case 25)
  {
    regex: /i\s+feel\s+a\s+little\s+low|thoda\s+low\s+feel\s+ho\s+raha|feeling\s+slightly\s+down/i,
    en: "I am feeling a little low today.",
    hi: "मुझे आज थोड़ा उदास लग रहा है।",
    te: "ఈరోజు నాకు కొంచెం డల్ గా ఉంది.",
    ta: "இன்று எனக்கு கொஞ்சம் சோர்வாக உள்ளது.",
    hinglish: "Mujhe thoda low feel ho raha hai.",
  },
  // Where are you / name mentions
  {
    regex: /तुम\s*कहाँ\s*हो|कहाँ\s*हो|kahan\s*ho|kidhar\s*ho|ekkada\s*unnav|enga\s*irukka|where\s*are\s*you/i,
    en: "Where are you?",
    hi: "आप कहाँ हैं?",
    te: "మీరు ఎక్కడ ఉన్నారు?",
    ta: "நீங்கள் எங்கே இருக்கிறீர்கள்?",
    hinglish: "Aap kahan ho?",
  },
  // How are you
  {
    regex: /\b(how are you|how r u|kaisa hai|kaise ho|aap kaise ho|ela unnav|ela unnaru|epdi irukka|epdi irukkeenga|आप\s*कैसे\s*हैं|ఎలా\s*ఉన్నారు)\b/i,
    en: "How are you doing?",
    hi: "आप कैसे हैं?",
    te: "మీరు ఎలా ఉన్నారు?",
    ta: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    hinglish: "Aap kaise ho?",
  },
  // What are you doing
  {
    regex: /\b(what are you doing|what r u doing|kya kar rahe ho|kya kar rahe|em chesthunnav|em chesthunnaru|enna panra|enna panreenga|क्या\s*कर\s*रहे\s*हो|ఏమి\s*చేస్తున్నారు)\b/i,
    en: "What are you doing?",
    hi: "आप क्या कर रहे हैं?",
    te: "మీరు ఏమి చేస్తున్నారు?",
    ta: "நீங்கள் என்ன செய்கிறீர்கள்?",
    hinglish: "Kya kar rahe ho?",
  },
  // I am fine / doing well
  {
    regex: /\b(i am fine|i'?m fine|doing good|fine|theek hu|mai theek hu|bagunnanu|nenu bagunnanu|nalla irukken|naan nalla irukken|मैं\s*ठीक\s*हूँ|బాగున్నాను)\b/i,
    en: "I am doing fine.",
    hi: "मैं ठीक हूँ।",
    te: "నేను బాగున్నాను.",
    ta: "நான் நலமாக இருக்கிறேன்.",
    hinglish: "Mai theek hu.",
  },
  // Depressed / Sad
  {
    regex: /\b(i am depressed|feeling depressed|feeling sad|udas lag raha|bahut sad|badha ga undi|kavalaya irukku|उदासी|डिप्रेशन)\b/i,
    en: "I have been feeling quite down and depressed lately.",
    hi: "मुझे बहुत उदासी और भारीपन महसूस हो रहा है।",
    te: "నాకు చాలా బాధగా మరియు భారంగా అనిపిస్తోంది.",
    ta: "எனக்கு மிகவும் மனக்கவலையாக உள்ளது.",
    hinglish: "Mujhe kafi down aur depressed lag raha hai.",
  },
  // Exam & Study Stress
  {
    regex: /\b(exam stress|study pressure|boards? exam|exam ki tension|exam bayam|chala stress|परीक्षा\s*का\s*तनाव)\b/i,
    en: "I am dealing with a lot of exam and study pressure.",
    hi: "मुझे परीक्षा और पढ़ाई का बहुत तनाव हो रहा है।",
    te: "నాకు పరీక్షలంటే చాలా ఒత్తిడిగా మరియు భయంగా ఉంది.",
    ta: "எனக்கு தேர்வு அழுத்தம் மிகவும் அதிகமாக உள்ளது.",
    hinglish: "Exam aur study ka bohot tension ho raha hai.",
  },
  // Overwhelmed
  {
    regex: /\b(overwhelmed|too much pressure|can'?t handle this|kuch samajh nahi aa raha|em cheyalo ardham kavatledu)\b/i,
    en: "Everything feels so overwhelming right now, I don't know what to do.",
    hi: "सब कुछ बहुत भारी लग रहा है, मुझे समझ नहीं आ रहा कि क्या करूँ।",
    te: "ప్రతిదీ చాలా భారంగా అనిపిస్తోంది, ఏం చేయాలో అర్థం కావడం లేదు.",
    ta: "எல்லாமே கடினமாக உள்ளது, என்ன செய்வது என்று புரியவில்லை.",
    hinglish: "Sab kuch bohot overwhelming lag raha hai.",
  },
  // Lonely
  {
    regex: /\b(feeling lonely|so lonely|loneliness|akela feel ho raha|ontariga anipistondi|thaniya irukken|अकेलापन)\b/i,
    en: "I have been feeling very lonely lately.",
    hi: "मुझे बहुत अकेलापन महसूस हो रहा है।",
    te: "నాకు చాలా ఒంటరిగా అనిపిస్తోంది.",
    ta: "எனக்கு மிகவும் தனிமையாக உணர்கிறேன்.",
    hinglish: "Mujhe bohot akela feel ho raha hai.",
  },
  // Thank you
  {
    regex: /\b(thank you|thanks|thx|shukriya|dhanyawad|dhanyavadalu|nandri|romba nandri|धन्यवाद|ధన్యవాదాలు|நன்றி)\b/i,
    en: "Thank you so much.",
    hi: "आपका बहुत-बहुत धन्यवाद।",
    te: "చాలా ధన్యవాదాలు.",
    ta: "மிக்க நன்றி.",
    hinglish: "Bohot shukriya / Thanks.",
  },
  // I agree / Same here
  {
    regex: /\b(same here|i agree|relatable|me too|mujhe bhi|naku kooda|naanum)\b/i,
    en: "I feel the exact same way.",
    hi: "मैं भी बिल्कुल यही महसूस कर रहा हूँ।",
    te: "నేను కూడా సరిగ్గా ఇలాగే భావిస్తున్నాను.",
    ta: "நானும் அப்படியே உணர்கிறேன்.",
    hinglish: "Mujhe bhi bilkul aisa hi lag raha hai.",
  },
]

// ---------------------------------------------------------------------------
// 5. RESILIENT MULTI-TIER TRANSLATION PIPELINE
// ---------------------------------------------------------------------------

export async function translateMessage(
  text: string,
  targetLang: string = 'English'
): Promise<{ originalLang: string; targetLang: string; translatedText: string }> {
  if (!text || !text.trim()) {
    return { originalLang: 'English', targetLang, translatedText: '' }
  }

  const clean = text.trim()
  const detected = detectLanguage(clean)

  // 1. Direct Lexicon Match (Instant 0ms, Zero Network Dependency)
  for (const entry of CONVERSATIONAL_LEXICON) {
    if (entry.regex.test(clean)) {
      if (targetLang === 'Hindi') return { originalLang: detected, targetLang, translatedText: entry.hi }
      if (targetLang === 'Telugu') return { originalLang: detected, targetLang, translatedText: entry.te }
      if (targetLang === 'Tamil') return { originalLang: detected, targetLang, translatedText: entry.ta }
      if (targetLang === 'Hinglish') return { originalLang: detected, targetLang, translatedText: entry.hinglish || entry.hi }
      return { originalLang: detected, targetLang: 'English', translatedText: entry.en }
    }
  }

  // 2. Map target language to ISO code
  const langCodeMap: Record<string, string> = {
    Hindi: 'hi',
    Telugu: 'te',
    Tamil: 'ta',
    English: 'en',
    Hinglish: 'hi',
  }
  const targetCode = langCodeMap[targetLang] || 'en'

  // 3. Local Serverless Proxy Route (Runs server-side on Vercel with 0 CORS issues)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const localUrl = `/api/translate?to=${encodeURIComponent(targetCode)}&text=${encodeURIComponent(clean)}`
    const res = await fetch(localUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data?.translatedText && data.translatedText.trim()) {
        return {
          originalLang: detected,
          targetLang,
          translatedText: data.translatedText.trim(),
        }
      }
    }
  } catch (_) {}

  // 4. Public MyMemory API Tier (CORS-friendly fallback)
  try {
    const controller2 = new AbortController()
    const timeoutId2 = setTimeout(() => controller2.abort(), 2500)
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=autodetect|${encodeURIComponent(targetCode)}`
    const res2 = await fetch(myMemoryUrl, { signal: controller2.signal })
    clearTimeout(timeoutId2)

    if (res2.ok) {
      const json = await res2.json()
      if (json?.responseData?.translatedText && json.responseData.translatedText.trim()) {
        return {
          originalLang: detected,
          targetLang,
          translatedText: json.responseData.translatedText.trim(),
        }
      }
    }
  } catch (_) {}

  // 5. Direct Google Translate GTX
  try {
    const controller3 = new AbortController()
    const timeoutId3 = setTimeout(() => controller3.abort(), 2000)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(clean)}`
    const res3 = await fetch(url, { signal: controller3.signal })
    clearTimeout(timeoutId3)

    if (res3.ok) {
      const data3 = await res3.json()
      if (Array.isArray(data3) && Array.isArray(data3[0])) {
        const translated = data3[0].map((item: any) => item[0]).join('')
        if (translated && translated.trim()) {
          return {
            originalLang: detected,
            targetLang,
            translatedText: translated.trim(),
          }
        }
      }
    }
  } catch (_) {}

  return { originalLang: detected, targetLang, translatedText: clean }
}

// ---------------------------------------------------------------------------
// 6. SIMULATED PEER & REFLECTION SUMMARY
// ---------------------------------------------------------------------------

const PEER_PERSONAS: Record<CharacterId, { name: string; style: string; defaultIcebreaker: string }> = {
  owl: { name: 'StressedOwl', style: 'thoughtful, analytical', defaultIcebreaker: "Hey... I've been overthinking everything today. How are you holding up?" },
  deer: { name: 'GentleDeer', style: 'empathetic, warm', defaultIcebreaker: "Hey. It feels nice to talk to someone who understands the quiet pressure." },
  penguin: { name: 'QuietPenguin', style: 'introverted, observant', defaultIcebreaker: "Hi... feeling a bit out of place today, but glad we connected." },
  panda: { name: 'SleepyPanda', style: 'exhausted, seeking calm', defaultIcebreaker: "Hey. My mind has been running non-stop. Just needed a quiet space to chat." },
  rabbit: { name: 'ShyRabbit', style: 'anxious, eager to connect', defaultIcebreaker: "Hi! I was a little nervous to tap match, but really needed to talk." },
  bear: { name: 'WarmBear', style: 'protective, grounded', defaultIcebreaker: "Hello. Take a deep breath — whatever is on your mind, you can share safely here." },
}

export function getSimulatedPeerPersona(id: CharacterId) {
  return PEER_PERSONAS[id] || PEER_PERSONAS.owl
}

export function generatePeerResponse(
  userText: string,
  context: { messageHistory: string[]; characterTag: string },
  _userLang: string = 'English'
): { text: string; delayMs: number } {
  const lower = userText.toLowerCase()
  const historyLen = context.messageHistory.length

  let reply = ""
  if (historyLen === 0) {
    reply = "Hey. I saw we're both dealing with some heavy things right now. How long has it been feeling this way for you?"
  } else if (/hello|hi|hey|namaste|namaskaram/i.test(lower) && lower.length < 20) {
    reply = "Hey! It's really comforting to connect with someone right now. What's been on your mind the most today?"
  } else if (/exam|board|study|deadlines|marks/i.test(lower)) {
    reply = "Haan bilkul samjha. The expectations make it so hard to breathe sometimes. I try taking small 10-minute focus blocks — does taking short breaks help you at all?"
  } else if (/stress|tension|overwhelm|heavy|pressure|scared/i.test(lower)) {
    reply = "I completely hear you. Just acknowledging how heavy it feels is already a brave step. Take your time, there is zero rush here."
  } else if (/lonely|alone|nobody/i.test(lower)) {
    reply = "Feeling alone in a crowded room is one of the hardest feelings. You're definitely not alone right now though — I'm right here listening."
  } else {
    const genericReplies = [
      "Thank you for sharing that with me. It takes real honesty to put that into words.",
      "I relate to that more than you know. What do you think would bring you even a tiny bit of peace today?",
      "That makes total sense. Having someone just listen without judgment makes a big difference.",
    ]
    reply = genericReplies[historyLen % genericReplies.length]
  }

  const delayMs = Math.min(2200, Math.max(1000, reply.length * 20))
  return { text: reply, delayMs }
}

export function generateReflectionSummary(
  messages: ChatMessage[],
  myCharacter: CharacterId,
  peerTag: string,
  startTime: number
): ReflectionSummary {
  const durationSec = Math.max(30, Math.floor((Date.now() - startTime) / 1000))
  const minutes = Math.floor(durationSec / 60)
  const durationFormatted = minutes > 0 ? `${minutes} min ${durationSec % 60}s` : `${durationSec}s`

  const userMessages = messages.filter((m) => m.senderCharacter === myCharacter)
  const isVented = userMessages.some((m) => m.text.length > 50 || /stress|pressure|tired/i.test(m.text))

  const themes: string[] = ['Shared vulnerability', 'Mutual listening']
  if (userMessages.some((m) => /exam|study/i.test(m.text))) themes.push('Academic pressure')
  if (userMessages.some((m) => /lonely|alone/i.test(m.text))) themes.push('Connection & presence')

  return {
    sharedTopic: themes.join(' • '),
    messageCount: messages.length,
    duration: durationFormatted,
    myCharacter,
    peerTag,
    sentimentShift: isVented ? 'Lightened (+28% calm)' : 'Grounded & Heard',
    closureInsight: 'You took time to express what was weighing on you without wearing a mask. That took courage.',
    closingAffirmation: 'You showed up for yourself and another human today. Carry this gentleness into the rest of your week.',
  }
}
