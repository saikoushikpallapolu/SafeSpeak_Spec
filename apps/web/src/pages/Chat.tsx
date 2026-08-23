import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById, CHARACTERS } from '../data/characters'
import { useChat, useSpeechVoice } from '../hooks/useSafeSpeakSocket'
import { soundFx } from '../services/soundFx'
import SOSButton from '../components/common/SOSButton'
import type { CharacterId, MatchFoundPayload } from '@safespeak/shared-types'
import { getOrCreateUserId } from '../services/firestoreMatching'
import { checkModeration, checkCrisisTier, translateMessage } from '../services/safetyAndTranslation'
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
  const myUserId = getOrCreateUserId()

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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [isMuted, setIsMuted] = useState(soundFx.isMuted())
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [input, setInput] = useState('')
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({})
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({})
  const [inAppNudge, setInAppNudge] = useState(false)
  const [activeModWarning, setActiveModWarning] = useState<string | null>(null)
  const [peerCrisisAlert, setPeerCrisisAlert] = useState<string | null>(null)
  const [selfCrisisBanner, setSelfCrisisBanner] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { isRecording, transcript, startListening, stopListening, speakText } = useSpeechVoice()

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

  // Sync speech recognition transcript into input bar
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  // Real-time dynamic translation of peer messages into activeLang
  useEffect(() => {
    let isCancelled = false

    async function translateIncoming() {
      const updates: Record<string, string> = {}
      for (const m of messages) {
        if (m.senderId !== myUserId) {
          const res = await translateMessage(m.text, activeLang)
          if (res.translatedText) {
            updates[m.id] = res.translatedText
          }
        }
      }
      if (!isCancelled) {
        setDynamicTranslations(updates)
      }
    }

    if (messages.length > 0) {
      translateIncoming()
    }

    return () => {
      isCancelled = true
    }
  }, [messages, activeLang, myUserId])

  // Monitor all incoming messages for peer crisis expressions
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last.senderId !== myUserId && !last.senderId.startsWith('me')) {
        soundFx.playMessageReceived()

        // Check if peer expressed thoughts of suicide or severe self-harm
        const peerCrisis = checkCrisisTier(last.text)
        if (peerCrisis === 2) {
          setPeerCrisisAlert('Your conversation partner is expressing severe distress or thoughts of self-harm.')
        }
      }
    }
  }, [messages, isPeerTyping, myUserId])

  // Handle Crisis Alert (Tier 2) -> Instant emergency support banner
  useEffect(() => {
    if (crisisAlert && crisisAlert.tier === 2) {
      setSelfCrisisBanner(true)
    }
  }, [crisisAlert])

  // Handle Mild Nudge (Tier 1)
  useEffect(() => {
    if (nudgeAlert && nudgeAlert.tier === 1) {
      setInAppNudge(true)
      soundFx.playBreathIn()
    }
  }, [nudgeAlert])

  // Handle Moderation Warning Toast with auto-dismiss
  useEffect(() => {
    if (moderationBlocked?.reason) {
      setActiveModWarning(moderationBlocked.reason)
      const t = setTimeout(() => setActiveModWarning(null), 6000)
      return () => clearTimeout(t)
    }
  }, [moderationBlocked])

  // Handle Chat Ended
  useEffect(() => {
    if (reflectionSummary) {
      navigate('/reflection')
    }
  }, [reflectionSummary, navigate])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    // 1. Instant Client-Side Moderation Guard (Threats, Violence, Slurs, Harassment, Toxic abuse)
    const mod = checkModeration(text)
    if (mod.verdict === 'blocked') {
      setActiveModWarning(mod.reason || 'Message blocked: Contains prohibited language, threats, or harassment.')
      soundFx.playBreathIn()
      return // STRICTLY HALT - DO NOT SEND TO CHAT
    }

    // 2. Instant Client-Side Crisis Guard (Suicide, Self-Harm)
    const crisis = checkCrisisTier(text)
    if (crisis === 2) {
      setSelfCrisisBanner(true)
      soundFx.playBreathIn()
      return // STRICTLY HALT - DO NOT SEND TO CHAT
    }
    if (crisis === 1) {
      setInAppNudge(true)
      soundFx.playBreathIn()
    }

    // 3. Dispatch message only if clean and safe
    setInput('')
    if (isRecording) {
      stopListening()
    }
    sendTypingStop()
    soundFx.playMessageSent()
    await sendMessage(text)
  }

  const handleShareHelplinesWithPeer = async () => {
    setPeerCrisisAlert(null)
    const helplineText = "Hey... please know that you are not alone and support is always here. You can call Tele-MANAS at 14416 or KIRAN at 1800-599-0019 anytime for free confidential help."
    await sendMessage(helplineText)
    soundFx.playMessageSent()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (e.target.value.length > 0) {
      sendTypingStart()
    } else {
      sendTypingStop()
    }
  }

  const toggleInlineMic = () => {
    if (isRecording) {
      stopListening()
    } else {
      let locale = 'en-IN'
      if (activeLang === 'Hindi') locale = 'hi-IN'
      else if (activeLang === 'Telugu') locale = 'te-IN'
      else if (activeLang === 'Tamil') locale = 'ta-IN'
      startListening(locale)
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
          <div className="chat-header-lang-container" style={{ position: 'relative' }}>
            <button
              type="button"
              className="chat-header__lang-badge font-mono"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              title="Click to switch your target language"
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
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '10px',
                    padding: '6px',
                    minWidth: '130px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  }}
                >
                  {AVAILABLE_LANGS.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      className={`chat-lang-opt ${activeLang === lang.id ? 'chat-lang-opt--active' : ''}`}
                      onClick={() => {
                        setActiveLang(lang.id)
                        setShowLangDropdown(false)
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: activeLang === lang.id ? '#27272a' : 'transparent',
                        color: activeLang === lang.id ? '#4ade80' : '#e4e4e7',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
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
            <span className="chat-header__them">{matchData?.peerTag || other.name}</span>
          </div>
        </div>

        <div className="chat-header__actions">
          {/* Privacy Guarantee Shield Button */}
          <button
            type="button"
            className="btn btn-ghost chat-header__btn"
            onClick={() => setShowPrivacyModal(true)}
            aria-label="How your identity is kept private"
            title="Privacy & Anonymity Shield"
          >
            🔒
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            className="btn btn-ghost chat-header__btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? '🔇' : '🔔'}
          </button>

          <SOSButton />
          
          <button type="button" className="btn btn-ghost chat-header__btn" onClick={() => navigate('/resources')} aria-label="Help resources" title="Helplines & Grounding">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 12V9M9 6.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          
          <button type="button" className="btn btn-ghost chat-header__btn" onClick={() => setShowExitConfirm(true)} aria-label="End chat" title="End Conversation">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l12 0M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Moderation Warning Toast (Threats / Slurs / Profanity) */}
      <AnimatePresence>
        {activeModWarning && (
          <motion.div
            className="chat-mod-warning font-mono"
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            style={{
              background: '#581c1c',
              color: '#fecaca',
              borderBottom: '2px solid #b91c1c',
              padding: '12px 18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(185, 28, 28, 0.4)',
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🛡️</span>
              <span><strong>Safety Notice:</strong> {activeModWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveModWarning(null)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fecaca',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Peer Crisis Alert Banner (When the OTHER user says suicidal thoughts) */}
      <AnimatePresence>
        {peerCrisisAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: '#3e1515',
              color: '#fca5a5',
              borderBottom: '2px solid #ef4444',
              padding: '12px 18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 90,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span><strong>Peer Distress Notice:</strong> {peerCrisisAlert}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleShareHelplinesWithPeer}
                style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#ef4444' }}
              >
                📞 Share 24×7 Helplines in Chat
              </button>
              <button
                type="button"
                onClick={() => setPeerCrisisAlert(null)}
                style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Self Crisis Support Banner (When YOU express thoughts of suicide/crisis) */}
      <AnimatePresence>
        {selfCrisisBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: '#1e293b',
              color: '#67e8f9',
              borderBottom: '2px solid #06b6d4',
              padding: '12px 18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 90,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🆘</span>
              <span><strong>SafeSpeak Support:</strong> You are not alone. 24×7 Free Support: Tele-MANAS (14416) or Kiran (1800-599-0019).</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/safety/crisis')}
                style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#0891b2' }}
              >
                Open Crisis Tools & Helplines
              </button>
              <button
                type="button"
                onClick={() => setSelfCrisisBanner(false)}
                style={{ background: 'transparent', border: 'none', color: '#67e8f9', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
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
          // Precise isMe check based on unique userId
          const isMe = msg.senderId === myUserId || msg.senderId.startsWith('me')
          const senderChar = getCharacterById(msg.senderCharacter) || (isMe ? me : other)
          const showOriginal = showOriginalMap[msg.id]
          const liveTranslated = dynamicTranslations[msg.id] || msg.translatedText
          const displayText = showOriginal ? msg.text : (liveTranslated || msg.text)
          const hasTranslation = Boolean(liveTranslated && liveTranslated !== msg.text)

          return (
            <motion.div
              key={msg.id}
              className={`chat-bubble-wrap ${isMe ? 'chat-bubble-wrap--me' : 'chat-bubble-wrap--other'}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {!isMe && (
                <div className="chat-avatar-mini" style={{ background: `${senderChar.accentColor}22`, border: `1px solid ${senderChar.accentColor}44` }}>
                  {senderChar.emoji}
                </div>
              )}
              <div>
                <div className={`chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--other'}`}>
                  {msg.isVoice && <span style={{ marginRight: 6 }}>🎙️</span>}
                  <span>{displayText}</span>

                  {/* Audio playback and flag icons */}
                  {!isMe && (
                    <div className="chat-bubble-actions">
                      <button
                        type="button"
                        className="chat-bubble-tts-btn"
                        onClick={() => speakText(displayText, activeLang)}
                        title="Read aloud"
                        aria-label="Read message aloud"
                      >
                        🔊
                      </button>
                      <button
                        type="button"
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
                      type="button"
                      className="chat-bubble-translate-toggle font-mono"
                      onClick={() => toggleOriginal(msg.id)}
                    >
                      {showOriginal ? '• View translated' : `• Translated to ${activeLang}`}
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
            <span className="chat-typing-text font-mono">{matchData?.peerTag || other.name} is typing…</span>
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
                    type="button"
                    className="btn btn-ghost chat-nudge__btn"
                    onClick={() => {
                      setInAppNudge(false)
                      dismissNudge()
                    }}
                  >
                    I'm okay, continue
                  </button>
                  <button type="button" className="btn chat-nudge__btn-support" onClick={() => navigate('/safety/crisis')}>
                    I'd like helpline resources
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Peer Left Notice */}
        {peerLeft && (
          <motion.div
            className="chat-peer-left"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="chat-peer-left__title">Your conversation partner has left the chat.</p>
            <p className="chat-peer-left__sub">Take all the time you need. You can find a new match or take a quiet moment.</p>
            <div className="chat-peer-left__actions">
              <button type="button" className="btn btn-primary" onClick={handleFindNewMatch}>
                Find a new peer
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleGoToRooms}>
                Browse themed rooms
              </button>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <footer className="chat-input-bar">
        <div className="chat-input-wrap">
          <input
            type="text"
            className="chat-input font-body"
            placeholder={isRecording ? 'Listening to your voice…' : `Type in any language (translated to ${activeLang})…`}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            aria-label="Chat message input"
            disabled={Boolean(peerLeft)}
          />

          {/* Inline Speech-to-Text Button */}
          <button
            type="button"
            className={`chat-voice-btn ${isRecording ? 'chat-voice-btn--recording' : ''}`}
            onClick={toggleInlineMic}
            title={isRecording ? 'Listening... click to stop' : 'Tap to speak (Speech-to-Text)'}
            aria-label="Speech to text"
            style={{
              color: isRecording ? '#ef4444' : 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {isRecording ? '⏹️' : '🎙️'}
          </button>

          {/* Full-Screen Ambient Voice Room Button */}
          <button
            type="button"
            className="chat-voice-btn"
            onClick={() => navigate(`/chat/${roomId}/voice`)}
            title="Open Ambient Voice Room"
            aria-label="Switch to Voice Mode"
          >
            🎧
          </button>

          <button
            type="button"
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || Boolean(peerLeft)}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15.5 2.5L8.5 9.5M15.5 2.5L10.5 15.5L8.5 9.5L2.5 7.5L15.5 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </footer>

      {/* Identity Privacy Shield Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            className="chat-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              className="chat-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '440px' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
              <h3 className="font-display">How Your Identity Is Protected</h3>
              <p className="font-body" style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                SafeSpeak is built from the ground up for total confidentiality and emotional safety.
              </p>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span>🛡️</span>
                  <div>
                    <strong>Zero Account / No Personal Data</strong>
                    <div style={{ color: '#94a3b8' }}>No email, name, phone number, or profile photo required.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span>🎭</span>
                  <div>
                    <strong>Ephemeral Cartoon Persona</strong>
                    <div style={{ color: '#94a3b8' }}>You are identified solely by your chosen animal avatar ({myTag}).</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span>💨</span>
                  <div>
                    <strong>Zero Transcript Storage</strong>
                    <div style={{ color: '#94a3b8' }}>Messages exist only in active memory and are permanently wiped when you leave.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span>🌐</span>
                  <div>
                    <strong>Isolated Anonymous Matching</strong>
                    <div style={{ color: '#94a3b8' }}>IP addresses and device telemetry are never shared with peers.</div>
                  </div>
                </div>
              </div>
              <div className="chat-modal__actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-primary" onClick={() => setShowPrivacyModal(false)} style={{ width: '100%' }}>
                  Got it, thank you
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            className="chat-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              className="chat-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display">Ready to wrap up?</h3>
              <p className="font-body">Ending the conversation will take you to your personal reflection summary. No chat transcripts are ever saved.</p>
              <div className="chat-modal__actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowExitConfirm(false)}>
                  Stay in chat
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmEnd}>
                  End conversation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
