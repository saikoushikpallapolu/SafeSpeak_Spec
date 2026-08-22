import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Reflection.css'

const REACTIONS = [
  { emoji: '🌿', label: 'I felt heard' },
  { emoji: '☀️', label: 'This helped' },
  { emoji: '🌊', label: 'I needed this' },
  { emoji: '🤍', label: 'Thank you' },
]

export default function Reflection() {
  const navigate = useNavigate()

  return (
    <div className="reflection-page">
      <motion.div className="reflection-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>

        {/* Closing visual */}
        <div className="reflection-close">
          <span className="reflection-close__char">🦉</span>
          <div className="reflection-close__arrow">→</div>
          <span className="reflection-close__char">🦌</span>
        </div>

        <h1 className="reflection-title">That took courage.</h1>
        <p className="reflection-sub">
          Here's a little of what came up today, just for you.
        </p>

        {/* Summary card */}
        <div className="reflection-summary">
          <div className="reflection-summary__item">
            <span className="reflection-summary__label">You talked about</span>
            <span className="reflection-summary__value">exam pressure, focus struggles</span>
          </div>
          <div className="reflection-summary__item">
            <span className="reflection-summary__label">What seemed to help</span>
            <span className="reflection-summary__value">being heard, sharing strategies</span>
          </div>
          <div className="reflection-summary__item">
            <span className="reflection-summary__label">Session length</span>
            <span className="reflection-summary__value">about 8 minutes</span>
          </div>
        </div>

        {/* Reactions */}
        <p className="reflection-reactions-label">Leave a reaction for the other person?</p>
        <div className="reflection-reactions">
          {REACTIONS.map((r) => (
            <motion.button
              key={r.label}
              className="reaction-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={r.label}
              title={r.label}
            >
              <span className="reaction-btn__emoji">{r.emoji}</span>
              <span className="reaction-btn__label">{r.label}</span>
            </motion.button>
          ))}
        </div>

        {/* CTA row */}
        <div className="reflection-ctas">
          <button className="btn btn-secondary" onClick={() => navigate('/friends')}>
            Add as Anonymous Friend
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/characters')}>
            Find a new match
          </button>
        </div>

        <button className="btn btn-ghost" onClick={() => navigate('/rooms')} style={{ marginTop: 'var(--space-2)' }}>
          Browse themed rooms instead
        </button>
      </motion.div>
    </div>
  )
}
