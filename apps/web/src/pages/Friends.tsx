import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Friends.css'

const DEMO_FRIENDS = [
  { tag: 'StressedOwl#1204', emoji: '🦉', lastSeen: '2 days ago', accentColor: '#C9A84C' },
  { tag: 'TiredCapybara#8821', emoji: '🦦', lastSeen: '5 days ago', accentColor: '#C9A84C' },
]

export default function Friends() {
  const navigate = useNavigate()
  const myTag = sessionStorage.getItem('character') === 'panda' ? 'QuietPanda#3847' : 'StressedOwl#4821'

  return (
    <div className="friends-page">
      <header className="friends-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="friends-header__title">Anonymous Friends</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="friends-body container">
        {/* Your tag */}
        <motion.div className="friends-my-tag" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="friends-my-tag__label">Your anonymous tag</p>
          <p className="friends-my-tag__value">{myTag}</p>
          <p className="friends-my-tag__note">This is how others will see you. It never reveals who you are.</p>
        </motion.div>

        {/* Friends list */}
        {DEMO_FRIENDS.length > 0 ? (
          <div className="friends-list">
            {DEMO_FRIENDS.map((f, i) => (
              <motion.div key={f.tag} className="friend-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}>
                <div className="friend-card__avatar" style={{ background: `${f.accentColor}15`, border: `1.5px solid ${f.accentColor}30` }}>
                  {f.emoji}
                </div>
                <div className="friend-card__info">
                  <p className="friend-card__tag">{f.tag}</p>
                  <p className="friend-card__last">Last seen {f.lastSeen}</p>
                </div>
                <div className="friend-card__actions">
                  <button className="btn btn-primary friend-card__chat" onClick={() => navigate('/chat/demo')}>Chat</button>
                  <button className="btn btn-ghost friend-card__remove" aria-label="Remove friend">✕</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="friends-empty">
            <p>🌿 No anonymous friends yet.</p>
            <p>After a good conversation, you can reconnect here — no identity needed.</p>
          </div>
        )}

        <button className="btn btn-primary friends-match-btn" onClick={() => navigate('/characters')}>
          Find a new match
        </button>
      </div>
    </div>
  )
}
