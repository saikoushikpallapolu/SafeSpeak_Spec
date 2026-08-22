import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './CheckIn.css'

const TOPICS = [
  { id: 'exam', label: 'Exam pressure', emoji: '📚' },
  { id: 'body', label: 'Body image & self-worth', emoji: '🪞' },
  { id: 'family', label: 'Family expectations', emoji: '🏠' },
  { id: 'lonely', label: 'Feeling invisible / lonely', emoji: '🌙' },
  { id: 'work', label: 'Burnout & work stress', emoji: '💼' },
  { id: 'sleep', label: "Racing thoughts / can't sleep", emoji: '⏳' },
  { id: 'habit', label: 'Over-relying on a coping habit', emoji: '🌀' },
  { id: 'unnamed', label: "Something I can't name yet", emoji: '🌫️' },
]

const LANGUAGES = [
  { id: 'en', label: 'English', sub: 'Global' },
  { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
  { id: 'te', label: 'తెలుగు', sub: 'Telugu' },
  { id: 'ta', label: 'தமிழ்', sub: 'Tamil' },
  { id: 'hl', label: 'Hinglish', sub: 'Colloquial mix' },
  { id: 'mix', label: 'Multilingual Mix', sub: 'Speak naturally' },
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
          className="btn btn-ghost checkin-header__back"
          onClick={() => stepIndex > 0 ? setStep(STEPS[stepIndex - 1]) : navigate(-1)}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm">Back</span>
        </button>

        {/* Progress indicator */}
        <div className="checkin-progress" role="progressbar" aria-valuemax={3} aria-valuenow={stepIndex + 1}>
          {STEPS.map((s, i) => (
            <div key={s} className={`checkin-progress__dot ${i <= stepIndex ? 'checkin-progress__dot--active' : ''}`} />
          ))}
        </div>

        <div className="checkin-step-label font-mono">
          0{stepIndex + 1} / 03
        </div>
      </header>

      {/* Step content */}
      <div className="checkin-body">
        <AnimatePresence mode="wait">
          {/* STEP 1 — Topics */}
          {step === 'topics' && (
            <motion.div
              key="topics"
              className="checkin-step"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <span className="checkin-step-tag font-mono">STEP 01 — CONTEXT</span>
              <h1 className="checkin-step__title">What's been on your mind lately?</h1>
              <p className="checkin-step__sub">Pick anything that feels true right now. This helps match you with someone on the same wavelength.</p>
              <div className="topic-grid">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    className={`topic-chip ${topics.includes(t.id) ? 'topic-chip--selected' : ''}`}
                    onClick={() => toggleTopic(t.id)}
                  >
                    <span className="topic-chip__emoji">{t.emoji}</span>
                    <span className="topic-chip__label">{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Intensity */}
          {step === 'intensity' && (
            <motion.div
              key="intensity"
              className="checkin-step"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <span className="checkin-step-tag font-mono">STEP 02 — INTENSITY</span>
              <h1 className="checkin-step__title">How heavy has it felt?</h1>
              <p className="checkin-step__sub">Zero judgment — this is solely to ensure thoughtful matching.</p>

              <div className="intensity-widget">
                <div className="intensity-track">
                  <div className="intensity-fill" style={{ width: `${((intensity - 1) / 4) * 100}%` }} />
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="intensity-slider"
                    aria-label="Intensity level"
                  />
                </div>
                <div className="intensity-labels font-mono">
                  {['Mild', 'Noticeable', 'Heavy', 'Intense', 'Overwhelming'].map((l, i) => (
                    <span key={i} className={`intensity-label ${intensity === i + 1 ? 'intensity-label--active' : ''}`}>
                      {l}
                    </span>
                  ))}
                </div>
                <div className="intensity-emoji-display">
                  <span className="intensity-emoji">{['☁️', '🌧️', '⛈️', '🌪️', '⚡'][intensity - 1]}</span>
                  <p className="intensity-desc font-display italic">
                    {[
                      'A quiet lingering feeling in the background.',
                      'Noticeable enough to interrupt your daily rhythm.',
                      'Heavy and taking up significant emotional space.',
                      'Intense, making it difficult to focus or unwind.',
                      'Overwhelming — you just need a safe space to breathe and talk.'
                    ][intensity - 1]}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Language */}
          {step === 'language' && (
            <motion.div
              key="language"
              className="checkin-step"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <span className="checkin-step-tag font-mono">STEP 03 — LANGUAGE</span>
              <h1 className="checkin-step__title">Which language feels most natural?</h1>
              <p className="checkin-step__sub">You can type or speak in this language. SafeSpeak translates in real-time so both participants read seamlessly.</p>
              <div className="lang-grid">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    className={`lang-pill ${language === l.id ? 'lang-pill--selected' : ''}`}
                    onClick={() => setLanguage(l.id)}
                  >
                    <span className="lang-pill__label">{l.label}</span>
                    {l.sub && <span className="lang-pill__sub font-mono">{l.sub}</span>}
                  </button>
                ))}
              </div>

              <div className="checkin-disclaimer">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                  <path d="M9 8v4M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p>SafeSpeak is not a medical diagnostic tool. Everything is confidential, unlogged, and session-only.</p>
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
          whileTap={canProceed ? { scale: 0.98 } : {}}
        >
          <span>{step === 'language' ? 'Begin Matching' : 'Continue'}</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 9H14.25M10.5 5.25L14.25 9L10.5 12.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
