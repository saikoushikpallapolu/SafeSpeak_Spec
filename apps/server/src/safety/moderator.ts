import { evaluateModeration } from '@safespeak/crisis-keywords'
import { ModerationResult } from '@safespeak/shared-types'

export function checkModeration(text: string): ModerationResult {
  return evaluateModeration(text)
}
