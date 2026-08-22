import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { getCharacterById, CHARACTERS } from '../data/characters'
import { CharacterModelRenderer } from '../components/characters/CharacterModels'
import './MatchFound.css'

export default function MatchFound() {
  const navigate = useNavigate()
  const myId = sessionStorage.getItem('character') || 'owl'
  const otherId = CHARACTERS.find(c => c.id !== myId)?.id || 'deer'
  const me = getCharacterById(myId)!
  const other = getCharacterById(otherId)!

  const sharedContext = 'exam stress'

  return (
    <div className="matchfound-page">
      {/* Burst glow */}
      <div className="matchfound-burst" aria-hidden />

      {/* Two characters */}
      <div className="matchfound-chars">
        {/* My character — slides from left */}
        <motion.div
          className="matchfound-char"
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 5, 3]} intensity={1.2} />
            <directionalLight position={[-2, -1, -2]} intensity={0.3} color={me.accentColor} />
            <Suspense fallback={null}><CharacterModelRenderer id={myId} hovered /></Suspense>
          </Canvas>
          <span className="matchfound-char__label">{me.name}</span>
        </motion.div>

        {/* Burst icon in center */}
        <motion.div
          className="matchfound-heart"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          🌿
        </motion.div>

        {/* Other character — slides from right */}
        <motion.div
          className="matchfound-char"
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 5, 3]} intensity={1.2} />
            <directionalLight position={[-2, -1, -2]} intensity={0.3} color={other.accentColor} />
            <Suspense fallback={null}><CharacterModelRenderer id={otherId} hovered /></Suspense>
          </Canvas>
          <span className="matchfound-char__label">{other.name}</span>
        </motion.div>
      </div>

      {/* Shared context reveal */}
      <motion.div
        className="matchfound-context"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <p className="matchfound-context__you-both">You're both carrying</p>
        <h1 className="matchfound-context__topic">{sharedContext}</h1>
      </motion.div>

      {/* Icebreaker */}
      <motion.div
        className="matchfound-icebreaker"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <p className="matchfound-icebreaker__label">💬 Maybe start with:</p>
        <p className="matchfound-icebreaker__text">
          "How long has it been feeling this way for you?"
        </p>
      </motion.div>

      {/* CTA */}
      <motion.button
        className="btn btn-primary matchfound-cta"
        onClick={() => navigate('/chat/demo')}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Start talking
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>
    </div>
  )
}
