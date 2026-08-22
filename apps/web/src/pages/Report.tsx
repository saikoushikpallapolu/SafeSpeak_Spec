import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Report.css'

export default function Report() {
  const navigate = useNavigate()
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!reason) return
    setSubmitted(true)
    setTimeout(() => {
      navigate(-1)
    }, 1800)
  }

  return (
    <div className="report-page">
      <div className="report-backdrop" onClick={() => navigate(-1)} aria-hidden />
      <motion.div
        className="report-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="report-handle" aria-hidden />
        <h2 className="report-title font-display">
          {submitted ? 'Message Flagged' : 'Report an Unsafe Message'}
        </h2>

        {submitted ? (
          <div className="report-success-state">
            <p className="font-body" style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
              ✓ Thank you. This message has been flagged for safety review. SafeSpeak actively maintains a zero-tolerance policy against bullying and dangerous medical advice.
            </p>
          </div>
        ) : (
          <>
            <p className="font-body" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Flag messages that involve bullying, harassment, or dangerous/false home remedies.
            </p>

            <div className="report-reasons">
              {[
                'This message felt like bullying / harassment',
                'This message gave dangerous or unverified medical advice',
                'Inappropriate or offensive conduct',
                'Other safety concern',
              ].map((r) => (
                <button
                  key={r}
                  className={`report-reason ${reason === r ? 'report-reason--active' : ''}`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="report-actions">
              <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleSubmit}
                disabled={!reason}
              >
                Submit Report
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
