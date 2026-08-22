import { evaluateCrisisTier } from '@safespeak/crisis-keywords'
import type { CharacterId, ChatMessage, CrisisTier, ModerationResult, ReflectionSummary } from '@safespeak/shared-types'

// Re-export crisis evaluator
export function checkCrisisTier(text: string): CrisisTier {
  return evaluateCrisisTier(text)
}

// Moderation rules
export function checkModeration(text: string): ModerationResult {
  const lower = text.toLowerCase()
  if (/take \d+ pills|overdose on|jump off|hang yourself/i.test(lower)) {
    return { verdict: 'blocked', reason: 'Contains unsafe or harmful suggestions.', category: 'harmful_medical' }
  }
  return { verdict: 'approved' }
}

// Language detector
export function detectLanguage(text: string): 'Hindi' | 'Telugu' | 'Tamil' | 'Hinglish' | 'English' {
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi'
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu'
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil'

  const lower = text.toLowerCase()
  if (/\b(hai|hoon|kya|kyu|kaise|mera|meri|mujhe|bahut|karna|samjha|nahi|bohot|lag|raha|rahi|accha|shukriya)\b/.test(lower)) {
    return 'Hinglish'
  }
  if (/\b(undi|naku|cheyali|chesthunna|ela|ippudu|koddiga|ledhu|unnanu|avunu|chala|bayam|edupu|gunde)\b/.test(lower)) {
    return 'Telugu'
  }
  if (/\b(irukku|pudikala|theriyuma|panren|epdi|ippo|nalla|kitta|romba|aama|azhuga|thangika)\b/.test(lower)) {
    return 'Tamil'
  }

  return 'English'
}

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
]

export function translateMessage(
  text: string,
  targetLang: string = 'English'
): { originalLang: string; targetLang: string; translatedText: string } {
  if (!text || !text.trim()) {
    return { originalLang: 'English', targetLang, translatedText: '' }
  }

  const detected = detectLanguage(text)
  const clean = text.trim()
  const lower = clean.toLowerCase()

  if (
    (targetLang === 'English' && detected === 'English') ||
    (targetLang === 'Hindi' && detected === 'Hindi') ||
    (targetLang === 'Telugu' && detected === 'Telugu') ||
    (targetLang === 'Tamil' && detected === 'Tamil')
  ) {
    return { originalLang: detected, targetLang, translatedText: clean }
  }

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

  if (detected === 'Hinglish' || detected === 'Hindi') {
    if (targetLang === 'English') {
      let en = clean
      if (/mujhe (bhi )?aise hi lag raha/i.test(lower)) en = "I feel the exact same way."
      else if (/bahut (stress|tension) ho raha/i.test(lower) || /bohot (stress|tension)/i.test(lower)) en = "I am feeling a lot of stress right now."
      else if (/shukriya|dhanyawad|thanks/i.test(lower)) en = "Thank you so much."
      else if (/boards? exam/i.test(lower) || /exam ki tension/i.test(lower)) en = "I am so stressed about my upcoming exams."
      else if (/akela feel ho raha|akelapan/i.test(lower)) en = "I have been feeling very lonely."
      return { originalLang: detected, targetLang: 'English', translatedText: en }
    }
  }

  if (detected === 'Telugu') {
    if (targetLang === 'English') {
      let en = clean
      if (/stress ekkuva|tension ekkuva/i.test(lower)) en = "I am dealing with high stress."
      else if (/naku kooda ilage/i.test(lower) || /same anipistondi/i.test(lower)) en = "I feel the exact same way."
      else if (/chala thanks|dhanyavadalu/i.test(lower)) en = "Thank you very much."
      else if (/ontariga anipistondi/i.test(lower)) en = "I feel quite lonely today."
      return { originalLang: detected, targetLang: 'English', translatedText: en }
    }
  }

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
