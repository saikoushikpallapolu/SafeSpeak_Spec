import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGroupRoom } from '../hooks/useSafeSpeakSocket'
import type { CharacterId } from '@safespeak/shared-types'
import SOSButton from '../components/common/SOSButton'
import './GroupRoom.css'

interface SeedMessage {
  id: string
  text: string
  senderTag: string
  senderCharacter: string
  time: string
}

const DEFAULT_GROUP_SEED: Record<string, SeedMessage[]> = {
  exam: [
    { id: 's1', text: "Just joined this space. Really needed a place to talk through exam stress.", senderTag: 'Peer#2234', senderCharacter: 'deer', time: '09:30' },
    { id: 's2', text: "Finals are in two weeks and my concentration has been completely scattered.", senderTag: 'Peer#4821', senderCharacter: 'owl', time: '09:31' },
    { id: 's3', text: "I kept feeling like I was the only one falling behind. Good to know I'm not alone in this.", senderTag: 'Peer#3847', senderCharacter: 'panda', time: '09:32' },
    { id: 's4', text: "Breaking review sessions into 25-minute intervals helped lower the panic for me.", senderTag: 'Peer#1102', senderCharacter: 'rabbit', time: '09:33' },
  ],
  night: [
    { id: 'n1', text: "The house is completely quiet but my thoughts are replaying past conversations.", senderTag: 'Peer#1029', senderCharacter: 'owl', time: '03:04' },
    { id: 'n2', text: "Listening to ambient rain audio right now. Helps slow the racing thoughts a bit.", senderTag: 'Peer#8841', senderCharacter: 'panda', time: '03:06' },
  ],
  city: [
    { id: 'c1', text: "Moved to a new city two weeks ago. The silence in the apartment hits hard in the evening.", senderTag: 'Peer#9912', senderCharacter: 'deer', time: '20:15' },
    { id: 'c2', text: "Finding a regular coffee spot helped me establish a small anchor point. Take it day by day.", senderTag: 'Peer#3310', senderCharacter: 'capybara', time: '20:18' },
  ],
  habit: [
    { id: 'h1', text: "Day 4 of resetting my daily routine. Evenings are definitely the hardest checkpoint.", senderTag: 'Peer#5541', senderCharacter: 'penguin', time: '19:40' },
    { id: 'h2', text: "Small continuous wins matter. Be patient with yourself when the urge creeps in.", senderTag: 'Peer#1129', senderCharacter: 'deer', time: '19:44' },
  ],
  body: [
    { id: 'b1', text: "Catching my reflection in windows still triggers automatic comparison. Working on gentle neutrality.", senderTag: 'Peer#4420', senderCharacter: 'rabbit', time: '18:10' },
    { id: 'b2', text: "Unfollowing curated highlight accounts was an immediate relief for my mental space.", senderTag: 'Peer#8831', senderCharacter: 'owl', time: '18:15' },
  ],
  work: [
    { id: 'w1', text: "Constantly feeling like everything is urgent. Struggling to disconnect after work hours.", senderTag: 'Peer#7719', senderCharacter: 'capybara', time: '19:02' },
    { id: 'w2', text: "Setting a strict notification cutoff in the evening gave me my peace back. Highly recommend.", senderTag: 'Peer#6620', senderCharacter: 'deer', time: '19:07' },
  ],
}

const ROOM_NAMES: Record<string, { title: string; category: string }> = {
  exam: { title: 'Academic & Exam Stress', category: 'Academics' },
  city: { title: 'New in the City', category: 'Relocation' },
  habit: { title: 'Habit Reset & Accountability', category: 'Wellness' },
  night: { title: 'Late Night Thoughts', category: 'Quiet Hours' },
  body: { title: 'Self-Perception & Esteem', category: 'Identity' },
  work: { title: 'Career & Workplace Pressure', category: 'Professional' },
}

export default function GroupRoom() {
  const { roomId = 'exam' } = useParams()
  const navigate = useNavigate()

  const myId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const myTag = sessionStorage.getItem('user_tag') || `Peer#${Math.floor(1000 + Math.random() * 9000)}`

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

  const roomInfo = ROOM_NAMES[roomId] || { title: 'Community Discussion', category: 'General' }

  const handleSend = () => {
    if (!input.trim()) return
    sendGroupMessage(input.trim())
    setInput('')
  }

  return (
    <div className="grouproom-page">
      {/* Top Header Bar */}
      <header className="grouproom-header">
        <div className="grouproom-header__left">
          <button
            className="grouproom-back-btn font-mono"
            onClick={() => navigate('/rooms')}
            aria-label="Back to channels"
          >
            ← Channels
          </button>

          <div className="grouproom-header__info">
            <div className="grouproom-header__title-row">
              <h1 className="grouproom-header__title">{roomInfo.title}</h1>
              <span className="grouproom-header__badge font-mono">{roomInfo.category}</span>
            </div>
            <div className="grouproom-header__meta font-mono">
              <span className="live-dot" />
              <span>{activeCount || 12} peers active</span>
            </div>
          </div>
        </div>

        <div className="grouproom-header__right">
          <SOSButton />
          <button
            className="grouproom-info-btn font-mono"
            onClick={() => navigate('/resources')}
            aria-label="Resources"
          >
            Resources
          </button>
        </div>
      </header>

      {/* Main Chat Message Feed */}
      <div className="grouproom-feed" role="log" aria-live="polite">
        {/* Security Banner */}
        <div className="grouproom-banner font-mono">
          <span>Encrypted anonymous channel • Zero logs stored</span>
        </div>

        {allMessages.map((msg, index) => {
          const isMe = msg.senderTag === myTag || msg.senderCharacter === myId && index >= seed.length

          return (
            <div
              key={msg.id || index}
              className={`grouproom-item ${isMe ? 'grouproom-item--me' : ''}`}
            >
              <div className="grouproom-item__header font-mono">
                <span className="grouproom-item__author">{isMe ? 'You' : msg.senderTag}</span>
                <span className="grouproom-item__time">{msg.time}</span>
              </div>
              <div className="grouproom-item__bubble">
                <p className="grouproom-item__text">{msg.text}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <footer className="grouproom-input-bar">
        <div className="grouproom-input-box">
          <input
            className="grouproom-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Type a message in ${roomInfo.title}…`}
            aria-label="Group message"
          />
          <button
            className="grouproom-submit-btn font-mono"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  )
}
