import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './AddFriend.css'

export default function AddFriend() {
  const navigate = useNavigate()
  return (
    <div className="addfriend-page">
      <div className="addfriend-backdrop" onClick={() => navigate(-1)} />
      <motion.div className="addfriend-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>
        <div className="addfriend-avatar">🦉</div>
        <h2 className="addfriend-title">Anonymous Friend Request</h2>
        <p className="addfriend-from">from <strong>StressedOwl#1204</strong></p>
        <p className="addfriend-note">
          Accepting means you can message each other again in the future.
          No identity is shared — just the ability to reconnect.
        </p>
        <div className="addfriend-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Not now</button>
          <button className="btn btn-primary" onClick={() => navigate('/friends')}>Add them</button>
        </div>
      </motion.div>
    </div>
  )
}
