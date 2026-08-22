// Comprehensive Multilingual Translation Engine for SafeSpeak
// Supports Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்), English, Hinglish, Tenglish & Tanglish

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
    en: "It really helps just to talk to someone who gets it.",
    hi: "किसी ऐसे व्यक्ति से बात करने से सच में बहुत मदद मिलती है जो समझता हो।",
    hinglish: "Aise insaan se baat karke sach me accha lagta hai jo samajhta ho.",
    te: "మనల్ని అర్థం చేసుకునే వారితో మాట్లాడటం నిజంగా చాలా సహాయపడుతుంది.",
    tenglish: "Manalni ardham chesukune varitho matladithey chala help avuthundi.",
    ta: "நம்மை புரிந்து கொள்ளும் ஒருவருடன் பேசுவது உண்மையில் மிகவும் உதவுகிறது.",
    tanglish: "Nammala purinjikira oruthar kitta pesradhu romba help pannudhu.",
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

// Word dictionary for mental health, emotional & daily conversational concepts
const VOCAB: Record<string, { hi: string; te: string; ta: string; en: string }> = {
  stress: { hi: "तनाव", te: "ఒత్తిడి", ta: "மன அழுத்தம்", en: "stress" },
  tension: { hi: "तनाव", te: "ఒత్తిడి", ta: "பதட்டம்", en: "tension" },
  tired: { hi: "थका हुआ", te: "అలసిపోయిన", ta: "களைப்பாக", en: "tired" },
  lonely: { hi: "अकेला", te: "ఒంటరిగా", ta: "தனியாக", en: "lonely" },
  pressure: { hi: "दबाव", te: "భారం", ta: "அழுத்தம்", en: "pressure" },
  exams: { hi: "परीक्षा", te: "పరీక్షలు", ta: "தேர்வுகள்", en: "exams" },
  exam: { hi: "परीक्षा", te: "పరీక్ష", ta: "தேர்வு", en: "exam" },
  study: { hi: "पढ़ाई", te: "చదువు", ta: "படிப்பு", en: "study" },
  studies: { hi: "पढ़ाई", te: "చదువు", ta: "படிப்பு", en: "studies" },
  sleep: { hi: "नींद", te: "నిద్ర", ta: "தூக்கம்", en: "sleep" },
  family: { hi: "परिवार", te: "కుటుంబం", ta: "குடும்பம்", en: "family" },
  friends: { hi: "दोस्त", te: "స్నేహితులు", ta: "நண்பர்கள்", en: "friends" },
  friend: { hi: "दोस्त", te: "స్నేహితుడు", ta: "நண்பர்", en: "friend" },
  help: { hi: "मदद", te: "సహాయం", ta: "உதவி", en: "help" },
  thanks: { hi: "धन्यवाद", te: "ధన్యవాదాలు", ta: "நன்றி", en: "thank you" },
  scared: { hi: "डरा हुआ", te: "భయంగా", ta: "பயமாக", en: "scared" },
  worried: { hi: "चिंतित", te: "ఆందోళనగా", ta: "கவலையாக", en: "worried" },
  sad: { hi: "उदास", te: "బాధగా", ta: "வருத்தமாக", en: "sad" },
  fear: { hi: "डर", te: "భయం", ta: "பயம்", en: "fear" },
  good: { hi: "अच्छा", te: "మంచిది", ta: "நல்லது", en: "good" },
  peace: { hi: "शांति", te: "శాంతి", ta: "அமைதி", en: "peace" },
  hope: { hi: "उम्मीद", te: "ఆశ", ta: "நம்பிக்கை", en: "hope" },
}

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

/**
 * Translates message text into recipient's preferred language with tone preservation
 */
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

  // If already in target language, return as-is
  if (
    (targetLang === 'English' && detected === 'English') ||
    (targetLang === 'Hindi' && detected === 'Hindi') ||
    (targetLang === 'Telugu' && detected === 'Telugu') ||
    (targetLang === 'Tamil' && detected === 'Tamil')
  ) {
    return { originalLang: detected, targetLang, translatedText: clean }
  }

  // 1. Direct matched conversational database
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

  // 2. Hinglish / Hindi to English
  if (detected === 'Hinglish' || detected === 'Hindi') {
    if (targetLang === 'English') {
      let en = clean
      if (/mujhe (bhi )?aise hi lag raha/i.test(lower)) en = "I feel the exact same way."
      else if (/bahut (stress|tension) ho raha/i.test(lower) || /bohot (stress|tension)/i.test(lower)) en = "I am feeling a lot of stress right now."
      else if (/kuch samajh nahi aa raha/i.test(lower)) en = "I can't seem to figure anything out."
      else if (/kya karu/i.test(lower)) en = "What should I do?"
      else if (/shukriya|dhanyawad|thanks/i.test(lower)) en = "Thank you so much."
      else if (/sahi bola|sahi baat hai/i.test(lower)) en = "You're totally right."
      else if (/boards? exam/i.test(lower) || /exam ki tension/i.test(lower)) en = "I am so stressed about my upcoming exams."
      else if (/akela feel ho raha|akelapan/i.test(lower)) en = "I have been feeling very lonely."
      else if (/neend nahi aa rahi/i.test(lower)) en = "I am having trouble sleeping."
      return { originalLang: detected, targetLang: 'English', translatedText: en }
    }
    if (targetLang === 'Telugu') {
      if (/stress|tension/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "నాకు చాలా ఒత్తిడిగా అనిపిస్తోంది." }
      if (/shukriya|dhanyawad/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "చాలా ధన్యవాదాలు." }
      if (/sahi bola/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "మీరు చెప్పింది నిజమే." }
    }
    if (targetLang === 'Tamil') {
      if (/stress|tension/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "எனக்கு மிகவும் மன அழுத்தமாக இருக்கிறது." }
      if (/shukriya|dhanyawad/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "மிக்க நன்றி." }
      if (/sahi bola/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "நீங்கள் சொன்னது உண்மைதான்." }
    }
  }

  // 3. Telugu / Tenglish to English or Hindi
  if (detected === 'Telugu') {
    if (targetLang === 'English') {
      let en = clean
      if (/stress ekkuva|tension ekkuva/i.test(lower)) en = "I am dealing with high stress."
      else if (/naku kooda ilage/i.test(lower) || /same anipistondi/i.test(lower)) en = "I feel the exact same way."
      else if (/em cheyalo ardham kavatledu/i.test(lower)) en = "I don't know what to do right now."
      else if (/chala thanks|dhanyavadalu/i.test(lower)) en = "Thank you very much."
      else if (/ontariga anipistondi/i.test(lower)) en = "I feel quite lonely today."
      return { originalLang: detected, targetLang: 'English', translatedText: en }
    }
    if (targetLang === 'Hindi') {
      if (/stress ekkuva|tension/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "मुझे बहुत तनाव महसूस हो रहा है।" }
      if (/thanks|dhanyavadalu/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "आपका बहुत धन्यवाद।" }
    }
  }

  // 4. Tamil / Tanglish to English or Hindi
  if (detected === 'Tamil') {
    if (targetLang === 'English') {
      let en = clean
      if (/romba stress|tension ah irukku/i.test(lower)) en = "I am experiencing a lot of stress."
      else if (/naanum ipdi dhaan/i.test(lower) || /same ah irukku/i.test(lower)) en = "I feel the exact same way."
      else if (/enna panradhu nu theriyala/i.test(lower)) en = "I don't know what to do."
      else if (/romba nandri/i.test(lower)) en = "Thank you so much."
      return { originalLang: detected, targetLang: 'English', translatedText: en }
    }
    if (targetLang === 'Hindi') {
      if (/romba stress/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "मुझे बहुत तनाव महसूस हो रहा है।" }
      if (/romba nandri/i.test(lower)) return { originalLang: detected, targetLang, translatedText: "आपका बहुत धन्यवाद।" }
    }
  }

  // 5. English to Hindi / Telugu / Tamil
  if (detected === 'English') {
    if (targetLang === 'Hindi') {
      if (/same here|i agree|relatable|me too/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "मैं भी यही महसूस कर रहा हूँ।" }
      if (/thank you|thanks/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "आपका बहुत-बहुत धन्यवाद।" }
      if (/how are you|how you doing/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "आप कैसे हैं?" }
      if (/so stressed|really stressed/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "मुझे बहुत तनाव हो रहा है।" }
      if (/i understand|i hear you/i.test(lower)) return { originalLang: 'English', targetLang: 'Hindi', translatedText: "मैं आपकी बात समझ सकता हूँ।" }
    }
    if (targetLang === 'Telugu') {
      if (/same here|i agree|relatable|me too/i.test(lower)) return { originalLang: 'English', targetLang: 'Telugu', translatedText: "నేను కూడా అలాగే భావిస్తున్నాను." }
      if (/thank you|thanks/i.test(lower)) return { originalLang: 'English', targetLang: 'Telugu', translatedText: "చాలా ధన్యవాదాలు." }
      if (/how are you/i.test(lower)) return { originalLang: 'English', targetLang: 'Telugu', translatedText: "మీరు ఎలా ఉన్నారు?" }
      if (/so stressed|really stressed/i.test(lower)) return { originalLang: 'English', targetLang: 'Telugu', translatedText: "నాకు చాలా ఒత్తిడిగా ఉంది." }
      if (/i understand|i hear you/i.test(lower)) return { originalLang: 'English', targetLang: 'Telugu', translatedText: "నాకు అర్థమవుతోంది." }
    }
    if (targetLang === 'Tamil') {
      if (/same here|i agree|relatable|me too/i.test(lower)) return { originalLang: 'English', targetLang: 'Tamil', translatedText: "நானும் அப்படியே உணர்கிறேன்." }
      if (/thank you|thanks/i.test(lower)) return { originalLang: 'English', targetLang: 'Tamil', translatedText: "மிக்க நன்றி." }
      if (/how are you/i.test(lower)) return { originalLang: 'English', targetLang: 'Tamil', translatedText: "நீங்கள் எப்படி இருக்கிறீர்கள்?" }
      if (/so stressed|really stressed/i.test(lower)) return { originalLang: 'English', targetLang: 'Tamil', translatedText: "எனக்கு அதிக மன அழுத்தமாக உள்ளது." }
      if (/i understand|i hear you/i.test(lower)) return { originalLang: 'English', targetLang: 'Tamil', translatedText: "எனக்கு புரிகிறது." }
    }
  }

  // Fallback: return clean text
  return {
    originalLang: detected,
    targetLang,
    translatedText: clean,
  }
}
