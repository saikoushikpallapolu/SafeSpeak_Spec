import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './CrisisOverlay.css'

const HELPLINES = [
  {
    name: 'KIRAN',
    desc: 'Govt of India · 24×7 · 13 languages',
    number: '1800-599-0019',
    tag: 'Free Helpline',
  },
  {
    name: 'Tele-MANAS',
    desc: 'Govt of India · 24×7 Comprehensive Support',
    number: '14416',
    tag: 'Toll-Free',
  },
  {
    name: 'Vandrevala Foundation',
    desc: '24×7 Immediate Emotional Crisis Support',
    number: '1860-266-2345',
    tag: '24×7 Active',
  },
]

export default function CrisisOverlay() {
  const navigate = useNavigate()

  return (
    <div className="crisis-page">
      <div className="crisis-bg" aria-hidden />

      <motion.div
        className="crisis-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Header */}
        <div className="crisis-header">
          <div className="crisis-header__icon">🤍</div>
          <h1 className="crisis-header__title">We want to make sure you're safe.</h1>
          <p className="crisis-header__sub">
            Talking to someone trained in supportive care can truly help right now.
            You do not need to share who you are.
          </p>
        </div>

        {/* Helplines */}
        <div className="crisis-helplines">
          {HELPLINES.map((h) => (
            <div key={h.name} className="crisis-helpline">
              <div className="crisis-helpline__info">
                <div className="crisis-helpline__name-row">
                  <span className="crisis-helpline__name">{h.name}</span>
                  <span className="badge font-mono">{h.tag}</span>
                </div>
                <p className="crisis-helpline__desc">{h.desc}</p>
              </div>
              <a
                href={`tel:${h.number.split(' ')[0]}`}
                className="crisis-call-btn"
                aria-label={`Call ${h.name} at ${h.number}`}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3.5 2.5A1 1 0 015 2h1.5a1 1 0 011 .857l.5 3a1 1 0 01-.52 1.05L6.4 7.6a8 8 0 004 4l.693-1.08A1 1 0 0112.143 10l3 .5A1 1 0 0116 11.5V13a1 1 0 01-1 1h-.5C7.82 14 2 8.18 2 1.5V1a1 1 0 011-1h1.5" fill="currentColor" />
                </svg>
                <span>{h.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Safe button */}
        <button
          className="btn btn-ghost crisis-safe-btn"
          onClick={() => navigate(-1)}
        >
          I'm safe, take me back to chat
        </button>
      </motion.div>
    </div>
  )
}
