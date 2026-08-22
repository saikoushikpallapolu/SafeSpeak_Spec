import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SOSButton from '../components/common/SOSButton'
import './RoomsBrowse.css'

const ROOMS = [
  { id: 'exam', name: 'Exam Stress', desc: 'Boards, deadlines, the kind of tired that sleep doesn\'t fix.', emoji: '📚', active: 12, color: '#C9A84C' },
  { id: 'city', name: 'New to a City', desc: 'Everything is unfamiliar and the loneliness hits differently.', emoji: '🌆', active: 7, color: '#7BAE7F' },
  { id: 'habit', name: 'Quitting a Habit', desc: 'You know you want to. Some days are harder than others.', emoji: '🌀', active: 9, color: '#9B89BC' },
  { id: 'night', name: '3am Thoughts', desc: 'For when sleep won\'t come and the mind won\'t quiet.', emoji: '🌙', active: 21, color: '#C47B7B' },
  { id: 'body', name: 'Body Image', desc: 'Getting dressed, mirrors, comparison. All of it.', emoji: '🪞', active: 5, color: '#D4875A' },
  { id: 'work', name: 'Work Pressure', desc: 'Deadlines, appraisals, the constant feeling of not-enough.', emoji: '💼', active: 8, color: '#7BAE7F' },
]

export default function RoomsBrowse() {
  const navigate = useNavigate()

  return (
    <div className="rooms-page">
      <header className="rooms-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="rooms-header__title font-display">Themed Rooms</h1>
        <SOSButton />
      </header>

      <p className="rooms-intro container font-body">
        Instead of a 1:1 match, join a room built around a topic. Everyone's anonymous. Same rules apply.
      </p>

      <div className="rooms-grid container">
        {ROOMS.map((room, i) => (
          <motion.button
            key={room.id}
            className="room-card"
            style={{ '--room-color': room.color } as React.CSSProperties}
            onClick={() => navigate(`/rooms/${room.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="room-card__emoji">{room.emoji}</div>
            <div className="room-card__content">
              <h2 className="room-card__name font-display">{room.name}</h2>
              <p className="room-card__desc font-body">{room.desc}</p>
            </div>
            <div className="room-card__active font-mono">
              <span className="room-card__dot" />
              {room.active} active
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
