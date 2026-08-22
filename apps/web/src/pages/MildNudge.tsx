import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './MildNudge.css'

export default function MildNudge() {
  const navigate = useNavigate()

  return (
    <div className="nudge-page">
      <motion.div className="nudge-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>

        <div className="nudge-icon">🍃</div>
        <h1 className="nudge-title">Hey, that sounded heavy.</h1>
        <p className="nudge-body">Take a breath with me before continuing.</p>

        {/* Breathing circle */}
        <div className="nudge-breath-wrap">
          <div className="nudge-breath-circle">
            <div className="nudge-breath-inner" />
          </div>
          <p className="nudge-breath-label">Breathe in… hold… breathe out</p>
        </div>

        <div className="nudge-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            I'm okay to continue
          </button>
          <button className="btn btn-danger" onClick={() => navigate('/safety/crisis')}>
            I'd like more support
          </button>
        </div>
      </motion.div>
    </div>
  )
}
