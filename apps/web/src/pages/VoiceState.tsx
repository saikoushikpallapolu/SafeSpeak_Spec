import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSpeechVoice } from '../hooks/useSafeSpeakSocket'
import { sendChatMessage } from '../services/firestoreChat'
import { getOrCreateUserId } from '../services/firestoreMatching'
import { checkModeration, checkCrisisTier } from '../services/safetyAndTranslation'
import type { CharacterId, MatchFoundPayload } from '@safespeak/shared-types'
import './VoiceState.css'

export default function VoiceState() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const myUserId = getOrCreateUserId()

  const rawMatch = sessionStorage.getItem('current_match')
  const matchData: MatchFoundPayload | null = rawMatch ? JSON.parse(rawMatch) : null

  const myId = (matchData?.myCharacter || sessionStorage.getItem('character') || 'owl') as CharacterId
  const myTag = matchData?.myTag || 'You'
  const initialLang = matchData?.myLanguage || 'English'
  const peerLanguage = matchData?.peerLanguage || 'English'

  const { isRecording, transcript, startListening, stopListening, error } = useSpeechVoice()
  const [seconds, setSeconds] = useState(0)
  const [manualText, setManualText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)

  useEffect(() => {
    // Map initial language to speech recognition locale
    let speechLocale = 'en-IN'
    if (initialLang === 'Hindi') speechLocale = 'hi-IN'
    else if (initialLang === 'Telugu') speechLocale = 'te-IN'
    else if (initialLang === 'Tamil') speechLocale = 'ta-IN'

    startListening(speechLocale)
  }, [startListening, initialLang])

  useEffect(() => {
    if (transcript) {
      setManualText(transcript)
    }
  }, [transcript])

  useEffect(() => {
    let interval: any
    if (isRecording) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const handleSend = async () => {
    const textToSend = manualText.trim() || transcript.trim()
    if (!textToSend || !roomId || isSending) return

    // 1. AI Moderation Check
    const mod = checkModeration(textToSend)
    if (mod.verdict === 'blocked') {
      setVoiceError(`⚠️ ${mod.reason || 'Message contains prohibited language or harassment.'}`)
      return
    }

    // 2. AI Crisis Check
    const crisis = checkCrisisTier(textToSend)
    if (crisis === 2) {
      navigate('/safety/crisis')
      return
    }

    setIsSending(true)
    stopListening()

    try {
      await sendChatMessage(
        roomId,
        myUserId,
        myId,
        myTag,
        initialLang,
        textToSend,
        true, // isVoice
        peerLanguage
      )
      navigate(-1)
    } catch (e) {
      console.error('[SafeSpeak Voice] Send error:', e)
      setVoiceError('Failed to send voice note. Please try again.')
      setIsSending(false)
    }
  }

  const toggleRecord = () => {
    if (isRecording) {
      stopListening()
    } else {
      setSeconds(0)
      setVoiceError(null)
      let speechLocale = 'en-IN'
      if (initialLang === 'Hindi') speechLocale = 'hi-IN'
      else if (initialLang === 'Telugu') speechLocale = 'te-IN'
      else if (initialLang === 'Tamil') speechLocale = 'ta-IN'
      startListening(speechLocale)
    }
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="voice-page">
      <div className="voice-bg" aria-hidden />

      <motion.div
        className="voice-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <h1 className="voice-title font-display">
          {isRecording ? 'Listening…' : manualText ? 'Ready to send' : 'Tap mic to speak'}
        </h1>
        <p className="voice-sub font-body">
          {voiceError || error || 'Speak naturally in your language. It will be transcribed and translated.'}
        </p>

        {/* Real-time transcribed text preview / editable input */}
        <div className="voice-transcript-container">
          <textarea
            className="voice-transcript-card font-body"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Your voice transcription will appear here (or type/edit directly)…"
            rows={3}
          />
        </div>

        {/* Waveform visual */}
        <div className={`voice-wave ${isRecording ? 'voice-wave--active' : ''}`} aria-label="Voice waveform">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="voice-wave__bar"
              style={{
                height: isRecording
                  ? `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 30}%`
                  : '20%',
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Duration */}
        <div className="voice-timer font-mono">{formatTime(seconds)}</div>

        {/* Actions */}
        <div className="voice-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)} disabled={isSending}>
            Cancel
          </button>
          <motion.button
            className={`voice-mic-btn ${isRecording ? 'voice-mic-btn--recording' : ''}`}
            onClick={toggleRecord}
            whileTap={{ scale: 0.9 }}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              {isRecording
                ? <rect x="9" y="9" width="10" height="10" rx="2" fill="currentColor" />
                : <rect x="9.5" y="6.5" width="9" height="12" rx="4.5" stroke="currentColor" strokeWidth="2" />
              }
            </svg>
          </motion.button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!manualText.trim() || isSending}
          >
            {isSending ? 'Sending…' : 'Send Voice Note'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
