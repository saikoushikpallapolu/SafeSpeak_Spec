import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Splash.css'

function Firefly({ style }: { style: React.CSSProperties }) {
  return <div className="firefly" style={style} />
}

export default function Splash() {
  const navigate = useNavigate()
  const fireflyCount = 28

  const fireflies = Array.from({ length: fireflyCount }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${4 + Math.random() * 6}s`,
    width: `${3 + Math.random() * 4}px`,
    height: `${3 + Math.random() * 4}px`,
    opacity: 0.4 + Math.random() * 0.6,
  }))

  return (
    <div className="splash">
      {/* Firefly particles */}
      <div className="splash__fireflies" aria-hidden>
        {fireflies.map((f, i) => (
          <Firefly key={i} style={f} />
        ))}
      </div>

      {/* Forest silhouette */}
      <div className="splash__forest" aria-hidden />

      {/* Center content */}
      <div className="splash__center">
        {/* Logo mark */}
        <motion.div
          className="splash__logo-mark"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
            <circle cx="32" cy="32" r="30" fill="none" stroke="#7BAE7F" strokeWidth="1.5" opacity="0.4" />
            <circle cx="32" cy="32" r="20" fill="none" stroke="#7BAE7F" strokeWidth="1.5" opacity="0.6" />
            <circle cx="32" cy="32" r="8" fill="#C9A84C" opacity="0.9" />
            {/* Leaf motif */}
            <path d="M32 6 C32 6 48 18 48 32 C48 40 40 46 32 46 C24 46 16 40 16 32 C16 18 32 6 32 6Z"
              fill="none" stroke="#7BAE7F" strokeWidth="1.5" opacity="0.5" />
          </svg>
        </motion.div>

        <motion.h1
          className="splash__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          SafeSpeak
        </motion.h1>

        <motion.p
          className="splash__tagline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          Talk. In your language. Without fear.
        </motion.p>

        <motion.div
          className="splash__pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.6 }}
        >
          {['Anonymous', 'Multilingual', 'Safe'].map((label) => (
            <span key={label} className="splash__pill">{label}</span>
          ))}
        </motion.div>

        <motion.button
          className="btn btn-primary splash__cta"
          onClick={() => navigate('/characters')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Begin
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        <motion.button
          className="btn btn-ghost splash__resources"
          onClick={() => navigate('/resources')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          View helplines & resources
        </motion.button>
      </div>

      {/* Privacy note */}
      <motion.p
        className="splash__privacy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        🔒 No account, no name, no photo. Ever.
      </motion.p>
    </div>
  )
}
