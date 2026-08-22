import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGroupRoom } from '../hooks/useSafeSpeakSocket'
import { getCharacterById } from '../data/characters'
import type { CharacterId } from '@safespeak/shared-types'
import './GroupRoom.css'

const DEFAULT_GROUP_SEED: Record<string, any[]> = {
  exam: [
    { id: 's1', text: "Just found this room and honestly needed it so much right now.", senderTag: 'GentleDeer#2234', senderCharacter: 'deer', time: '9:30' },
    { id: 's2', text: "Same. Board exams in 3 weeks. I genuinely can't focus for more than 10 minutes.", senderTag: 'StressedOwl#4821', senderCharacter: 'owl', time: '9:31' },
    { id: 's3', text: "Mujhe lag raha tha mai hi aisa feel kar raha hoon. Good to know I'm not alone.", senderTag: 'QuietPanda#3847', senderCharacter: 'panda', time: '9:32' },
    { id: 's4', text: "The 10-minute thing is real. I set a timer now — 10 min, short break, repeat.", senderTag: 'ShyRabbit#1102', senderCharacter: 'rabbit', time: '9:33' },
  ],
  night: [
    { id: 'n1', text: "Why does the brain wait until 3am to replay every awkward moment?", senderTag: 'NightOwl#1029', senderCharacter: 'owl', time: '3:04' },
    { id: 'n2', text: "Can't turn my mind off either. Listening to the quiet helps a little though.", senderTag: 'QuietPanda#8841', senderCharacter: 'panda', time: '3:06' },
  ],
}

export default function GroupRoom() {
  const { roomId = 'exam' } = useParams()
  const navigate = useNavigate()

  const myId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const me = getCharacterById(myId)
  const myTag = `${me?.name || 'User'}#${Math.floor(1000 + Math.random() * 9000)}`

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, activeCount, crisisAlert, sendGroupMessage } = useGroupRoom(roomId, myId, myTag)

  // Seed messages + live socket messages
  const seed = DEFAULT_GROUP_SEED[roomId] || DEFAULT_GROUP_SEED.exam
  const allMessages = [...seed, ...messages]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  useEffect(() => {
    if (crisisAlert && crisisAlert.tier === 2) {
      navigate('/safety/crisis')
    }
  }, [crisisAlert, navigate])

  const roomNames: Record<string, string> = {
    exam: 'Exam Stress',
    city: 'New to a City',
    habit: 'Quitting a Habit',
    night: '3am Thoughts',
    body: 'Body Image',
    work: 'Work Pressure',
  }

  const roomName = roomNames[roomId] || 'Themed Room'

  const handleSend = () => {
    if (!input.trim()) return
    sendGroupMessage(input.trim())
    setInput('')
  }

  return (
    <div className="grouproom-page">
      <header className="grouproom-header">
        <button className="btn btn-ghost" onClick={() => navigate('/rooms')} aria-label="Back to rooms">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="grouproom-header__center">
          <h1 className="grouproom-header__name">{roomName}</h1>
          <div className="grouproom-header__avatars">
            {['🦌', '🦉', '🐼', '🐰'].map((e, i) => (
              <span key={i} className="grouproom-avatar">{e}</span>
            ))}
            <span className="grouproom-count-badge font-mono">+{activeCount} live</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/resources')} aria-label="Help">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12V9M9 6.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="grouproom-messages" role="log">
        {allMessages.map((msg) => {
          const char = getCharacterById(msg.senderCharacter)
          const emoji = char ? char.emoji : '👤'

          return (
            <motion.div
              key={msg.id}
              className="grouproom-msg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="grouproom-msg__avatar">{emoji}</span>
              <div className="grouproom-msg__content">
                <span className="grouproom-msg__tag font-mono">{msg.senderTag}</span>
                <p className="grouproom-msg__text font-body">{msg.text}</p>
              </div>
              <span className="grouproom-msg__time font-mono">{msg.time}</span>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="grouproom-input-bar">
        <input
          className="input grouproom-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={`Share anonymously with ${roomName}…`}
        />
        <button
          className="chat-input__send"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9l14-7-7 14V9H2z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  )
}
