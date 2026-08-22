export const HARMFUL_MEDICAL_ADVICE_PATTERNS = [
  /\b(stop (taking|your) (antidepressants|medication|medicine|prescriptions|pills))\b/i,
  /\b(don'?t (go to|see) a doctor|doctors are lying)\b/i,
  /\b(drink (bleach|bleaching|kerosene)|take (10|20|all) pills)\b/i,
  /\b(cure depression with|cure cancer with lemon)\b/i,
]

export const SEVERE_ABUSE_PATTERNS = [
  /\b(kill yourself|go die|nobody loves you|you should die)\b/i,
  /\b(mar ja saale|mar ja kutte|kaminey|chup chap mar)\b/
]

export const SOFT_FLAG_PATTERNS = [
  /\b(stop crying|you'?re just being dramatic|drama queen|attention seeker)\b/i,
  /\b(grow up|loser|get over it already|you are stupid)\b/i,
  /\b(natak band kar|overacting mat kar|dramebaaz)\b/i,
  /\b(over action cheyyaku|acting apu)\b/i,
  /\b(scene podadha|over ah pannadha)\b/i,
]
