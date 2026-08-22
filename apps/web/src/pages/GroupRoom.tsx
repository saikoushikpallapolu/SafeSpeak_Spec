import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import './GroupRoom.css'

const GROUP_MESSAGES = [
  { id: '1', text: "Just found this room and honestly needed it so much right now.", sender: 'GentleDeer#2234', emoji: '🦌', time: '9:30' },
  { id: '2', text: "Same. Board exams in 3 weeks. I genuinely can't focus for more than 10 minutes.", sender: 'StressedOwl#4821', emoji: '🦉', time: '9:31' },
  { id: '3', text: "Mujhe lag raha tha mai hi aisa feel kar raha hoon. Good to know I'm not alone.", sender: 'QuietPanda#3847', emoji: '🐼', time: '9:32' },
  { id: '4', text: "The 10-minute thing is real. I set a timer now — 10 min, short break, repeat.", sender: 'ShyRabbit#1102', emoji: '🐰', time: '9:33' },
]

export default function GroupRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  const roomName = roomId === 'exam' ? 'Exam Stress' : roomId === 'night' ? '3am Thoughts' : 'Themed Room'

  return (
    <div className="grouproom-page">
      <header className="grouproom-header">
        <button className="btn btn-ghost" onClick={() => navigate('/rooms')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="grouproom-header__center">
          <h1 className="grouproom-header__name">{roomName}</h1>
          <div className="grouproom-header__avatars">
            {['🦌', '🦉', '🐼', '🐰', '+8'].map((e, i) => (
              <span key={i} className="grouproom-avatar">{e}</span>
            ))}
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
        {GROUP_MESSAGES.map((msg) => (
          <motion.div key={msg.id} className="grouproom-msg"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="grouproom-msg__avatar">{msg.emoji}</span>
            <div className="grouproom-msg__content">
              <span className="grouproom-msg__tag">{msg.sender}</span>
              <p className="grouproom-msg__text">{msg.text}</p>
            </div>
            <span className="grouproom-msg__time">{msg.time}</span>
          </motion.div>
        ))}
      </div>

      <div className="grouproom-input-bar">
        <input
          className="input grouproom-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something…"
        />
        <button className="chat-input__send" disabled={!input.trim()}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9l14-7-7 14V9H2z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  )
}
