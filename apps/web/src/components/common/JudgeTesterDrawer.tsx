import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './JudgeTesterDrawer.css'

interface DemoPreset {
  title: string
  lang: string
  character: string
  action: () => void
}

export default function JudgeTesterDrawer() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const launchDemoChat = (lang: string, char: string, peerChar: string, topic: string, icebreaker: string) => {
    sessionStorage.clear()
    sessionStorage.setItem('character', char)
    const roomId = `room_demo_${lang.toLowerCase()}_${Date.now()}`
    const matchPayload = {
      roomId,
      peerSocketId: 'peer_sim',
      peerCharacter: peerChar,
      peerTag: `${peerChar.charAt(0).toUpperCase() + peerChar.slice(1)}#${Math.floor(1000 + Math.random() * 9000)}`,
      peerLanguage: lang,
      myCharacter: char,
      myTag: `${char.charAt(0).toUpperCase() + char.slice(1)}#4821`,
      myLanguage: lang,
      sharedContext: topic,
      icebreaker,
      isSimulatedPeer: true,
    }
    sessionStorage.setItem('current_match', JSON.stringify(matchPayload))
    setOpen(false)
    navigate(`/chat/${roomId}`)
  }

  const presets: DemoPreset[] = [
    {
      title: '🇮🇳 Hindi / Hinglish Exam Pressure',
      lang: 'Hindi',
      character: 'owl',
      action: () => launchDemoChat('Hindi', 'owl', 'deer', 'exam stress & board exams', 'नमस्ते! क्या आप भी परीक्षा के तनाव से जूझ रहे हैं?'),
    },
    {
      title: '🇮🇳 Telugu Loneliness & City Relocation',
      lang: 'Telugu',
      character: 'penguin',
      action: () => launchDemoChat('Telugu', 'penguin', 'panda', 'కొత్త నగరంలో ఒంటరితనం', 'హలో! మీతో కనెక్ట్ అవ్వడం ఆనందంగా ఉంది.'),
    },
    {
      title: '🇮🇳 Tamil Work & Family Stress',
      lang: 'Tamil',
      character: 'rabbit',
      action: () => launchDemoChat('Tamil', 'rabbit', 'bear', 'குடும்ப எதிர்பார்ப்புகள் மற்றும் அழுத்தம்', 'வணக்கம்! இன்று எப்படி உணர்கிறீர்கள்?'),
    },
    {
      title: '🛡️ Test Crisis Tier 1 (Breathing Grounding)',
      lang: 'English',
      character: 'deer',
      action: () => {
        setOpen(false)
        navigate('/safety/nudge')
      },
    },
    {
      title: '🚨 Test Crisis Tier 2 (Emergency 24x7 Helplines)',
      lang: 'English',
      character: 'panda',
      action: () => {
        setOpen(false)
        navigate('/safety/crisis')
      },
    },
    {
      title: '🌐 Test Themed Group Rooms',
      lang: 'English',
      character: 'bear',
      action: () => {
        setOpen(false)
        navigate('/rooms')
      },
    },
  ]

  return (
    <>
      <button
        className="judge-tester-pill font-mono"
        onClick={() => setOpen(true)}
        aria-label="Open Demo Sandbox"
        title="Judge / Demo Sandbox Quick Tester"
      >
        <span>⚡ Demo Presets</span>
      </button>

      <AnimatePresence>
        {open && (
          <div className="judge-modal-backdrop" onClick={() => setOpen(false)}>
            <motion.div
              className="judge-modal-sheet"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="judge-modal-header">
                <div>
                  <span className="judge-modal-tag font-mono">JUDGE & REVIEWER TOOLKIT</span>
                  <h3 className="judge-modal-title font-display">Instant Demo Scenarios</h3>
                </div>
                <button className="btn btn-ghost judge-close-btn" onClick={() => setOpen(false)}>
                  ✕
                </button>
              </div>

              <p className="judge-modal-sub font-body">
                Jump directly into pre-configured live conversations across languages or test safety guardian triggers.
              </p>

              <div className="judge-presets-list">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    className="judge-preset-card"
                    onClick={p.action}
                  >
                    <span className="judge-preset-name font-body">{p.title}</span>
                    <span className="judge-preset-arrow">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
