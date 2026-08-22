import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { CHARACTERS } from '../data/characters'
import { CharacterModelRenderer } from '../components/characters/CharacterModels'
import './Characters.css'

const slideVariants: any = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.92,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
    },
  }),
}

export default function Characters() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentChar = CHARACTERS[currentIndex]

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      let next = prev + newDirection
      if (next < 0) next = CHARACTERS.length - 1
      if (next >= CHARACTERS.length) next = 0
      return next
    })
  }

  const jumpTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        paginate(1)
      } else if (e.key === 'ArrowLeft') {
        paginate(-1)
      } else if (e.key === 'Enter') {
        handleSelect()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  // Touch swipe support for mobile
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      paginate(1)
    } else if (isRightSwipe) {
      paginate(-1)
    }
  }

  const handleSelect = () => {
    sessionStorage.setItem('character', currentChar.id)
    navigate('/checkin')
  }

  return (
    <div
      className="char-showcase-page"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background ambient lighting */}
      <div className="char-showcase-bg-glow" aria-hidden />

      {/* Top Navigation Bar */}
      <header className="char-showcase-header">
        <button
          className="btn btn-ghost char-showcase-back"
          onClick={() => navigate('/')}
          aria-label="Go back to home"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="char-showcase-back__text">Back</span>
        </button>

        {/* Segmented Progress Indicator */}
        <div className="char-showcase-pagination" role="tablist" aria-label="Characters">
          {CHARACTERS.map((c, i) => (
            <button
              key={c.id}
              className={`char-pagination-seg ${i === currentIndex ? 'char-pagination-seg--active' : ''}`}
              onClick={() => jumpTo(i)}
              aria-label={`View ${c.name} the ${c.animal}`}
              title={`${c.name} (${c.animal})`}
            />
          ))}
        </div>

        <div className="char-showcase-counter font-mono">
          <span className="char-counter-cur">0{currentIndex + 1}</span>
          <span className="char-counter-sep">/</span>
          <span className="char-counter-tot">0{CHARACTERS.length}</span>
        </div>
      </header>

      {/* Main Showcase Body */}
      <div className="char-showcase-main">
        {/* Desktop Previous Arrow */}
        <button
          className="char-nav-arrow char-nav-arrow--prev"
          onClick={() => paginate(-1)}
          aria-label="Previous character"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Animated Single Character View */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentChar.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="char-showcase-card"
          >
            {/* 3D Model Hero Presentation */}
            <div className="char-showcase-canvas-wrap">
              <Canvas
                camera={{ position: [0, 0, 3.4], fov: 40 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
              >
                <ambientLight intensity={1.4} />
                <directionalLight position={[4, 6, 4]} intensity={2.2} color="#FFFFFF" />
                <directionalLight position={[-4, -2, -3]} intensity={1.0} color="#FFFFFF" />
                <pointLight position={[0, 2, 2]} intensity={1.5} color="#FFFFFF" />
                <hemisphereLight args={['#FFFFFF', '#333333', 1.0]} />
                <Suspense fallback={null}>
                  <CharacterModelRenderer id={currentChar.id} hovered selected />
                </Suspense>
              </Canvas>

              <div className="char-3d-hint">
                <span>3D Model · Interactive</span>
              </div>
            </div>

            {/* Content & Descriptions */}
            <div className="char-showcase-info">
              <div className="char-showcase-tagline-bubble">
                <span className="char-tagline-quote">"{currentChar.tagline}"</span>
              </div>

              <h1 className="char-showcase-name">
                {currentChar.name}
              </h1>

              <blockquote className="char-showcase-quote">
                "{currentChar.situation}"
              </blockquote>

              <p className="char-showcase-desc">
                {currentChar.description}
              </p>

              <p className="char-showcase-context">
                {currentChar.deeperContext}
              </p>

              {/* Trait Chips */}
              <div className="char-trait-pills">
                {currentChar.traits.map((trait) => (
                  <span key={trait} className="char-trait-pill">
                    {trait}
                  </span>
                ))}
              </div>

              {/* CTA Button for this specific character */}
              <div className="char-showcase-actions">
                <motion.button
                  className="btn btn-primary char-select-btn"
                  onClick={handleSelect}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Select {currentChar.name} as my Face</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3.75 9H14.25M10.5 5.25L14.25 9L10.5 12.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
                <p className="char-select-privacy">
                  🔒 Anonymous session · No personal profile created
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Desktop Next Arrow */}
        <button
          className="char-nav-arrow char-nav-arrow--next"
          onClick={() => paginate(1)}
          aria-label="Next character"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Quick Jump Thumbnail Bar */}
      <footer className="char-showcase-footer">
        <div className="char-thumbs-row">
          {CHARACTERS.map((c, i) => (
            <button
              key={c.id}
              className={`char-thumb-btn ${i === currentIndex ? 'char-thumb-btn--active' : ''}`}
              onClick={() => jumpTo(i)}
            >
              <span className="char-thumb-emoji">{c.emoji}</span>
              <span className="char-thumb-name">{c.name}</span>
            </button>
          ))}
        </div>
        <p className="char-swipe-tip">
          ← Swipe or use arrow keys to browse other companions →
        </p>
      </footer>
    </div>
  )
}
