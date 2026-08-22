import { ChatMessage, ReflectionSummary } from '@safespeak/shared-types'

export function generateReflectionSummary(
  messages: ChatMessage[],
  characterName: string,
  peerName: string,
  startTimeMs: number
): ReflectionSummary {
  const durationMinutes = Math.max(1, Math.round((Date.now() - startTimeMs) / 60000))
  const messageCount = messages.length

  const allText = messages.map(m => m.text.toLowerCase()).join(' ')

  const detectedTopics: string[] = []
  if (/exam|board|study|grade|marks/i.test(allText)) detectedTopics.push("exam pressure")
  if (/stress|overwhelm|anxiety|tension/i.test(allText)) detectedTopics.push("feeling overwhelmed")
  if (/family|parent|home/i.test(allText)) detectedTopics.push("family expectations")
  if (/sleep|tired|exhaust/i.test(allText)) detectedTopics.push("exhaustion & sleep")
  if (/lonel|alone/i.test(allText)) detectedTopics.push("navigating loneliness")
  if (/focus|concentrat|technique|rule/i.test(allText)) detectedTopics.push("focus strategies")

  if (detectedTopics.length === 0) {
    detectedTopics.push("sharing daily weight", "holding supportive space")
  }

  const takeaways: string[] = [
    "Being heard by someone who relates",
    "Realizing you don't have to carry this completely alone",
  ]

  if (/10-minute|strategy|technique|walk|breath/i.test(allText)) {
    takeaways.push("Discussing gentle coping techniques")
  }

  return {
    topicsDiscussed: detectedTopics.slice(0, 3),
    durationMinutes,
    messageCount,
    helpfulTakeaways: takeaways,
    characterName,
    peerName,
    sentiment: "Supportive and validating",
  }
}
