import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { getCharacterById, CHARACTERS } from '../data/characters'
import { CharacterModelRenderer } from '../components/characters/CharacterModels'
import './CheckIn.css'

interface QuestionConfig {
  id: number
  key: string
  title: string
  subtitle: string
  companionTip: string
  type: 'single' | 'multi' | 'slider-discrete' | 'slider-numeric' | 'safety'
  options?: { id: string; label: string; sub?: string }[]
  sliderLabels?: string[]
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    key: 'topics',
    title: "What's on your mind today?",
    subtitle: "Select the areas that match what you're feeling right now.",
    companionTip: "Pick whatever feels heavy right now. There are no wrong answers.",
    type: 'multi',
    options: [
      { id: 'exam', label: 'Exam / study pressure' },
      { id: 'family', label: 'Family expectations' },
      { id: 'body', label: 'Body image' },
      { id: 'relationship', label: 'A relationship' },
      { id: 'loneliness', label: 'Loneliness' },
      { id: 'habit', label: 'A habit I want to change' },
      { id: 'sleep', label: 'Sleep' },
      { id: 'work', label: 'Work / career pressure' },
      { id: 'financial', label: 'Financial stress' },
      { id: 'grief', label: 'Grief or loss' },
      { id: 'none', label: 'None of these quite fit' },
    ],
  },
  {
    id: 2,
    key: 'duration',
    title: 'How long has this been on your mind?',
    subtitle: 'Helps understand if this is acute or something you have been carrying for a while.',
    companionTip: "Whether it started an hour ago or months ago, you're in a safe place.",
    type: 'slider-discrete',
    options: [
      { id: 'today', label: 'Just today' },
      { id: 'days', label: 'A few days' },
      { id: 'weeks', label: 'Weeks' },
      { id: 'months', label: 'Months or longer' },
      { id: 'unknown', label: "I don't know how long" },
    ],
  },
  {
    id: 3,
    key: 'heaviness',
    title: 'Right now, how heavy does it feel?',
    subtitle: 'From a manageable background thought to really heavy.',
    companionTip: 'Be honest with yourself. We only use this to calibrate matching.',
    type: 'slider-numeric',
    sliderLabels: ['Manageable', 'Noticeable', 'Heavy', 'Very heavy', 'Really heavy'],
  },
  {
    id: 4,
    key: 'intent',
    title: 'What are you looking for right now?',
    subtitle: 'Helps us connect you with a peer who can offer the right kind of space.',
    companionTip: "Whatever you need right now is completely valid.",
    type: 'single',
    options: [
      { id: 'vent', label: 'Just want to vent' },
      { id: 'talk_through', label: 'Want someone to talk me through it' },
      { id: 'handled', label: 'Want to hear how someone else handled it' },
      { id: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    id: 5,
    key: 'peer_stage',
    title: "Who would you rather talk with?",
    subtitle: "Would you prefer someone currently in the same spot, or someone who's already past it?",
    companionTip: 'Both can be deeply comforting in different ways.',
    type: 'single',
    options: [
      { id: 'currently_in_it', label: 'Currently in it like me', sub: 'Shared present experience' },
      { id: 'already_past_it', label: 'Already past it', sub: 'Perspective from the other side' },
      { id: 'doesnt_matter', label: "Doesn't matter", sub: 'Open to anyone supportive' },
    ],
  },
  {
    id: 6,
    key: 'role',
    title: 'Are you more of a talker or a listener today?',
    subtitle: 'Helps balance the conversation dynamic.',
    companionTip: 'It is okay if your energy changes — just go with how you feel now.',
    type: 'single',
    options: [
      { id: 'talker', label: 'More of a talker today', sub: 'Need to get things off my chest' },
      { id: 'listener', label: 'More of a listener today', sub: 'Happy to listen and hold space' },
      { id: 'balanced', label: 'A balance of both', sub: 'Equal back-and-forth exchange' },
    ],
  },
  {
    id: 7,
    key: 'boundaries',
    title: "Anything you'd rather steer clear of right now?",
    subtitle: 'Select topics or response styles you want to avoid during the chat.',
    companionTip: 'Your boundaries will be respected automatically.',
    type: 'multi',
    options: [
      { id: 'no_advice', label: "Don't want unsolicited advice" },
      { id: 'no_family', label: "Don't want to talk about family" },
      { id: 'no_breakup', label: "Don't want to talk about breakups / relationships" },
      { id: 'no_religious', label: "Don't want religious or spiritual framing" },
      { id: 'no_tough_love', label: "Don't want blunt / tough-love responses" },
      { id: 'no_remedies', label: "Don't want home-remedy or health suggestions" },
      { id: 'open', label: "Nothing, I'm open to anything" },
    ],
  },
  {
    id: 8,
    key: 'languages',
    title: 'Which language(s) do you want to chat in?',
    subtitle: 'You can select multiple. SafeSpeak translates in real-time between different languages.',
    companionTip: 'Speak in whatever tongue feels most comforting.',
    type: 'multi',
    options: [
      { id: 'Hindi', label: 'Hindi (हिंदी)' },
      { id: 'Telugu', label: 'Telugu (తెలుగు)' },
      { id: 'Tamil', label: 'Tamil (தமிழ்)' },
      { id: 'English', label: 'English' },
      { id: 'Hinglish', label: 'Hinglish / Mixed' },
      { id: 'Other', label: 'Other language' },
    ],
  },
  {
    id: 9,
    key: 'safety',
    title: 'Are you having thoughts of hurting yourself, or feeling unsafe right now?',
    subtitle: 'Your wellbeing is the absolute priority. If you need immediate support, we will guide you to free, confidential crisis helplines.',
    companionTip: "I'm right here with you. Please answer honestly so we can keep you safe.",
    type: 'safety',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      { id: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
]

export default function CheckIn() {
  const navigate = useNavigate()
  const charId = sessionStorage.getItem('character') || 'owl'
  const character = getCharacterById(charId) || CHARACTERS[0]

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({
    topics: [],
    duration: 'today',
    heaviness: 3,
    intent: '',
    peer_stage: '',
    role: '',
    boundaries: [],
    languages: ['English'],
    safety: '',
  })

  const currentQ = QUESTIONS[currentStepIndex]
  const totalQuestions = QUESTIONS.length

  // Multi-select handler
  const handleToggleMulti = (key: string, optionId: string) => {
    setAnswers(prev => {
      const currentList: string[] = prev[key] || []
      
      // Special logic for Q1 "none" or Q7 "open"
      if (optionId === 'none' || optionId === 'open') {
        return { ...prev, [key]: currentList.includes(optionId) ? [] : [optionId] }
      }
      
      const filtered = currentList.filter(id => id !== 'none' && id !== 'open')
      const updated = filtered.includes(optionId)
        ? filtered.filter(id => id !== optionId)
        : [...filtered, optionId]
      return { ...prev, [key]: updated }
    })
  }

  // Single-select handler
  const handleSelectSingle = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  // Next Question logic
  const handleNext = () => {
    // Safety check on question 9
    if (currentQ.id === 9) {
      sessionStorage.setItem('checkin_answers', JSON.stringify(answers))
      if (answers.safety === 'yes') {
        navigate('/safety/crisis')
        return
      }
      navigate('/matching')
      return
    }

    if (currentStepIndex < totalQuestions - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  // Previous Question logic
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    } else {
      navigate('/characters')
    }
  }

  // Can proceed validator
  const canProceed = () => {
    switch (currentQ.type) {
      case 'multi':
        return (answers[currentQ.key] && answers[currentQ.key].length > 0)
      case 'single':
        return Boolean(answers[currentQ.key])
      case 'slider-discrete':
      case 'slider-numeric':
        return true
      case 'safety':
        return Boolean(answers.safety)
      default:
        return true
    }
  }

  return (
    <div className="checkin-split-page">
      {/* Top Header */}
      <header className="checkin-split-header">
        <button
          className="btn btn-ghost checkin-back-btn"
          onClick={handlePrev}
          aria-label="Previous question"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11.25 13.5L6.75 9L11.25 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-xs">BACK</span>
        </button>

        {/* Segmented Progress Tracker */}
        <div className="checkin-progress-tracker" role="progressbar" aria-valuemax={totalQuestions} aria-valuenow={currentStepIndex + 1}>
          {QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              className={`checkin-tracker-dot ${i === currentStepIndex ? 'checkin-tracker-dot--active' : i < currentStepIndex ? 'checkin-tracker-dot--done' : ''}`}
            />
          ))}
        </div>

        <div className="checkin-counter font-mono">
          <span className="checkin-counter__cur">0{currentStepIndex + 1}</span>
          <span className="checkin-counter__sep">/</span>
          <span className="checkin-counter__tot">0{totalQuestions}</span>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="checkin-split-layout">
        
        {/* LEFT COLUMN: 3D Companion Avatar Standing & Speech Bubble */}
        <div className="checkin-companion-col">
          <div className="checkin-companion-card">
            {/* 3D Canvas Viewport */}
            <div className="checkin-avatar-canvas">
              <Canvas
                camera={{ position: [0, 0, 3.4], fov: 40 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
              >
                <ambientLight intensity={0.9} />
                <directionalLight position={[3, 5, 3]} intensity={1.8} color="#FFFFFF" />
                <directionalLight position={[-3, -2, -2]} intensity={0.5} color="#A3A3A3" />
                <pointLight position={[0, 2, 2]} intensity={1.0} color="#FFFFFF" />
                <Suspense fallback={null}>
                  <CharacterModelRenderer id={character.id} hovered selected />
                </Suspense>
              </Canvas>
            </div>

            {/* Companion Dialogue / Tip Bubble */}
            <div className="checkin-companion-dialogue">
              <div className="checkin-dialogue-tag font-mono">
                {character.emoji} {character.name.toUpperCase()} (YOUR COMPANION)
              </div>
              <p className="checkin-dialogue-text font-display">
                "{currentQ.companionTip}"
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Question & Answer Option Card */}
        <div className="checkin-form-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              className="checkin-q-card"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Question Header */}
              <div className="checkin-q-header">
                <span className="checkin-q-badge font-mono">
                  QUESTION 0{currentQ.id} OF 0{totalQuestions}
                </span>
                <h1 className="checkin-q-title font-display">
                  {currentQ.title}
                </h1>
                <p className="checkin-q-subtitle">
                  {currentQ.subtitle}
                </p>
              </div>

              {/* Dynamic Answer Controls */}
              <div className="checkin-q-body">

                {/* 1. Multi-Select Tag List (Q1, Q7, Q8) */}
                {currentQ.type === 'multi' && currentQ.options && (
                  <div className="checkin-options-grid">
                    {currentQ.options.map(opt => {
                      const isSelected = (answers[currentQ.key] || []).includes(opt.id)
                      return (
                        <button
                          key={opt.id}
                          className={`checkin-opt-btn ${isSelected ? 'checkin-opt-btn--selected' : ''}`}
                          onClick={() => handleToggleMulti(currentQ.key, opt.id)}
                        >
                          <div className="checkin-opt-check">
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className="checkin-opt-label">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* 2. Single-Select Card List (Q4, Q5, Q6) */}
                {currentQ.type === 'single' && currentQ.options && (
                  <div className="checkin-single-list">
                    {currentQ.options.map(opt => {
                      const isSelected = answers[currentQ.key] === opt.id
                      return (
                        <button
                          key={opt.id}
                          className={`checkin-single-card ${isSelected ? 'checkin-single-card--selected' : ''}`}
                          onClick={() => handleSelectSingle(currentQ.key, opt.id)}
                        >
                          <div className="checkin-single-radio">
                            {isSelected && <div className="checkin-radio-dot" />}
                          </div>
                          <div className="checkin-single-info">
                            <span className="checkin-single-label">{opt.label}</span>
                            {opt.sub && <span className="checkin-single-sub">{opt.sub}</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* 3. Discrete Step Slider (Q2: Duration) */}
                {currentQ.type === 'slider-discrete' && currentQ.options && (
                  <div className="checkin-discrete-slider-wrap">
                    <div className="checkin-discrete-cards">
                      {currentQ.options.map(opt => {
                        const isSelected = answers.duration === opt.id
                        return (
                          <button
                            key={opt.id}
                            className={`checkin-discrete-btn ${isSelected ? 'checkin-discrete-btn--selected' : ''}`}
                            onClick={() => handleSelectSingle('duration', opt.id)}
                          >
                            <span className="checkin-discrete-label font-body">{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Numeric Heaviness Slider (Q3: 1-5 scale) */}
                {currentQ.type === 'slider-numeric' && (
                  <div className="checkin-heaviness-widget">
                    <div className="checkin-heaviness-track">
                      <div
                        className="checkin-heaviness-fill"
                        style={{ width: `${((answers.heaviness - 1) / 4) * 100}%` }}
                      />
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={answers.heaviness}
                        onChange={(e) => handleSelectSingle('heaviness', Number(e.target.value))}
                        className="checkin-range-input"
                        aria-label="Heaviness rating"
                      />
                    </div>
                    <div className="checkin-heaviness-labels font-mono">
                      {(currentQ.sliderLabels || []).map((l, i) => (
                        <span
                          key={i}
                          className={`checkin-heaviness-label ${answers.heaviness === i + 1 ? 'checkin-heaviness-label--active' : ''}`}
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                    <div className="checkin-heaviness-badge font-display">
                      Level {answers.heaviness} of 5 — {currentQ.sliderLabels?.[answers.heaviness - 1]}
                    </div>
                  </div>
                )}

                {/* 5. Safety Question (Q9) */}
                {currentQ.type === 'safety' && currentQ.options && (
                  <div className="checkin-safety-list">
                    {currentQ.options.map(opt => {
                      const isSelected = answers.safety === opt.id
                      return (
                        <button
                          key={opt.id}
                          className={`checkin-safety-card ${isSelected ? 'checkin-safety-card--selected' : ''} ${opt.id === 'yes' ? 'checkin-safety-card--yes' : ''}`}
                          onClick={() => handleSelectSingle('safety', opt.id)}
                        >
                          <span className="checkin-safety-label">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

              </div>

              {/* Bottom Actions Bar */}
              <div className="checkin-actions-bar">
                <motion.button
                  className="btn btn-primary checkin-next-btn"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  whileHover={canProceed() ? { scale: 1.02 } : {}}
                  whileTap={canProceed() ? { scale: 0.98 } : {}}
                >
                  <span>{currentQ.id === totalQuestions ? 'Complete Check-In' : 'Next Question'}</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3.75 9H14.25M10.5 5.25L14.25 9L10.5 12.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
