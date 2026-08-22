import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './VoiceState.css'

export default function VoiceState() {
  const navigate = useNavigate()
  const [recording, setRecording] = useState(true)

  return (
    <div className="voice-page">
      <div className="voice-bg" aria-hidden />

      <motion.div className="voice-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>

        <h1 className="voice-title">{recording ? 'Listening…' : 'Ready to send'}</h1>
        <p className="voice-sub">Speak naturally. It'll be translated for them.</p>

        {/* Waveform visual */}
        <div className="voice-wave" aria-label="Voice waveform">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="voice-wave__bar"
              style={{
                height: `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 20}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Duration */}
        <div className="voice-timer">0:03</div>

        {/* Actions */}
        <div className="voice-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <motion.button
            className="voice-mic-btn"
            onClick={() => setRecording(!recording)}
            whileTap={{ scale: 0.9 }}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              {recording
                ? <rect x="9" y="9" width="10" height="10" rx="2" fill="currentColor" />
                : <rect x="9.5" y="6.5" width="9" height="12" rx="4.5" stroke="currentColor" strokeWidth="2" />
              }
            </svg>
          </motion.button>
          <button className="btn btn-primary" onClick={() => navigate(-1)} disabled={recording}>
            Send
          </button>
        </div>
      </motion.div>
    </div>
  )
}
