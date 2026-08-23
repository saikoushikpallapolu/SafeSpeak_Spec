import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCharacterById, CHARACTERS } from '../data/characters'
import type { CharacterId } from '@safespeak/shared-types'
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
  const [activeTab, setActiveTab] = useState<'group' | 'oneOnOne'>('group')

  const charId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const character = getCharacterById(charId) || CHARACTERS[0]
  const hasCheckIn = !!sessionStorage.getItem('checkin_answers')

  const handleStartOneOnOne = () => {
    if (hasCheckIn) {
      navigate('/matching')
    } else {
      navigate('/checkin')
    }
  }

  return (
    <div className="rooms-page">
      {/* Header */}
      <header className="rooms-header">
        <div className="rooms-header__left">
          <button
            className="rooms-back-btn font-mono"
            onClick={() => navigate('/characters')}
            aria-label="Back to companion selection"
            title="Return to companion selection"
          >
            ← Characters
          </button>
          <div className="rooms-header__titles">
            <h1 className="rooms-header__title">Session Hub</h1>
            <span className="rooms-header__subtitle font-mono">Anonymous Peer Spaces</span>
          </div>
        </div>

        <div className="rooms-header__right">
          <SOSButton />
        </div>
      </header>

      {/* Mode Switcher Tabs */}
      <div className="rooms-tabs-wrap container">
        <div className="rooms-tabs">
          <button
            className={`rooms-tab font-mono ${activeTab === 'group' ? 'rooms-tab--active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            Group Discussion Rooms
          </button>
          <button
            className={`rooms-tab font-mono ${activeTab === 'oneOnOne' ? 'rooms-tab--active' : ''}`}
            onClick={() => setActiveTab('oneOnOne')}
          >
            1-on-1 Anonymous Match
          </button>
        </div>
      </div>

      {/* Tab 1: Group Discussion Rooms */}
      {activeTab === 'group' && (
        <motion.div
          key="group-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rooms-hero container">
            <div className="rooms-hero__badge font-mono">
              <span className="live-beacon" />
              <span>Real-time topic channels</span>
            </div>
            <h2 className="rooms-hero__heading">Themed Discussion Rooms</h2>
            <p className="rooms-hero__sub">
              Drop into an open channel with peers carrying similar weights. Real-time safety moderation is active across all channels.
            </p>
          </div>

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
                    <span className="room-card__enter font-mono">Enter Room →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: 1-on-1 Anonymous Match */}
      {activeTab === 'oneOnOne' && (
        <motion.div
          key="oneOnOne-view"
          className="oneonone-container container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="oneonone-card">
            <div className="oneonone-card__companion">
              <div className="oneonone-card__avatar-badge">
                <span className="oneonone-avatar">{character.emoji}</span>
              </div>
              <div className="oneonone-card__char-info">
                <span className="oneonone-card__label font-mono">Your Avatar Companion</span>
                <h3 className="oneonone-card__char-name">{character.name} the {character.animal}</h3>
                <button
                  className="oneonone-change-btn font-mono"
                  onClick={() => navigate('/characters')}
                >
                  Change companion →
                </button>
              </div>
            </div>

            <div className="oneonone-card__content">
              <h2 className="oneonone-card__heading">Pair with a peer in a private 1-on-1 session</h2>
              <p className="oneonone-card__desc">
                Connect directly with someone carrying similar emotions. Live multi-language translation, speech-to-text, and automated crisis guidance are fully supported.
              </p>

              <div className="oneonone-features font-mono">
                <span className="oneonone-feat-pill">🛡️ Pre-Send Moderation</span>
                <span className="oneonone-feat-pill">🌐 Live Translation</span>
                <span className="oneonone-feat-pill">🔒 Zero Session Logs</span>
              </div>

              <div className="oneonone-actions">
                <button
                  className="oneonone-primary-btn font-mono"
                  onClick={handleStartOneOnOne}
                >
                  {hasCheckIn ? 'Start 1-on-1 Matching →' : 'Complete Brief Check-in & Match →'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer Notice */}
      <footer className="rooms-footer container font-mono">
        <span>Confidential • Zero Log Retention • Real-Time Safety Safeguards Active</span>
      </footer>
    </div>
  )
}
