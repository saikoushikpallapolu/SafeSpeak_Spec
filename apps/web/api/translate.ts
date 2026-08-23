export default async function handler(req: any, res: any) {
  // Enable CORS headers for safety
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const text = (req.query?.text || req.body?.text || '').toString().trim()
  const target = (req.query?.to || req.body?.to || 'en').toString().trim()

  if (!text) {
    return res.status(200).json({ translatedText: '', originalText: '' })
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join('')
        if (translated && translated.trim()) {
          return res.status(200).json({
            translatedText: translated.trim(),
            originalText: text,
            targetLang: target,
          })
        }
      }
    }
  } catch (err) {
    console.warn('[Vercel Serverless Translate] Google GTX fallback:', err)
  }

  // Fallback: MyMemory API
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${encodeURIComponent(target)}`
    const controller2 = new AbortController()
    const timeout2 = setTimeout(() => controller2.abort(), 3000)
    const res2 = await fetch(mmUrl, { signal: controller2.signal })
    clearTimeout(timeout2)

    if (res2.ok) {
      const json = await res2.json()
      if (json?.responseData?.translatedText && json.responseData.translatedText.trim()) {
        return res.status(200).json({
          translatedText: json.responseData.translatedText.trim(),
          originalText: text,
          targetLang: target,
        })
      }
    }
  } catch (err2) {
    console.warn('[Vercel Serverless Translate] MyMemory fallback:', err2)
  }

  return res.status(200).json({ translatedText: text, originalText: text })
}
