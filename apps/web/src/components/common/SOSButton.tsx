import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './SOSButton.css'

export default function SOSButton() {
  const navigate = useNavigate()

  return (
    <motion.button
      className="sos-quick-btn font-mono"
      onClick={() => navigate('/safety/crisis')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Emergency Crisis Support"
      title="Immediate Emergency Helpline Support"
    >
      <span className="sos-pulse-dot" />
      <span>SOS · Helplines</span>
    </motion.button>
  )
}
