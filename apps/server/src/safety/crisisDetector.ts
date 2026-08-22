import { evaluateCrisisTier } from '@safespeak/crisis-keywords'
import { CrisisTier } from '@safespeak/shared-types'

/**
 * Evaluates message text for crisis / distress levels.
 * Returns:
 * 0: Clean
 * 1: Mild concern (stress/overwhelm) -> triggers breathing nudge card
 * 2: Serious crisis / self-harm danger -> immediate helpline overlay & block broadcast
 */
export function checkCrisisTier(text: string): CrisisTier {
  return evaluateCrisisTier(text)
}
