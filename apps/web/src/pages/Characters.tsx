import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CHARACTERS } from '../data/characters'
import CharacterCard from '../components/characters/CharacterCard'
import './Characters.css'

export default function Characters() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const handleContinue = () => {
    if (selected) {
      sessionStorage.setItem('character', selected)
      navigate('/checkin')
    }
  }

  return (
    <div className="chars-page">
      {/* Header */}
      <motion.header
        className="chars-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="chars-header__logo">SafeSpeak</div>
        <div style={{ width: 40 }} />
      </motion.header>

      {/* Title */}
      <motion.div
        className="chars-title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <h1 className="chars-title__h1">Who feels like you<br />right now?</h1>
        <p className="chars-title__sub">Pick the one that's closest. This is just your face for this session.</p>
      </motion.div>

      {/* Grid */}
      <motion.div
        className="chars-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {CHARACTERS.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
          >
            <CharacterCard
              character={char}
              selected={selected === char.id}
              hovered={hovered === char.id}
              onSelect={() => setSelected(char.id)}
              onHover={(v) => setHovered(v ? char.id : null)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* CTA — slides up when character is selected */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="chars-cta"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <p className="chars-cta__confirm">
              This is me, for now.
            </p>
            <motion.button
              className="btn btn-primary chars-cta__btn"
              onClick={handleContinue}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Continue as {CHARACTERS.find(c => c.id === selected)?.name}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy note */}
      <p className="chars-privacy">🔒 Nothing here is saved against your identity</p>
    </div>
  )
}
