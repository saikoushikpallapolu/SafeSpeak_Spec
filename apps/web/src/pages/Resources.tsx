import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import FeelingWeather from '../components/common/FeelingWeather'
import SOSButton from '../components/common/SOSButton'
import './Resources.css'

const HELPLINES = [
  {
    name: 'KIRAN',
    desc: 'Govt of India · 24×7 · 13 languages · Free Mental Health Helpline',
    number: '1800-599-0019',
    emoji: '🌿',
    tag: 'Toll-Free',
  },
  {
    name: 'Tele-MANAS',
    desc: 'National Tele Mental Health Programme of India · 24×7 Comprehensive Support',
    number: '14416',
    emoji: '🌙',
    tag: 'Govt 24×7',
  },
  {
    name: 'Vandrevala Foundation',
    desc: 'Free, professional 24×7 mental health and crisis intervention helpline',
    number: '1860-266-2345',
    emoji: '☀️',
    tag: '24×7 Active',
  },
]

const GROUNDING_STEPS = [
  { step: '5', label: 'Things you can SEE around you right now' },
  { step: '4', label: 'Things you can physically TOUCH or feel' },
  { step: '3', label: 'Things you can HEAR in this quiet moment' },
  { step: '2', label: 'Things you can SMELL' },
  { step: '1', label: 'Thing you can TASTE or a deep grounding breath' },
]

export default function Resources() {
  const navigate = useNavigate()
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedNumber(num)
    setTimeout(() => setCopiedNumber(null), 2000)
  }

  return (
    <div className="resources-page">
      <header className="resources-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="resources-header__title font-display">Help & Resources</h1>
        <SOSButton />
      </header>

      <div className="resources-body container">
        {/* Emotional Weather Widget */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <FeelingWeather />
        </motion.section>

        {/* 24x7 Emergency Helplines */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="resources-section-header">
            <h2 className="resources-section-title font-display">📞 Verified 24×7 Helplines (India)</h2>
            <p className="resources-section-sub font-body">Free, confidential, and run by trained professional counsellors.</p>
          </div>

          <div className="resources-helplines">
            {HELPLINES.map((h) => (
              <div key={h.name} className="resources-helpline-card">
                <span className="resources-helpline-card__emoji">{h.emoji}</span>
                <div className="resources-helpline-card__info">
                  <div className="helpline-card-title-row">
                    <p className="resources-helpline-card__name font-display">{h.name}</p>
                    <span className="badge font-mono">{h.tag}</span>
                  </div>
                  <p className="resources-helpline-card__desc font-body">{h.desc}</p>
                  
                  <div className="resources-helpline-actions">
                    <a href={`tel:${h.number.split(' ')[0]}`} className="btn btn-primary helpline-call-btn">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M3.5 2.5A1 1 0 015 2h1.5a1 1 0 011 .857l.5 3a1 1 0 01-.52 1.05L6.4 7.6a8 8 0 004 4l.693-1.08A1 1 0 0112.143 10l3 .5A1 1 0 0116 11.5V13a1 1 0 01-1 1h-.5C7.82 14 2 8.18 2 1.5V1a1 1 0 011-1h1.5" />
                      </svg>
                      <span>Call {h.number}</span>
                    </a>
                    <button
                      className="btn btn-ghost font-mono"
                      onClick={() => handleCopy(h.number)}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {copiedNumber === h.number ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5-4-3-2-1 Sensory Grounding Technique */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="resources-section-title font-display">🍃 5-4-3-2-1 Grounding Technique</h2>
          <div className="card grounding-card">
            <p className="grounding-intro font-body">
              When overwhelming thoughts or panic begin to spiral, this classic sensory exercise brings your awareness back to the physical present.
            </p>
            <div className="grounding-list">
              {GROUNDING_STEPS.map((g) => (
                <div key={g.step} className="grounding-item">
                  <span className="grounding-badge font-mono">{g.step}</span>
                  <span className="grounding-text font-body">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Strict Data Privacy Architecture */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="resources-section-title font-display">🔒 Privacy & Architecture</h2>
          <div className="card">
            <ul className="resources-privacy-list font-body">
              {[
                'Zero login required: No names, photos, emails, phone numbers, or account profiles.',
                'Session-only presence: Your chosen cartoon companion represents you only for the active session.',
                'No message retention: Conversations exist only in memory during the active session and are permanently wiped upon leaving.',
                'Private crisis handling: Safety alerts and grounding cards trigger strictly for the user who needs them without exposing identity.',
              ].map((item) => (
                <li key={item} className="resources-privacy-list__item">
                  <span className="resources-privacy-list__dot">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
