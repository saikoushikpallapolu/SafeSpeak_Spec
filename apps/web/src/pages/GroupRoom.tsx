import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById, CHARACTERS } from '../data/characters'
import type { CharacterId } from '@safespeak/shared-types'
import SOSButton from '../components/common/SOSButton'
import { getOrCreateUserId } from '../services/firestoreMatching'
import { 
  subscribeToGroupMessages, 
  sendGroupRoomMessage, 
  type GroupRoomMessage 
} from '../services/firestoreRooms'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import './GroupRoom.css'

export default function GroupRoom() {
  const { roomId = 'default_room' } = useParams()
  const navigate = useNavigate()
  const myUserId = getOrCreateUserId()

  const myId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const me = getCharacterById(myId) || CHARACTERS[0]
  const myTag = sessionStorage.getItem('user_tag') || `${me.name}#${Math.floor(1000 + Math.random() * 9000)}`

  const [roomTitle, setRoomTitle] = useState('Open Community Space')
  const [roomCategory, setRoomCategory] = useState('General')
  const [messages, setMessages] = useState<GroupRoomMessage[]>([])
  const [input, setInput] = useState('')
  const [activeWarning, setActiveWarning] = useState<string | null>(null)
  const [selfCrisisBanner, setSelfCrisisBanner] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Fetch Room Info
  useEffect(() => {
    async function loadRoom() {
      try {
        const docRef = doc(db, 'custom_rooms', roomId)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          const data = snap.data()
          setRoomTitle(data.name || 'Open Community Space')
          setRoomCategory(data.category || 'General')
        }
      } catch (err) {
        console.warn('Could not load room meta:', err)
      }
    }
    loadRoom()
  }, [roomId])

  // Subscribe to live messages
  useEffect(() => {
    const unsub = subscribeToGroupMessages(roomId, (msgs) => {
      setMessages(msgs)
    })
    return () => unsub()
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = input.trim()
    if (!text || isSending) return

    setIsSending(true)
    try {
      const res = await sendGroupRoomMessage(roomId, myUserId, myId, myTag, text)
      if (res.crisisTier === 2) {
        setSelfCrisisBanner(true)
        return
      }
      if (res.error) {
        setActiveWarning(res.error)
        setTimeout(() => setActiveWarning(null), 5000)
        return
      }
      setInput('')
    } catch (err: any) {
      setActiveWarning(err?.message || 'Failed to send message.')
      setTimeout(() => setActiveWarning(null), 5000)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="group-room-page">
      {/* Header */}
      <header className="group-header">
        <div className="group-header__left">
          <button
            className="group-back-btn font-mono"
            onClick={() => navigate('/rooms')}
            aria-label="Back to Spaces"
            title="Return to Spaces list"
          >
            ← Spaces
          </button>
          <div className="group-header__titles">
            <h1 className="group-header__title">{roomTitle}</h1>
            <div className="group-header__meta font-mono">
              <span className="group-header__category">{roomCategory}</span>
              <span className="group-header__count">● Open Space</span>
            </div>
          </div>
        </div>

        <div className="group-header__right">
          <SOSButton />
          <div
            className="group-char-pill"
            style={{
              borderColor: `${me.accentColor}55`,
              background: `radial-gradient(circle, ${me.accentColor}22, transparent)`,
            }}
          >
            <span>{me.emoji}</span>
            <span className="group-char-pill__tag font-mono">{myTag}</span>
          </div>
        </div>
      </header>

      {/* Moderation Warning Toast */}
      <AnimatePresence>
        {activeWarning && (
          <motion.div
            className="chat-mod-warning font-mono"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: '#581c1c',
              color: '#fecaca',
              borderBottom: '2px solid #b91c1c',
              padding: '12px 18px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 100,
            }}
          >
            <div>
              <span>🛡️ <strong>Notice:</strong> {activeWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveWarning(null)}
              style={{ background: 'transparent', border: 'none', color: '#fecaca', cursor: 'pointer' }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crisis Banner (Only shown to author if they express distress) */}
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
                Open Helplines
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

      {/* Messages */}
      <main className="group-messages" role="log" aria-live="polite">
        <div className="group-icebreaker font-mono">
          <span>🌿 Welcome to {roomTitle}. This space is open for peer connection and mutual support.</span>
        </div>

        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#71717a', marginTop: '40px', fontSize: '0.9rem' }}>
            No messages in this space yet. Say hello to get things started!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myUserId || msg.senderTag === myTag
            const senderChar = getCharacterById(msg.senderCharacter) || CHARACTERS[0]

            return (
              <motion.div
                key={msg.id}
                className={`group-bubble-wrap ${isMe ? 'group-bubble-wrap--me' : 'group-bubble-wrap--other'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {!isMe && (
                  <div
                    className="group-avatar"
                    style={{
                      borderColor: `${senderChar.accentColor}55`,
                      background: `radial-gradient(circle, ${senderChar.accentColor}22, transparent)`,
                    }}
                  >
                    {senderChar.emoji}
                  </div>
                )}
                <div className="group-bubble-col">
                  {!isMe && <span className="group-sender-tag font-mono">{msg.senderTag}</span>}
                  <div className={`group-bubble ${isMe ? 'group-bubble--me' : 'group-bubble--other'}`}>
                    <p className="group-bubble__text font-body">{msg.text}</p>
                    <span className="group-bubble__time font-mono">{msg.time}</span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="group-input-bar">
        <form onSubmit={handleSend} className="group-input-wrap">
          <input
            type="text"
            className="group-input font-body"
            placeholder="Share what is on your mind..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
          />
          <button
            type="submit"
            className="group-send-btn btn btn-primary"
            disabled={!input.trim() || isSending}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  )
}
