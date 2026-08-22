export const TELUGU_TIER_2_PATTERNS = [
  // Telugu Script
  /ఆత్మహత్య/i,
  /చనిపోవాలని/i,
  /చనిపోతాను/i,
  /చచ్చిపోవాలని/i,
  /చచ్చిపోతాను/i,
  /బ్రతకాలని లేదు/i,
  /బ్రతకడం వేస్ట్/i,
  /ప్రాణం తీసుకుంటా/i,
  /జీవితం ముగిసిపోయింది/i,

  // Tenglish / Latin Script
  /\b(chanipovalani undi|chanipothanu|chanipovali|chanipovali anipistondi)\b/i,
  /\b(chachipothanu|chachipovali|chachipovalani|chachi povalani|chavalanipist[ou]ndi)\b/i,
  /\b(aathmahathya|athma hathya|suicide chesukunta)\b/i,
  /\b(brathakalani ledu|bratakalani ledhu|jeevitham waste)\b/i,
  /\b(jeevitham aipoindi|pranam theesukunta|pranam theesukovali)\b/i,
  /\b(nenu chanipothe evariki parvaledu|inka batiki waste)\b/i,
]

export const TELUGU_TIER_1_PATTERNS = [
  // Telugu Script
  /ఒత్తిడి/i,
  /భయం/i,
  /ఏడుపు/i,
  /ఆందోళన/i,
  /భరించలేకపోతున్నా/i,

  // Tenglish / Latin Script
  /\b(chala tension|tension ekkuva undi|stress ekkuva)\b/i,
  /\b(chala bayamga undi|bayam vestondi|gunde dadaga undi)\b/i,
  /\b(edupu vasthondi|edusthunnanu|edavalanipistondi)\b/i,
  /\b(bharinchaleka pothunna|bharinchaleka pothunnanu)\b/i,
  /\b(em cheyalo ardham kavatledu|chala ontariga anipistondi)\b/i,
]
