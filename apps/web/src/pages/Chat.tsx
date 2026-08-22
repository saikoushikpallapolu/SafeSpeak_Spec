import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById, CHARACTERS } from '../data/characters'
import './Chat.css'

interface Message {
  id: string
  text: string
  sender: 'me' | 'other'
  time: string
  flagged?: boolean
}

const DEMO_MESSAGES: Message[] = [
  { id: '1', text: "Hey. I saw we're both dealing with exam stress right now.", sender: 'other', time: '9:41' },
  { id: '2', text: "Yeah... my boards are in three weeks and I can't focus on anything for more than five minutes.", sender: 'me', time: '9:42' },
  { id: '3', text: "Haan bilkul samjha. Mujhe bhi aise hi lag raha hai — thoda bahut pressure hai.", sender: 'other', time: '9:43' },
  { id: '4', text: "That's actually comforting to hear. Do you have any strategies that actually work?", sender: 'me', time: '9:44' },
]

export default function Chat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [showNudge, setShowNudge] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const myId = sessionStorage.getItem('character') || 'owl'
  const otherId = CHARACTERS.find(c => c.id !== myId)?.id || 'deer'
  const me = getCharacterById(myId)!
  const other = getCharacterById(otherId)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const text = input.trim()
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, newMsg])
    setInput('')

    // Simulate crisis detection for demo
    const crisisWords = ["don't see the point", "no point", "giving up", "can't go on", "want to disappear"]
    if (crisisWords.some(w => text.toLowerCase().includes(w))) {
      setTimeout(() => navigate('/safety/crisis'), 800)
    } else if (text.toLowerCase().includes('stress') || text.toLowerCase().includes('overwhelm')) {
      setTimeout(() => setShowNudge(true), 600)
    }
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header__chars">
          <div className="chat-header__char">
            <div className="chat-avatar" style={{ background: `radial-gradient(circle, ${me.accentColor}33, ${me.accentColor}11)`, border: `1.5px solid ${me.accentColor}55` }}>
              {me.emoji}
            </div>
            <span className="chat-header__you">You</span>
          </div>

          <div className="chat-header__lang-badge">
            <span>EN · HI</span>
          </div>

          <div className="chat-header__char">
            <div className="chat-avatar" style={{ background: `radial-gradient(circle, ${other.accentColor}33, ${other.accentColor}11)`, border: `1.5px solid ${other.accentColor}55` }}>
              {other.emoji}
            </div>
            <span className="chat-header__them">{other.name}</span>
          </div>
        </div>

        <div className="chat-header__actions">
          <button className="btn btn-ghost chat-header__btn" onClick={() => navigate('/resources')} aria-label="Help resources">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12V9M9 6.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button className="btn btn-ghost chat-header__btn" onClick={() => navigate('/reflection')} aria-label="End chat">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l12 0M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-messages" role="log" aria-live="polite">
        {/* Icebreaker */}
        <div className="chat-icebreaker">
          <span>💬 Maybe start with: "How long has it been feeling this way?"</span>
        </div>

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`chat-bubble-wrap chat-bubble-wrap--${msg.sender}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {msg.sender === 'other' && (
              <div className="chat-avatar-mini" style={{ background: `${other.accentColor}22`, border: `1px solid ${other.accentColor}44` }}>
                {other.emoji}
              </div>
            )}
            <div>
              <div className={`chat-bubble chat-bubble--${msg.sender}`}>
                {msg.text}
              </div>
              <span className="chat-bubble__time">{msg.time}</span>
            </div>
          </motion.div>
        ))}

        {/* Mild nudge inline card */}
        <AnimatePresence>
          {showNudge && (
            <motion.div
              className="chat-nudge"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="chat-nudge__icon">🍃</div>
              <div className="chat-nudge__content">
                <p className="chat-nudge__title">Hey, that sounded heavy.</p>
                <p className="chat-nudge__body">Take a breath with me before continuing.</p>
                <div className="chat-nudge__actions">
                  <button className="btn btn-ghost chat-nudge__btn" onClick={() => setShowNudge(false)}>
                    I'm okay, continue
                  </button>
                  <button className="btn chat-nudge__btn-support" onClick={() => navigate('/safety/crisis')}>
                    I'd like more support
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <div className="chat-input-wrap">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type something…"
            aria-label="Message input"
          />
          <button
            className="chat-input__voice"
            onClick={() => navigate('/chat/demo/voice')}
            aria-label="Voice message"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="6.5" y="1.5" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 9.5c0 3.314 2.686 6 6 6s6-2.686 6-6M9 15.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <motion.button
          className="chat-input__send"
          onClick={sendMessage}
          disabled={!input.trim()}
          whileTap={{ scale: 0.9 }}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9l14-7-7 14V9H2z" fill="currentColor" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
