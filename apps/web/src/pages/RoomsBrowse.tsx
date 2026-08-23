import { useNavigate } from 'react-router-dom'
import SOSButton from '../components/common/SOSButton'
import './RoomsBrowse.css'

interface RoomDefinition {
  id: string
  name: string
  category: string
  desc: string
  active: number
  recentActivity: string
}

const ROOMS: RoomDefinition[] = [
  {
    id: 'exam',
    name: 'Academic & Exam Stress',
    category: 'Academics',
    desc: 'Deadlines, board exams, competitive pressure, and academic burnout.',
    active: 14,
    recentActivity: 'Active 2m ago',
  },
  {
    id: 'city',
    name: 'New in the City',
    category: 'Relocation',
    desc: 'Navigating unfamiliar surroundings, distance from home, and starting fresh.',
    active: 8,
    recentActivity: 'Active 5m ago',
  },
  {
    id: 'habit',
    name: 'Habit Reset & Accountability',
    category: 'Wellness',
    desc: 'Shared support and daily checkpoints for breaking difficult routines.',
    active: 11,
    recentActivity: 'Active just now',
  },
  {
    id: 'night',
    name: 'Late Night Thoughts',
    category: 'Quiet Hours',
    desc: 'A quiet space for when sleep is difficult and the mind is racing.',
    active: 23,
    recentActivity: 'Active just now',
  },
  {
    id: 'body',
    name: 'Self-Perception & Esteem',
    category: 'Identity',
    desc: 'Navigating comparison, body confidence, and quiet self-criticism.',
    active: 6,
    recentActivity: 'Active 8m ago',
  },
  {
    id: 'work',
    name: 'Career & Workplace Pressure',
    category: 'Professional',
    desc: 'Managing deadlines, workplace boundaries, and performance expectations.',
    active: 9,
    recentActivity: 'Active 4m ago',
  },
]

export default function RoomsBrowse() {
  const navigate = useNavigate()

  return (
    <div className="rooms-page">
      {/* Header */}
      <header className="rooms-header">
        <div className="rooms-header__left">
          <button
            className="rooms-back-btn font-mono"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ← Back
          </button>
          <div className="rooms-header__titles">
            <h1 className="rooms-header__title">Peer Discussion Groups</h1>
            <span className="rooms-header__subtitle font-mono">Anonymous Topic Channels</span>
          </div>
        </div>

        <div className="rooms-header__right">
          <SOSButton />
        </div>
      </header>

      {/* Hero Overview */}
      <div className="rooms-hero container">
        <div className="rooms-hero__badge font-mono">
          <span className="live-beacon" />
          <span>Real-time peer channels</span>
        </div>
        <h2 className="rooms-hero__heading">Select a discussion channel</h2>
        <p className="rooms-hero__sub">
          Join an open conversation with peers experiencing similar situations. Moderated in real-time, completely anonymous, with zero session logs retained.
        </p>
      </div>

      {/* Grid of Channels */}
      <div className="rooms-grid-wrap container">
        <div className="rooms-grid">
          {ROOMS.map((room) => (
            <div
              key={room.id}
              className="room-card"
              onClick={() => navigate(`/rooms/${room.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/rooms/${room.id}`)}
            >
              <div className="room-card__top">
                <span className="room-card__category font-mono">{room.category}</span>
                <span className="room-card__status font-mono">
                  <span className="room-card__pulse" />
                  {room.active} active
                </span>
              </div>

              <div className="room-card__body">
                <h3 className="room-card__title">{room.name}</h3>
                <p className="room-card__desc">{room.desc}</p>
              </div>

              <div className="room-card__footer">
                <span className="room-card__activity font-mono">{room.recentActivity}</span>
                <span className="room-card__enter font-mono">Enter Space →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notice */}
      <footer className="rooms-footer container font-mono">
        <span>Confidential • Zero Log Retention • Real-Time Safety Active</span>
      </footer>
    </div>
  )
}
