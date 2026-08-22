import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './MildNudge.css'

export default function MildNudge() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')

  useEffect(() => {
    const cycle = () => {
      setPhase('Inhale')
      setTimeout(() => {
        setPhase('Hold')
        setTimeout(() => {
          setPhase('Exhale')
        }, 3000)
      }, 4000)
    }

    cycle()
    const interval = setInterval(cycle, 11000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="nudge-page">
      <motion.div
        className="nudge-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="nudge-icon">🍃</div>
        <h1 className="nudge-title font-display">Hey, that sounded heavy.</h1>
        <p className="nudge-body font-body">Take a slow, grounding breath with me before continuing.</p>

        {/* Dynamic Breathing circle */}
        <div className="nudge-breath-wrap">
          <div className={`nudge-breath-circle nudge-breath-circle--${phase.toLowerCase()}`}>
            <div className="nudge-breath-inner" />
          </div>
          <p className="nudge-breath-label font-mono">
            {phase === 'Inhale' && '✦ Breathe in slowly… (4s)'}
            {phase === 'Hold' && '✦ Hold gently… (3s)'}
            {phase === 'Exhale' && '✦ Breathe out and release… (4s)'}
          </p>
        </div>

        <div className="nudge-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            I'm okay, return to chat
          </button>
          <button className="btn btn-danger" onClick={() => navigate('/safety/crisis')}>
            I'd like helpline support
          </button>
        </div>
      </motion.div>
    </div>
  )
}
