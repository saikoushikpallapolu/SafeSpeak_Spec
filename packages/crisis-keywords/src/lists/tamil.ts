export const TAMIL_TIER_2_PATTERNS = [
  // Tamil Script
  /தற்கொலை/i,
  /சாக வேண்டும்/i,
  /சாகனும் போல/i,
  /செத்துடலாம்/i,
  /வாழ விருப்பமில்லை/i,
  /வாழவே பிடிக்கல/i,
  /உயிரை விட/i,

  // Tanglish / Latin Script
  /\b(tharkolai|suicide panna poren|suicide pannipen)\b/i,
  /\b(saaga vendum|saaganum pola irukku|saagalam nu irukken)\b/i,
  /\b(sethudalam pola irukku|sethu poiduven|uyira vida poren)\b/i,
  /\b(vaazha virupamilla|vaazhave pudikala|vaazhadhe waste)\b/i,
  /\b(yaarukum na irukaradhu thevailla|enna aala vidunga)\b/i,
]

export const TAMIL_TIER_1_PATTERNS = [
  // Tamil Script
  /மன அழுத்தம்/i,
  /பயமா இருக்கு/i,
  /அழுவுறேன்/i,
  /தாங்க முடியல/i,

  // Tanglish / Latin Script
  /\b(romba stress|stress ah irukku|tension ah irukku)\b/i,
  /\b(romba bayama irukku|bayam ah iruku|padhatama irukku)\b/i,
  /\b(azhuga varudhu|azhuthuten irukken|kanner varudhu)\b/i,
  /\b(thangika mudiyala|thaanga mudila|handle panna mudila)\b/i,
  /\b(enna panradhu nu theriyala|thaniya irukken)\b/i,
]
