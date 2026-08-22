import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById, CHARACTERS } from '../data/characters'
import { useChat, useSpeechVoice } from '../hooks/useSafeSpeakSocket'
import { soundFx } from '../services/soundFx'
import SOSButton from '../components/common/SOSButton'
import type { CharacterId, MatchFoundPayload } from '@safespeak/shared-types'
import './Chat.css'

const AVAILABLE_LANGS = [
  { id: 'English', label: 'English' },
  { id: 'Hindi', label: 'हिंदी (Hindi)' },
  { id: 'Telugu', label: 'తెలుగు (Telugu)' },
  { id: 'Tamil', label: 'தமிழ் (Tamil)' },
  { id: 'Hinglish', label: 'Hinglish' },
]

export default function Chat() {
  const { roomId = 'default_room' } = useParams()
  const navigate = useNavigate()

  const rawMatch = sessionStorage.getItem('current_match')
  const matchData: MatchFoundPayload | null = rawMatch ? JSON.parse(rawMatch) : null

  const myId = (matchData?.myCharacter || sessionStorage.getItem('character') || 'owl') as CharacterId
  const otherId = (matchData?.peerCharacter || CHARACTERS.find(c => c.id !== myId)?.id || 'deer') as CharacterId

  const me = getCharacterById(myId) || CHARACTERS[0]
  const other = getCharacterById(otherId) || CHARACTERS[1]

  const myTag = matchData?.myTag || `${me.name}#${Math.floor(1000 + Math.random() * 9000)}`
  const initialLang = matchData?.myLanguage || 'English'

  const [activeLang, setActiveLang] = useState(initialLang)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [isMuted, setIsMuted] = useState(soundFx.isMuted())
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [input, setInput] = useState('')
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({})
  const [inAppNudge, setInAppNudge] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { speakText } = useSpeechVoice()

  const {
    messages,
    isPeerTyping,
    crisisAlert,
    nudgeAlert,
    moderationBlocked,
    peerLeft,
    reflectionSummary,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    leaveChat,
    endChat,
    dismissNudge,
    resetChat,
  } = useChat(roomId, myId, myTag, activeLang)

  // Scroll to bottom on new message & play chime for peer
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last.senderCharacter !== myId && !last.senderId.startsWith('me')) {
        soundFx.playMessageReceived()
      }
    }
  }, [messages, isPeerTyping, myId])

  // Handle Crisis Alert (Tier 2) -> Instant emergency overlay
  useEffect(() => {
    if (crisisAlert && crisisAlert.tier === 2) {
      navigate('/safety/crisis')
    }
  }, [crisisAlert, navigate])

  // Handle Mild Nudge (Tier 1)
  useEffect(() => {
    if (nudgeAlert && nudgeAlert.tier === 1) {
      setInAppNudge(true)
      soundFx.playBreathIn()
    }
  }, [nudgeAlert])

  // Handle Chat Ended
  useEffect(() => {
    if (reflectionSummary) {
      navigate('/reflection')
    }
  }, [reflectionSummary, navigate])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    soundFx.playMessageSent()
    setInput('')
    sendTypingStop()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (e.target.value.length > 0) {
      sendTypingStart()
    } else {
      sendTypingStop()
    }
  }

  const toggleMute = () => {
    const muted = soundFx.toggleMute()
    setIsMuted(muted)
  }

  const handleConfirmEnd = () => {
    endChat()
    leaveChat()
    resetChat()
    setTimeout(() => {
      navigate('/reflection')
    }, 500)
  }

  const handleFindNewMatch = () => {
    resetChat()
    sessionStorage.removeItem('current_match')
    navigate('/matching')
  }

  const handleGoToRooms = () => {
    resetChat()
    sessionStorage.removeItem('current_match')
    navigate('/rooms')
  }

  const toggleOriginal = (msgId: string) => {
    setShowOriginalMap(prev => ({ ...prev, [msgId]: !prev[msgId] }))
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

          {/* Quick Language Switcher Dropdown */}
          <div className="chat-header-lang-container">
            <button
              className="chat-header__lang-badge font-mono"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              title="Click to change your target language"
            >
              <span>🌐 {activeLang}</span>
              <span style={{ fontSize: '0.6rem', marginLeft: 4 }}>▼</span>
            </button>

            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  className="chat-lang-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {AVAILABLE_LANGS.map((lang) => (
                    <button
                      key={lang.id}
                      className={`chat-lang-opt ${activeLang === lang.id ? 'chat-lang-opt--active' : ''}`}
                      onClick={() => {
                        setActiveLang(lang.id)
                        setShowLangDropdown(false)
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="chat-header__char">
            <div className="chat-avatar" style={{ background: `radial-gradient(circle, ${other.accentColor}33, ${other.accentColor}11)`, border: `1.5px solid ${other.accentColor}55` }}>
              {other.emoji}
            </div>
            <span className="chat-header__them">{other.name}</span>
          </div>
        </div>

        <div className="chat-header__actions">
          {/* Sound Mute Toggle */}
          <button
            className="btn btn-ghost chat-header__btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? '🔇' : '🔔'}
          </button>

          <SOSButton />
          
          <button className="btn btn-ghost chat-header__btn" onClick={() => navigate('/resources')} aria-label="Help resources" title="Helplines & Privacy">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12V9M9 6.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          
          <button className="btn btn-ghost chat-header__btn" onClick={() => setShowExitConfirm(true)} aria-label="End chat" title="End Conversation">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l12 0M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Moderation Warning Toast */}
      <AnimatePresence>
        {moderationBlocked && (
          <motion.div
            className="chat-mod-warning font-mono"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            ⚠️ {moderationBlocked.reason}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Feed */}
      <div className="chat-messages" role="log" aria-live="polite">
        {/* Icebreaker */}
        <div className="chat-icebreaker">
          <span>💬 {matchData?.icebreaker || "How long has it been feeling this way for you?"}</span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderCharacter === myId || msg.senderId.startsWith('me')
          const showOriginal = showOriginalMap[msg.id]
          const displayText = showOriginal ? msg.text : (msg.translatedText || msg.text)
          const hasTranslation = msg.translatedText && msg.translatedText !== msg.text

          return (
            <motion.div
              key={msg.id}
              className={`chat-bubble-wrap ${isMe ? 'chat-bubble-wrap--me' : 'chat-bubble-wrap--other'}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {!isMe && (
                <div className="chat-avatar-mini" style={{ background: `${other.accentColor}22`, border: `1px solid ${other.accentColor}44` }}>
                  {other.emoji}
                </div>
              )}
              <div>
                <div className={`chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--other'}`}>
                  <span>{displayText}</span>

                  {/* Audio playback and flag icons */}
                  {!isMe && (
                    <div className="chat-bubble-actions">
                      <button
                        className="chat-bubble-tts-btn"
                        onClick={() => speakText(displayText, activeLang)}
                        title="Read aloud"
                        aria-label="Read message aloud"
                      >
                        🔊
                      </button>
                      <button
                        className="chat-bubble-flag-btn"
                        onClick={() => navigate('/report')}
                        title="Report message"
                        aria-label="Report message"
                      >
                        🚩
                      </button>
                    </div>
                  )}
                </div>

                <div className="chat-bubble-meta">
                  <span className="chat-bubble__time">{msg.time}</span>
                  {hasTranslation && (
                    <button
                      className="chat-bubble-translate-toggle font-mono"
                      onClick={() => toggleOriginal(msg.id)}
                    >
                      {showOriginal ? '• View translated' : `• Translated from ${msg.originalLanguage || 'other language'}`}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Peer Typing Indicator */}
        {isPeerTyping && (
          <motion.div
            className="chat-typing-indicator"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="chat-avatar-mini" style={{ background: `${other.accentColor}22` }}>
              {other.emoji}
            </div>
            <div className="chat-typing-dots">
              <span /><span /><span />
            </div>
            <span className="chat-typing-text font-mono">{other.name} is typing…</span>
          </motion.div>
        )}

        {/* Mild nudge inline card (Tier 1 Grounding Card) */}
        <AnimatePresence>
          {inAppNudge && (
            <motion.div
              className="chat-nudge"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="chat-nudge__icon">🍃</div>
              <div className="chat-nudge__content">
                <p className="chat-nudge__title font-display">Hey, that sounded heavy.</p>
                <p className="chat-nudge__body font-body">Take a slow deep breath with me before continuing.</p>
                <div className="chat-nudge__actions">
                  <button
                    className="btn btn-ghost chat-nudge__btn"
                    onClick={() => {
                      setInAppNudge(false)
                      dismissNudge()
                    }}
                  >
                    I'm okay, continue
                  </button>
                  <button className="btn chat-nudge__btn-support" onClick={() => navigate('/safety/crisis')}>
                    I'd like helpline resources
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Message Input Bar */}
      <div className="chat-input-bar">
        <div className="chat-input-wrap">
          <input
            className="chat-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Type in any language (translated to ${activeLang})…`}
            aria-label="Message input"
            disabled={Boolean(peerLeft)}
          />
          <button
            className="chat-input__voice"
            onClick={() => navigate(`/chat/${roomId}/voice`)}
            aria-label="Voice input"
            title="Speak voice note"
            disabled={Boolean(peerLeft)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="6.5" y="1.5" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 9.5c0 3.314 2.686 6 6 6s6-2.686 6-6M9 15.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <motion.button
          className="chat-input__send"
          onClick={handleSend}
          disabled={!input.trim() || Boolean(peerLeft)}
          whileTap={{ scale: 0.9 }}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9l14-7-7 14V9H2z" fill="currentColor" />
          </svg>
        </motion.button>
      </div>

      {/* Peer Left Modal / Card */}
      <AnimatePresence>
        {peerLeft && (
          <div className="chat-peer-left-backdrop">
            <motion.div
              className="chat-peer-left-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="peer-left-avatar">{other.emoji}</div>
              <h2 className="peer-left-title font-display">Conversation Concluded</h2>
              <p className="peer-left-body font-body">
                Your conversation partner has left the chat. Every session on SafeSpeak is strictly one-time and unlinked. Nothing has been saved.
              </p>
              <div className="peer-left-actions">
                <button className="btn btn-primary" onClick={handleFindNewMatch}>
                  <span>⚡ Find a New Match</span>
                </button>
                <button className="btn btn-secondary" onClick={handleGoToRooms}>
                  <span>🌐 Join a Themed Room</span>
                </button>
                <button className="btn btn-ghost font-mono" onClick={() => navigate('/reflection')}>
                  View Reflection Card →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="chat-exit-backdrop" onClick={() => setShowExitConfirm(false)}>
            <motion.div
              className="chat-exit-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>End this conversation?</h3>
              <p className="font-body" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '8px 0 16px' }}>
                Your chat with this person will permanently close and no messages are retained. You can start fresh with a new match anytime.
              </p>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowExitConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmEnd}>
                  End Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
