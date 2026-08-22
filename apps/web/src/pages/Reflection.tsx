import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCharacterById, CHARACTERS } from '../data/characters'
import { soundFx } from '../services/soundFx'
import type { CharacterId, ReflectionSummary } from '@safespeak/shared-types'
import './Reflection.css'

const REACTIONS = [
  { emoji: '🌿', label: 'I felt heard' },
  { emoji: '☀️', label: 'This helped' },
  { emoji: '🌊', label: 'I needed this' },
  { emoji: '🤍', label: 'Thank you' },
]

export default function Reflection() {
  const navigate = useNavigate()
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)

  const rawSummary = sessionStorage.getItem('reflection_summary')
  const summary: ReflectionSummary | null = rawSummary ? JSON.parse(rawSummary) : null

  const myId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const me = getCharacterById(myId) || CHARACTERS[0]

  const topicsText = summary?.topicsDiscussed?.join(', ') || 'exam pressure, carrying daily stress'
  const takeawaysText = summary?.helpfulTakeaways?.join(', ') || 'being heard, sharing strategies'
  const durationText = summary?.durationMinutes ? `about ${summary.durationMinutes} minute${summary.durationMinutes > 1 ? 's' : ''}` : 'about 5 minutes'

  const handleReaction = (label: string) => {
    setSelectedReaction(label)
    soundFx.playReactionSparkle()
  }

  const handleFindNewMatch = () => {
    // Wipe past match data and chat
    sessionStorage.removeItem('current_match')
    sessionStorage.removeItem('reflection_summary')
    navigate('/matching')
  }

  const handleStartFresh = () => {
    // Strictly one-time: wipe all session state
    sessionStorage.clear()
    navigate('/characters')
  }

  const handleLeaveToRooms = () => {
    sessionStorage.clear()
    navigate('/rooms')
  }

  return (
    <div className="reflection-page">
      <motion.div
        className="reflection-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Closing visual */}
        <div className="reflection-close">
          <span className="reflection-close__char">{me.emoji}</span>
          <div className="reflection-close__arrow">✦</div>
          <span className="reflection-close__char">🤍</span>
        </div>

        <h1 className="reflection-title font-display">That took courage.</h1>
        <p className="reflection-sub font-body">
          Here's a gentle reflection of what came up in your conversation today. Your past chat has been completely wiped.
        </p>

        {/* Summary card */}
        <div className="reflection-summary">
          <div className="reflection-summary__item">
            <span className="reflection-summary__label font-mono">You talked about</span>
            <span className="reflection-summary__value font-body">{topicsText}</span>
          </div>
          <div className="reflection-summary__item">
            <span className="reflection-summary__label font-mono">What seemed to help</span>
            <span className="reflection-summary__value font-body">{takeawaysText}</span>
          </div>
          <div className="reflection-summary__item">
            <span className="reflection-summary__label font-mono">Session length</span>
            <span className="reflection-summary__value font-body">{durationText}</span>
          </div>
        </div>

        {/* Reactions */}
        <p className="reflection-reactions-label font-body">
          {selectedReaction ? '✨ Encouragement reaction sent' : 'Leave a silent reaction for the other person?'}
        </p>
        <div className="reflection-reactions">
          {REACTIONS.map((r) => (
            <motion.button
              key={r.label}
              className={`reaction-btn ${selectedReaction === r.label ? 'reaction-btn--active' : ''}`}
              onClick={() => handleReaction(r.label)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={r.label}
              title={r.label}
            >
              <span className="reaction-btn__emoji">{r.emoji}</span>
              <span className="reaction-btn__label font-body">{r.label}</span>
            </motion.button>
          ))}
        </div>

        {/* CTA row (strictly one-time sessions) */}
        <div className="reflection-ctas" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button className="btn btn-primary" onClick={handleFindNewMatch}>
            <span>⚡ Find a New Match</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5a5.5 5.5 0 0 1 3.9 1.6L14 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn btn-secondary" onClick={handleStartFresh}>
            <span>🔄 Change Character & Start Fresh</span>
          </button>
        </div>

        <button
          className="btn btn-ghost font-mono"
          onClick={handleLeaveToRooms}
          style={{ marginTop: 'var(--space-2)' }}
        >
          Browse themed group rooms instead →
        </button>

        <p className="reflection-privacy-note font-mono">
          🔒 No chat history is saved. This previous conversation is permanently wiped from memory.
        </p>
      </motion.div>
    </div>
  )
}
