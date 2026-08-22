import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { getCharacterById } from '../data/characters'
import { CharacterModelRenderer } from '../components/characters/CharacterModels'
import { useMatching } from '../hooks/useSafeSpeakSocket'
import type { CharacterId } from '@safespeak/shared-types'
import './Matching.css'

export default function Matching() {
  const navigate = useNavigate()
  const charId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const character = getCharacterById(charId)
  const isJoinedRef = useRef(false)

  const { joinQueue, leaveQueue, socketConnected } = useMatching((payload) => {
    console.log('[SafeSpeak Frontend] 🎉 Match found! Navigating to /match-found:', payload)
    navigate('/match-found')
  })

  useEffect(() => {
    if (!isJoinedRef.current) {
      isJoinedRef.current = true
      const rawAnswers = sessionStorage.getItem('checkin_answers')
      const checkin = rawAnswers
        ? JSON.parse(rawAnswers)
        : { topics: ['exam'], heaviness: 3, languages: ['English'] }

      console.log('[SafeSpeak Frontend] Enqueuing character:', charId)
      joinQueue(charId, checkin)
    }

    return () => {
      leaveQueue()
    }
  }, [charId, joinQueue, leaveQueue])

  const handleSkipToRooms = () => {
    leaveQueue()
    navigate('/rooms')
  }

  return (
    <div className="matching-page">
      {/* Ambient rings */}
      <div className="matching-rings" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="matching-ring" style={{ animationDelay: `${i * 0.8}s` }} />
        ))}
      </div>

      {/* Character */}
      <motion.div
        className="matching-char"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 3]} intensity={1.2} />
          <directionalLight position={[-2, -1, -2]} intensity={0.3} color={character?.accentColor || '#C9A84C'} />
          <Suspense fallback={null}>
            <CharacterModelRenderer id={charId} />
          </Suspense>
        </Canvas>
      </motion.div>

      {/* Copy */}
      <motion.div
        className="matching-copy"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h1 className="matching-copy__title">Looking for someone<br />carrying something similar…</h1>
        <p className="matching-copy__sub">Connecting with an anonymous peer in real-time.</p>

        {/* Live connection status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          fontSize: '12px',
          color: socketConnected ? '#4ade80' : '#facc15',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '4px 12px',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: socketConnected ? '#4ade80' : '#facc15',
            boxShadow: socketConnected ? '0 0 6px #4ade80' : '0 0 6px #facc15',
            display: 'inline-block'
          }} />
          {socketConnected ? '● Connected to SafeSpeak Cloud — searching for a peer…' : '● Connecting to SafeSpeak Cloud…'}
        </div>
      </motion.div>

      {/* Pulsing dots */}
      <div className="matching-dots" aria-label="Searching" role="status">
        {[0, 1, 2].map((i) => (
          <div key={i} className="matching-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>

      {/* Skip to rooms */}
      <motion.button
        className="btn btn-ghost matching-skip"
        onClick={handleSkipToRooms}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Browse themed rooms instead
      </motion.button>
    </div>
  )
}
