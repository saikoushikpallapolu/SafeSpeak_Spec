import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSpeechVoice } from '../hooks/useSafeSpeakSocket'
import { getSocket } from '../services/socket'
import './VoiceState.css'

export default function VoiceState() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const { isRecording, transcript, startListening, stopListening, error } = useSpeechVoice()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    startListening('en-IN')
  }, [startListening])

  useEffect(() => {
    let interval: any
    if (isRecording) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const handleSend = () => {
    if (transcript && transcript.trim()) {
      const socket = getSocket()
      socket.emit('send_message', {
        roomId,
        text: transcript.trim(),
        isVoice: true,
      })
    }
    navigate(-1)
  }

  const toggleRecord = () => {
    if (isRecording) {
      stopListening()
    } else {
      setSeconds(0)
      startListening('en-IN')
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
          {isRecording ? 'Listening…' : transcript ? 'Ready to send' : 'Tap mic to speak'}
        </h1>
        <p className="voice-sub font-body">
          {error ? error : 'Speak naturally in your language. It will be transcribed and translated.'}
        </p>

        {/* Real-time transcribed text preview */}
        {transcript && (
          <div className="voice-transcript-card font-body">
            "{transcript}"
          </div>
        )}

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
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
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
            disabled={!transcript.trim()}
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  )
}
