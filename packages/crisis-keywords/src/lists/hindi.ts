export const HINDI_TIER_2_PATTERNS = [
  // Devanagari
  /आत्महत्या/i,
  /मरना चाहता/i,
  /मरना चाहती/i,
  /मरने का मन/i,
  /जिंदगी खत्म/i,
  /जीने का कोई मतलब नहीं/i,
  /सब खत्म करना/i,
  /खुद को मार/i,
  /जान देना चाहता/i,
  /जान दे दूंगा/i,

  // Hinglish / Latin Script
  /\b(marna chahta hu|marna chahti hu|marna chahta hoon|marna chahti hoon)\b/i,
  /\b(mar jaane ka mann?|marne ka mann? kar raha|mar jau kya)\b/i,
  /\b(khudkushi|suicide kar|jaan de dunga|jaan dena chahta)\b/i,
  /\b(zindagi khatam|jeene ka koi matlab nahi|jeena nahi chahta|jeena nahi chahti)\b/i,
  /\b(sab khatam karna|apne aap ko khatam|khud ko maar daloonga)\b/i,
  /\b(koi faida nahi jeene ka|koi matlab nahi kal ka)\b/i,
  /\b(duniya se jana chahta hu|sabse dur chale jana chahta hu forever)\b/i,
]

export const HINDI_TIER_1_PATTERNS = [
  // Devanagari
  /तनाव/i,
  /घबराहट/i,
  /रोना आ रहा/i,
  /हिम्मत टूट रही/i,
  /बहुत अकेला/i,
  /बहुत भारी/i,
  /परेशान हूँ/i,

  // Hinglish / Latin Script
  /\b(bahut stress|bohot stress|stress ho raha|bohot tension|bahut tension)\b/i,
  /\b(ghabrahat ho rahi|dil ghabra raha|saans nahi aa rahi)\b/i,
  /\b(bahut rona aa raha|rona aa raha hai|ro raha hu|ro rahi hu)\b/i,
  /\b(bardasht nahi ho raha|sahan nahi ho raha|handle nahi ho raha)\b/i,
  /\b(akela feel ho raha|bohot akelapan|koi sath nahi hai)\b/i,
  /\b(himmat toot gayi|kuch samajh nahi aa raha|dimag fat raha|dimag phat raha)\b/i,
]
