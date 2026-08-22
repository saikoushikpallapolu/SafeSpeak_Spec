import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Resources.css'

const HELPLINES = [
  { name: 'KIRAN', desc: 'Govt of India · 24×7 · 13 languages', number: '1800-599-0019', emoji: '🌿' },
  { name: 'Tele-MANAS', desc: 'Govt of India · 24×7', number: '14416 / 1-800-891-4416', emoji: '🌙' },
  { name: 'Vandrevala Foundation', desc: 'Mental health crisis line · 24×7', number: '1860-266-2345', emoji: '☀️' },
]

export default function Resources() {
  const navigate = useNavigate()

  return (
    <div className="resources-page">
      <header className="resources-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="resources-header__title">Help & Resources</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="resources-body container">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="resources-section-title">📞 Helplines</h2>
          <div className="resources-helplines">
            {HELPLINES.map((h) => (
              <div key={h.name} className="resources-helpline-card">
                <span className="resources-helpline-card__emoji">{h.emoji}</span>
                <div className="resources-helpline-card__info">
                  <p className="resources-helpline-card__name">{h.name}</p>
                  <p className="resources-helpline-card__desc">{h.desc}</p>
                  <a href={`tel:${h.number.split(' ')[0]}`} className="resources-helpline-card__number">
                    {h.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="resources-section-title">🔒 Your Privacy</h2>
          <div className="card">
            <ul className="resources-privacy-list">
              {['No names, no photos, no accounts.', 'Cartoon character = your only identity, chosen fresh each session.', 'No chat history saved against a person.', 'Session ends → nothing links back to who was in it.'].map((item) => (
                <li key={item} className="resources-privacy-list__item">
                  <span className="resources-privacy-list__dot">🌿</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="resources-section-title">💬 What is SafeSpeak?</h2>
          <div className="card">
            <p className="resources-about">
              SafeSpeak is an anonymous space to talk about what's been heavy.
              Two people with similar experiences, each in their own language — real translation, real understanding, no judgment.
              <br /><br />
              We're not a therapy service. We don't diagnose. We're just here to make sure talking feels a little safer.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
