import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { getCharacterById } from '../data/characters'
import { CharacterModelRenderer } from '../components/characters/CharacterModels'
import type { CharacterId, MatchFoundPayload } from '@safespeak/shared-types'
import { joinFirestoreQueue, leaveFirestoreQueue, triggerInstantAiMatch } from '../services/firestoreMatching'
import './Matching.css'

export default function Matching() {
  const navigate = useNavigate()
  const charId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const character = getCharacterById(charId)
  const [secondsWaiting, setSecondsWaiting] = useState(0)

  useEffect(() => {
    let isCancelled = false

    const rawAnswers = sessionStorage.getItem('checkin_answers')
    const checkin = rawAnswers
      ? JSON.parse(rawAnswers)
      : { topics: ['exam'], heaviness: 3, languages: ['English'] }

    console.log('[SafeSpeak] Enqueuing character for live match:', charId)

    joinFirestoreQueue(charId, checkin, (payload: MatchFoundPayload) => {
      if (isCancelled) return
      console.log('[SafeSpeak] Match found!', payload)
      navigate('/match-found')
    })

    const timer = setInterval(() => {
      setSecondsWaiting(prev => prev + 1)
    }, 1000)

    return () => {
      isCancelled = true
      clearInterval(timer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkipToRooms = () => {
    leaveFirestoreQueue()
    navigate('/rooms')
  }

  const handleInstantAi = () => {
    triggerInstantAiMatch()
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

        {/* Status indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          fontSize: '13px',
          color: '#4ade80',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '6px 14px',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 8px #4ade80',
            display: 'inline-block'
          }} />
          <span>Searching for a real peer ({secondsWaiting}s)...</span>
        </div>
      </motion.div>

      {/* Pulsing dots */}
      <div className="matching-dots" aria-label="Searching" role="status">
        {[0, 1, 2].map((i) => (
          <div key={i} className="matching-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '16px' }}>
        <motion.button
          className="btn btn-ghost"
          onClick={handleInstantAi}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ fontSize: '13px', color: '#cbd5e1', padding: '6px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
        >
          🤖 Don't want to wait? Talk with SafeSpeak AI Guide
        </motion.button>

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
    </div>
  )
}
