import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="install-prompt-banner"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <div className="install-prompt-content">
            <span className="install-prompt-icon">📱</span>
            <div className="install-prompt-text">
              <p className="install-prompt-title font-display">Install SafeSpeak</p>
              <p className="install-prompt-sub font-body">Add to your home screen for quick, private access anytime.</p>
            </div>
          </div>
          <div className="install-prompt-actions">
            <button className="btn btn-ghost install-dismiss-btn" onClick={() => setVisible(false)}>
              Not now
            </button>
            <button className="btn btn-primary install-cta-btn" onClick={handleInstall}>
              Install
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
