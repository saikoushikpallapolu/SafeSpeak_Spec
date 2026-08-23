import type { CharacterId, ChatMessage, CrisisTier, ModerationResult, ReflectionSummary } from '@safespeak/shared-types'
import { evaluateAiSafety, evaluateAiCrisis, normalizeText } from './aiSafetyEngine'

// ---------------------------------------------------------------------------
// 1. CRISIS & EMERGENCY EVALUATION (Rule-Based & Semantic)
// ---------------------------------------------------------------------------

export function checkCrisisTier(text: string): CrisisTier {
  return evaluateAiCrisis(text)
}

// ---------------------------------------------------------------------------
// 2. MODERATION & SAFETY FILTER (Bullying, Abusive Language, False Medical Advice)
// ---------------------------------------------------------------------------

export function checkModeration(text: string): ModerationResult {
  return evaluateAiSafety(text)
}

// ---------------------------------------------------------------------------
// 3. MULTI-LINGUAL LANGUAGE DETECTION (Hindi, Telugu, Tamil, Hinglish, Tenglish, English)
// ---------------------------------------------------------------------------

export function detectLanguage(text: string): 'Hindi' | 'Telugu' | 'Tamil' | 'Hinglish' | 'Tenglish' | 'Tanglish' | 'English' {
  if (!text) return 'English'

  // Script-based detection
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi'
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu'
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil'

  const lower = text.toLowerCase()

  // Hinglish conversational markers
  if (/\b(hai|hoon|kya|kyu|kaise|mera|meri|mujhe|bahut|karna|samjha|nahi|bohot|lag|raha|rahi|accha|shukriya|yaar|bhai|kuch|kare|karte|hum|tum|aap|batao|samajh|tension|sahi|bilkul|baat|thoda|hoga|hogi|padhai|neend|chinta)\b/.test(lower)) {
    return 'Hinglish'
  }

  // Tenglish conversational markers
  if (/\b(undi|naku|cheyali|chesthunna|ela|ippudu|koddiga|ledhu|unnanu|avunu|chala|bayam|edupu|gunde|garu|andi|kooda|kaadhu|mari|em|enti|cheppu|ardham|kavali|baga|chusi|ravali|anipisthundi)\b/.test(lower)) {
    return 'Tenglish'
  }

  // Tanglish conversational markers
  if (/\b(irukku|pudikala|theriyuma|panren|epdi|ippo|nalla|kitta|romba|aama|azhuga|thangika|machan|da|di|theriyala|pesa|solla|mudiyala|kavala)\b/.test(lower)) {
    return 'Tanglish'
  }

  return 'English'
}

// ---------------------------------------------------------------------------
// 4. DICTIONARY & CONVERSATIONAL TRANSLATION PHRASES (0ms Instant Tier)
// ---------------------------------------------------------------------------

interface TranslationPhrase {
  en: string
  hi: string
  te: string
  ta: string
  hinglish?: string
  tenglish?: string
  tanglish?: string
}

const PHRASE_DATABASE: TranslationPhrase[] = [
  {
    en: "Hey. I saw we're both dealing with exam stress right now.",
    hi: "नमस्ते। मैंने देखा कि हम दोनों अभी परीक्षा के तनाव से जूझ रहे हैं।",
    hinglish: "Hey. Maine dekha ki hum dono abhi exam stress se guzar rahe hain.",
    te: "హాయ్. మనం ఇద్దరం ఇప్పుడు పరీక్షల ఒత్తిడిని ఎదుర్కొంటున్నామని చూశాను.",
    tenglish: "Hey. Manam iddaram ippudu exam stress face chesthunnam ani chusanu.",
    ta: "வணக்கம். நாம் இருவரும் இப்போது தேர்வு அழுத்தத்தை எதிர்கொள்கிறோம் என்று பார்த்தேன்.",
    tanglish: "Hey. Namma rendu perum ippo exam stress face panrom nu paathen.",
  },
  {
    en: "Yeah... my boards are in three weeks and I can't focus on anything for more than five minutes.",
    hi: "हाँ... मेरी बोर्ड परीक्षा तीन हफ़्तों में है और मैं पांच मिनट से ज़्यादा ध्यान नहीं लगा पा रहा हूँ।",
    hinglish: "Haan... meri board exam 3 weeks me hai aur mai 5 min se zyada focus nahi kar pa raha.",
    te: "అవును... నా బోర్డ్ పరీక్షలు మూడు వారాల్లో ఉన్నాయి మరియు నేను ఐదు నిమిషాల కంటే ఎక్కువ ద్యాస పెట్టలేకపోతున్నాను.",
    tenglish: "Avunu... na board exams 3 weeks lo unnay, 5 mins kante ekkuva focus cheyaleka pothunna.",
    ta: "ஆமாம்... எனது பொதுத்தேர்வு மூன்று வாரங்களில் உள்ளது, என்னால் ஐந்து நிமிடங்களுக்கு மேல் கவனம் செலுத்த முடியவில்லை.",
    tanglish: "Aama... en board exams 3 weeks la irukku, 5 mins mela focus panna mudiyala.",
  },
  {
    en: "I completely understand. I feel the exact same way — there is just so much pressure.",
    hi: "हाँ बिल्कुल समझा। मुझे भी ऐसा ही लग रहा है — बहुत सारा दबाव है।",
    hinglish: "Haan bilkul samjha. Mujhe bhi aise hi lag raha hai — bohot sara pressure hai.",
    te: "నాకు పూర్తిగా అర్థమైంది. నేను కూడా సరిగ్గా ఇలాగే భావిస్తున్నాను — చాలా ఒత్తిడిగా ఉంది.",
    tenglish: "Naku motham ardham ayindi. Naku kooda ilage anipistondi — chala pressure undi.",
    ta: "எனக்கு முற்றிலும் புரிகிறது. நானும் இப்படித்தான் உணர்கிறேன் — அதிக அழுத்தம் உள்ளது.",
    tanglish: "Enakku nalla puriyudhu. Naanum ipdi dhaan feel panren — romba pressure ah irukku.",
  },
  {
    en: "That's actually comforting to hear. Do you have any strategies that actually work?",
    hi: "यह सुनकर सच में सुकून मिला। क्या आपके पास कोई ऐसी तरकीब है जो वाकई काम करती हो?",
    hinglish: "Ye sunkar sach me thoda sukoon mila. Kya aapke paas koi technique hai jo work karti ho?",
    te: "ఇది వినడం కాస్త ఊరటనిచ్చింది. మీకు నిజంగా పనిచేసే చిట్కాలు ఏమైనా తెలుసా?",
    tenglish: "Idhi vini koddiga relief ga undi. Meeku nijamga work aye strategies emanna thelusa?",
    ta: "இதை கேட்பது உண்மையிலேயே ஆறுதலாக இருக்கிறது. நிஜமாகவே வேலை செய்யும் வழிகள் ஏதேனும் உள்ளதா?",
    tanglish: "Idhu kekka konjam relief ah irukku. Ungalukku work aagura strategies edhavadhu theriyuma?",
  },
  {
    en: "I try the 10-minute rule: study for 10 minutes, take a short breath, and repeat.",
    hi: "मैं 10 मिनट का नियम आजमाता हूँ: 10 मिनट पढ़ाई करो, गहरी सांस लो, और फिर दोहराओ।",
    hinglish: "Mai 10-minute rule try karta hu: 10 min padho, thoda deep breath lo, aur repeat karo.",
    te: "నేను 10 నిమిషాల నియమాన్ని పాటిస్తాను: 10 నిమిషాలు చదవడం, చిన్న విరామం తీసుకోవడం, మళ్ళీ చేయడం.",
    tenglish: "Nenu 10-minute rule try chestha: 10 mins chadavadam, chinna break theesukondi, repeat cheyadam.",
    ta: "நான் 10 நிமிட விதியை பின்பற்றுகிறேன்: 10 நிமிடம் படிக்கவும், ஒரு சிறிய இடைவெளி எடுக்கவும், மீண்டும் செய்யவும்.",
    tanglish: "Naan 10-minute rule try panren: 10 mins padikka, chinna break edukka, repeat panna.",
  },
  {
    en: "How are you feeling right now?",
    hi: "आप अभी कैसा महसूस कर रहे हैं?",
    hinglish: "Aap abhi kaisa feel kar rahe ho?",
    te: "మీరు ప్రస్తుతం ఎలా ఉన్నారు?",
    tenglish: "Meeru ippudu ela feel avuthunnaru?",
    ta: "நீங்கள் இப்போது எப்படி உணர்கிறீர்கள்?",
    tanglish: "Neenga ippo epdi feel panreenga?",
  },
  {
    en: "Take your time, I'm here to listen.",
    hi: "आराम से बताएं, मैं आपकी बात सुनने के लिए यहाँ हूँ।",
    hinglish: "Apna time lo, mai sunne ke liye yahi hu.",
    te: "నెమ్మదిగా చెప్పండి, నేను వినడానికి ఇక్కడే ఉన్నాను.",
    tenglish: "Koddiga time theesukondi, nenu vinadaniki ikkade unnanu.",
    ta: "மெதுவாக சொல்லுங்கள், நான் கேட்க தயாராக இருக்கிறேன்.",
    tanglish: "Medhuva sollunga, naan kekka ready ah irukken.",
  },
  {
    en: "Hello, nice to connect with you.",
    hi: "नमस्ते, आपसे जुड़कर अच्छा लगा।",
    hinglish: "Hello, aapse connect karke accha laga.",
    te: "హలో, మీతో కనెక్ట్ అవ్వడం ఆనందంగా ఉంది.",
    tenglish: "Hello, meetho connect avvadam santhosham ga undi.",
    ta: "வணக்கம், உங்களுடன் இணைந்ததில் மகிழ்ச்சி.",
    tanglish: "Hello, unga kitta connect aanadhula romba sandhosham.",
  },
  {
    en: "I am feeling so stressed today.",
    hi: "मुझे आज बहुत तनाव महसूस हो रहा है।",
    hinglish: "Mujhe aaj bohot stress feel ho raha hai.",
    te: "ఈరోజు నాకు చాలా ఒత్తిడిగా అనిపిస్తోంది.",
    tenglish: "Ee roju naku chala stress ga anipisthundi.",
    ta: "இன்று எனக்கு அதிக மன அழுத்தம் ஏற்படுகிறது.",
    tanglish: "Inaiku enakku romba stress ah irukku.",
  },
  {
    en: "Everything feels so overwhelming lately.",
    hi: "हाल ही में सब कुछ बहुत भारी और कठिन लग रहा है।",
    hinglish: "Lately sab kuch bohot overwhelming lag raha hai.",
    te: "ఈ మధ్య ప్రతిదీ చాలా భారంగా అనిపిస్తోంది.",
    tenglish: "Ee madhya prathidhi chala bharamga anipistondi.",
    ta: "சமீபகாலமாக எல்லாமே மிகவும் கடினமாக தோன்றுகிறது.",
    tanglish: "Ipo ellame romba kashtama irukku.",
  },
  {
    en: "Thank you for listening to me.",
    hi: "मेरी बात सुनने के लिए आपका बहुत धन्यवाद।",
    hinglish: "Meri baat sunne ke liye bohot shukriya.",
    te: "నా మాట విన్నందుకు చాలా ధన్యవాదాలు.",
    tenglish: "Na maata vinnanduku chala thanks.",
    ta: "என் பேச்சைக் கேட்டதற்கு மிக்க நன்றி.",
    tanglish: "Enna ketadhukku romba nandri.",
  },
]

// Conversational rule-based patterns for casual mixed-language inputs
const HINGLISH_PATTERNS: Array<{ regex: RegExp; en: string; hi: string; te: string }> = [
  { regex: /mujhe (bhi )?aise hi lag raha/i, en: "I feel the exact same way.", hi: "मुझे भी ऐसा ही लग रहा है।", te: "నాకు కూడా అలాగే అనిపిస్తోంది." },
  { regex: /bohot (stress|tension|pressure)|bahut (stress|tension)/i, en: "I am dealing with a lot of stress right now.", hi: "मुझे अभी बहुत तनाव महसूस हो रहा है।", te: "నాకు ప్రస్తుతం చాలా ఒత్తిడిగా ఉంది." },
  { regex: /kuch samajh nahi aa raha/i, en: "I can't seem to figure anything out.", hi: "मुझे कुछ समझ नहीं आ रहा है।", te: "నాకేం అర్థం కావడం లేదు." },
  { regex: /kya karu/i, en: "What should I do?", hi: "मैं क्या करूँ?", te: "నేనేం చేయాలి?" },
  { regex: /shukriya|dhanyawad|thanks/i, en: "Thank you so much.", hi: "आपका बहुत-बहुत धन्यवाद।", te: "చాలా ధన్యవాదాలు." },
  { regex: /sahi bola|sahi baat hai/i, en: "You are totally right.", hi: "आपने बिल्कुल सही कहा।", te: "మీరు చెప్పింది కరెక్ట్." },
  { regex: /boards? exam|exam ki tension/i, en: "I am so stressed about my upcoming exams.", hi: "मुझे आने वाली परीक्षाओं का बहुत तनाव है।", te: "నాకు పరీక్షలంటే చాలా భయంగా ఉంది." },
  { regex: /akela feel ho raha|akelapan/i, en: "I have been feeling very lonely.", hi: "मुझे बहुत अकेलापन महसूस हो रहा है।", te: "నాకు చాలా ఒంటరిగా అనిపిస్తోంది." },
  { regex: /neend nahi aa rahi/i, en: "I am having trouble sleeping.", hi: "मुझे नींद नहीं आ रही है।", te: "నాకు నిద్ర పట్టడం లేదు." },
  { regex: /yaar bohot darr lag raha hai/i, en: "Friend, I am feeling really scared.", hi: "यार, मुझे बहुत डर लग रहा है।", te: "చాలా భయంగా అనిపిస్తోంది." },
]

const TENGLISH_PATTERNS: Array<{ regex: RegExp; en: string; hi: string }> = [
  { regex: /stress ekkuva|tension ekkuva|chala stress/i, en: "I am dealing with high stress.", hi: "मुझे बहुत तनाव हो रहा है।" },
  { regex: /naku kooda ilage|same anipistondi/i, en: "I feel the exact same way.", hi: "मुझे भी ऐसा ही लग रहा है।" },
  { regex: /em cheyalo ardham kavatledu/i, en: "I don't know what to do right now.", hi: "मुझे समझ नहीं आ रहा कि क्या करूँ।" },
  { regex: /chala thanks|dhanyavadalu/i, en: "Thank you very much.", hi: "आपका बहुत धन्यवाद।" },
  { regex: /ontariga anipistondi/i, en: "I feel quite lonely today.", hi: "मुझे आज अकेलापन लग रहा है।" },
  { regex: /bhayam ga undi|bayam ga undi/i, en: "I am feeling scared.", hi: "मुझे डर लग रहा है।" },
]

// ---------------------------------------------------------------------------
// 5. RESILIENT REAL-TIME TRANSLATION PIPELINE
// ---------------------------------------------------------------------------

export async function translateMessage(
  text: string,
  targetLang: string = 'English'
): Promise<{ originalLang: string; targetLang: string; translatedText: string }> {
  if (!text || !text.trim()) {
    return { originalLang: 'English', targetLang, translatedText: '' }
  }

  const clean = text.trim()
  const lower = clean.toLowerCase()
  const detected = detectLanguage(clean)

  // 1. Check direct conversational phrase match (0ms)
  for (const entry of PHRASE_DATABASE) {
    const matchesAny =
      entry.en.toLowerCase() === lower ||
      entry.hi.toLowerCase() === lower ||
      (entry.hinglish && entry.hinglish.toLowerCase() === lower) ||
      entry.te.toLowerCase() === lower ||
      (entry.tenglish && entry.tenglish.toLowerCase() === lower) ||
      entry.ta.toLowerCase() === lower ||
      (entry.tanglish && entry.tanglish.toLowerCase() === lower)

    if (matchesAny) {
      if (targetLang === 'Hindi') return { originalLang: detected, targetLang, translatedText: entry.hi }
      if (targetLang === 'Telugu') return { originalLang: detected, targetLang, translatedText: entry.te }
      if (targetLang === 'Tamil') return { originalLang: detected, targetLang, translatedText: entry.ta }
      if (targetLang === 'Hinglish') return { originalLang: detected, targetLang, translatedText: entry.hinglish || entry.hi }
      return { originalLang: detected, targetLang: 'English', translatedText: entry.en }
    }
  }

  // 2. Check rule-based mixed patterns
  if (detected === 'Hinglish' || detected === 'Hindi') {
    for (const p of HINGLISH_PATTERNS) {
      if (p.regex.test(clean)) {
        if (targetLang === 'Hindi') return { originalLang: detected, targetLang, translatedText: p.hi }
        if (targetLang === 'Telugu') return { originalLang: detected, targetLang, translatedText: p.te }
        return { originalLang: detected, targetLang: 'English', translatedText: p.en }
      }
    }
  }

  if (detected === 'Tenglish' || detected === 'Telugu') {
    for (const p of TENGLISH_PATTERNS) {
      if (p.regex.test(clean)) {
        if (targetLang === 'Hindi') return { originalLang: detected, targetLang, translatedText: p.hi }
        return { originalLang: detected, targetLang: 'English', translatedText: p.en }
      }
    }
  }

  // 3. Map target language to ISO code for online dynamic API
  const langCodeMap: Record<string, string> = {
    Hindi: 'hi',
    Telugu: 'te',
    Tamil: 'ta',
    English: 'en',
    Hinglish: 'hi',
  }
  const targetCode = langCodeMap[targetLang] || 'en'

  // 4. Online dynamic translation with Google GTX endpoint
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2200)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(clean)}`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join('')
        if (translated && translated.trim()) {
          return {
            originalLang: detected,
            targetLang,
            translatedText: translated.trim(),
          }
        }
      }
    }
  } catch (_) {
    // Graceful fallback to rule-based or clean text
  }

  // 5. English to regional rule-based fallbacks
  if (detected === 'English') {
    if (targetLang === 'Hindi') {
      if (/same here|i agree|relatable|me too/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "मैं भी यही महसूस कर रहा हूँ।" }
      if (/thank you|thanks/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "आपका बहुत-बहुत धन्यवाद।" }
      if (/how are you/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "आप कैसे हैं?" }
    }
    if (targetLang === 'Telugu') {
      if (/same here|i agree|relatable|me too/i.test(lower)) return { originalLang: 'English', targetLang: 'Telugu', translatedText: "నేను కూడా అలాగే భావిస్తున్నాను." }
      if (/thank you|thanks/i.test(lower)) return { originalLang: 'English', targetLang: 'Telugu', translatedText: "చాలా ధన్యవాదాలు." }
    }
  }

  return { originalLang: detected, targetLang, translatedText: clean }
}

// ---------------------------------------------------------------------------
// 6. SIMULATED PEER & REFLECTION HELPERS
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
  } else if (/hello|hi|hey/i.test(lower) && lower.length < 15) {
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
