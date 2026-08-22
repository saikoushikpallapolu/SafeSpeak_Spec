import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Report.css'

export default function Report() {
  const navigate = useNavigate()
  const [reason, setReason] = useState('')

  return (
    <div className="report-page">
      <div className="report-backdrop" onClick={() => navigate(-1)} aria-hidden />
      <motion.div className="report-sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}>
        <div className="report-handle" aria-hidden />
        <h2 className="report-title">Report this message</h2>
        <div className="report-preview">
          <p>"This felt a bit harsh to receive…"</p>
        </div>
        <div className="report-reasons">
          {['This felt like bullying', 'This seemed like harmful advice', 'Something else'].map((r) => (
            <button key={r} className={`report-reason ${reason === r ? 'report-reason--active' : ''}`} onClick={() => setReason(r)}>
              {r}
            </button>
          ))}
        </div>
        <div className="report-actions">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => navigate(-1)} disabled={!reason}>Report</button>
        </div>
      </motion.div>
    </div>
  )
}
