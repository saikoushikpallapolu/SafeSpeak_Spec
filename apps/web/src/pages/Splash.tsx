import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()
  const starCount = 36

  const stars = Array.from({ length: starCount }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${3 + Math.random() * 5}s`,
    width: `${1.5 + Math.random() * 3}px`,
    height: `${1.5 + Math.random() * 3}px`,
    opacity: 0.3 + Math.random() * 0.7,
  }))

  return (
    <div className="splash">
      {/* Monochromatic star field */}
      <div className="splash__stars" aria-hidden>
        {stars.map((s, i) => (
          <div key={i} className="splash-star" style={s} />
        ))}
      </div>

      {/* Subtle geometric horizon overlay */}
      <div className="splash__horizon" aria-hidden />

      {/* Center content */}
      <div className="splash__center">
        {/* Minimalist Logo Mark */}
        <motion.div
          className="splash__logo-mark"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden>
            <circle cx="34" cy="34" r="32" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3" strokeDasharray="3 3" />
            <circle cx="34" cy="34" r="22" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
            <circle cx="34" cy="34" r="8" fill="#FFFFFF" />
            <path
              d="M34 10 C34 10 48 20 48 34 C48 42 42 48 34 48 C26 48 20 42 20 34 C20 20 34 10 34 10Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              opacity="0.8"
            />
          </svg>
        </motion.div>

        <motion.h1
          className="splash__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
        >
          SafeSpeak
        </motion.h1>

        <motion.p
          className="splash__tagline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          Talk. In your language. Without fear.
        </motion.p>

        <motion.div
          className="splash__pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {['100% Anonymous', 'Real-time Multilingual', 'Safe & Moderated'].map((label) => (
            <span key={label} className="splash__pill font-mono">{label}</span>
          ))}
        </motion.div>

        <motion.button
          className="btn btn-primary splash__cta"
          onClick={() => navigate('/characters')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Choose Your Companion</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M3.75 9H14.25M10.5 5.25L14.25 9L10.5 12.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        <motion.button
          className="btn btn-ghost splash__resources"
          onClick={() => navigate('/resources')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          View helplines & privacy architecture →
        </motion.button>
      </div>

      {/* Privacy note */}
      <motion.p
        className="splash__privacy font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        🔒 No accounts · No tracking · Session-only existence
      </motion.p>
    </div>
  )
}
