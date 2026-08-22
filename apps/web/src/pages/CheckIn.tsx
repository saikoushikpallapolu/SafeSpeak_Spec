import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './CheckIn.css'

const TOPICS = [
  { id: 'exam', label: 'Exam pressure', emoji: '📚' },
  { id: 'body', label: 'Body image', emoji: '🪞' },
  { id: 'family', label: 'Family pressure', emoji: '🏠' },
  { id: 'lonely', label: 'Feeling lonely', emoji: '🌙' },
  { id: 'work', label: 'Work stress', emoji: '💼' },
  { id: 'sleep', label: "Can't sleep", emoji: '😶' },
  { id: 'habit', label: 'A habit I rely on', emoji: '🌀' },
  { id: 'unnamed', label: 'Something I can\'t name', emoji: '🌫️' },
]

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
  { id: 'te', label: 'తెలుగు', sub: 'Telugu' },
  { id: 'ta', label: 'தமிழ்', sub: 'Tamil' },
  { id: 'hl', label: 'Hinglish' },
  { id: 'mix', label: 'Mix it up 🎲' },
]

const STEPS = ['topics', 'intensity', 'language'] as const

export default function CheckIn() {
  const navigate = useNavigate()
  const [step, setStep] = useState<typeof STEPS[number]>('topics')
  const [topics, setTopics] = useState<string[]>([])
  const [intensity, setIntensity] = useState(3)
  const [language, setLanguage] = useState('')

  const stepIndex = STEPS.indexOf(step)

  const toggleTopic = (id: string) => {
    setTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1])
    } else {
      sessionStorage.setItem('checkin', JSON.stringify({ topics, intensity, language }))
      navigate('/matching')
    }
  }

  const canProceed =
    (step === 'topics' && topics.length > 0) ||
    step === 'intensity' ||
    (step === 'language' && language !== '')

  return (
    <div className="checkin-page">
      {/* Header */}
      <header className="checkin-header">
        <button
          className="btn btn-ghost"
          onClick={() => stepIndex > 0 ? setStep(STEPS[stepIndex - 1]) : navigate(-1)}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Progress dots */}
        <div className="checkin-progress" role="progressbar" aria-valuemax={3} aria-valuenow={stepIndex + 1}>
          {STEPS.map((s, i) => (
            <div key={s} className={`checkin-progress__dot ${i <= stepIndex ? 'checkin-progress__dot--active' : ''}`} />
          ))}
        </div>

        <div style={{ width: 40 }} />
      </header>

      {/* Step content */}
      <div className="checkin-body">
        <AnimatePresence mode="wait">
          {/* STEP 1 — Topics */}
          {step === 'topics' && (
            <motion.div key="topics" className="checkin-step"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>
              <h1 className="checkin-step__title">What's been on your mind lately?</h1>
              <p className="checkin-step__sub">Pick everything that feels true right now. No right answers.</p>
              <div className="topic-grid">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    className={`topic-chip ${topics.includes(t.id) ? 'topic-chip--selected' : ''}`}
                    onClick={() => toggleTopic(t.id)}
                  >
                    <span className="topic-chip__emoji">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Intensity */}
          {step === 'intensity' && (
            <motion.div key="intensity" className="checkin-step"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>
              <h1 className="checkin-step__title">How heavy has it felt?</h1>
              <p className="checkin-step__sub">No judgement — this just helps us find the right match.</p>

              <div className="intensity-widget">
                <div className="intensity-track">
                  <div className="intensity-fill" style={{ width: `${((intensity - 1) / 4) * 100}%` }} />
                  <input
                    type="range" min={1} max={5} value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="intensity-slider"
                    aria-label="Intensity level"
                  />
                </div>
                <div className="intensity-labels">
                  {['A little', 'Somewhat', 'Quite a bit', 'A lot', 'Overwhelming'].map((l, i) => (
                    <span key={i} className={`intensity-label ${intensity === i + 1 ? 'intensity-label--active' : ''}`}>
                      {l}
                    </span>
                  ))}
                </div>
                <div className="intensity-emoji">
                  {['🌤️', '🌥️', '☁️', '🌧️', '⛈️'][intensity - 1]}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Language */}
          {step === 'language' && (
            <motion.div key="language" className="checkin-step"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>
              <h1 className="checkin-step__title">Which language feels most natural right now?</h1>
              <p className="checkin-step__sub">You'll see the other person's messages in this language.</p>
              <div className="lang-grid">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    className={`lang-pill ${language === l.id ? 'lang-pill--selected' : ''}`}
                    onClick={() => setLanguage(l.id)}
                  >
                    <span className="lang-pill__label">{l.label}</span>
                    {l.sub && <span className="lang-pill__sub">{l.sub}</span>}
                  </button>
                ))}
              </div>

              <div className="checkin-disclaimer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                  <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p>This isn't a diagnosis. It just helps us find the right person for you.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="checkin-footer">
        <motion.button
          className="btn btn-primary checkin-footer__btn"
          onClick={handleNext}
          disabled={!canProceed}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.97 } : {}}
        >
          {step === 'language' ? 'Find my match' : 'Continue'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
