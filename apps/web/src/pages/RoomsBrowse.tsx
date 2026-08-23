import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacterById, CHARACTERS } from '../data/characters'
import type { CharacterId } from '@safespeak/shared-types'
import SOSButton from '../components/common/SOSButton'
import { subscribeToRooms, createCustomRoom, type CustomRoom } from '../services/firestoreRooms'
import './RoomsBrowse.css'

export default function RoomsBrowse() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'group' | 'oneOnOne'>('group')
  const [rooms, setRooms] = useState<CustomRoom[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomCategory, setNewRoomCategory] = useState('General')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const charId = (sessionStorage.getItem('character') || 'owl') as CharacterId
  const character = getCharacterById(charId) || CHARACTERS[0]
  const userTag = sessionStorage.getItem('user_tag') || `${character.name}#${Math.floor(1000 + Math.random() * 9000)}`
  const hasCheckIn = !!sessionStorage.getItem('checkin_answers')

  useEffect(() => {
    const unsub = subscribeToRooms((fetched) => {
      setRooms(fetched)
    })
    return () => unsub()
  }, [])

  const handleStartOneOnOne = () => {
    if (hasCheckIn) {
      navigate('/matching')
    } else {
      navigate('/checkin')
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim() || isCreating) return

    setIsCreating(true)
    try {
      const roomId = await createCustomRoom({
        name: newRoomName.trim(),
        category: newRoomCategory.trim() || 'General',
        desc: newRoomDesc.trim() || 'A safe open space for anyone to join.',
        creatorTag: userTag,
      })
      setShowCreateModal(false)
      setNewRoomName('')
      setNewRoomDesc('')
      navigate(`/rooms/${roomId}`)
    } catch (err) {
      console.error('Failed to create room:', err)
    } finally {
      setIsCreating(false)
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
            <h1 className="rooms-header__title">Community Spaces</h1>
            <span className="rooms-header__subtitle font-mono">Real-Time Open Rooms</span>
          </div>
        </div>

        <div className="rooms-header__right">
          <SOSButton />
          <div
            className="rooms-char-pill"
            style={{
              borderColor: `${character.accentColor}55`,
              background: `radial-gradient(circle, ${character.accentColor}22, transparent)`,
            }}
          >
            <span className="rooms-char-pill__emoji">{character.emoji}</span>
            <span className="rooms-char-pill__tag font-mono">{userTag}</span>
          </div>
        </div>
      </header>

      {/* Hero Callout */}
      <div className="rooms-hero">
        <div className="rooms-hero__glow" />
        <h2 className="rooms-hero__heading font-display">Create or Join a Live Space</h2>
        <p className="rooms-hero__sub font-body">
          Open group rooms created by peers in real-time. Hop into any active conversation anonymously.
        </p>

        {/* Mode Toggle */}
        <div className="rooms-tabs font-mono" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'group'}
            className={`rooms-tab ${activeTab === 'group' ? 'rooms-tab--active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            👥 Live Open Rooms ({rooms.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'oneOnOne'}
            className={`rooms-tab ${activeTab === 'oneOnOne' ? 'rooms-tab--active' : ''}`}
            onClick={() => setActiveTab('oneOnOne')}
          >
            🔒 1-on-1 Matching
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="rooms-content">
        {activeTab === 'group' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="rooms-section-title font-mono" style={{ margin: 0 }}>
                {rooms.length === 0 ? 'No Active Rooms' : `${rooms.length} Active Space${rooms.length === 1 ? '' : 's'}`}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
              >
                + Create a Room
              </button>
            </div>

            {rooms.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '50px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed #3f3f46',
                  borderRadius: '16px',
                  color: '#a1a1aa',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
                <h3 className="font-display" style={{ color: '#f4f4f5', marginBottom: '8px' }}>No rooms created yet</h3>
                <p style={{ maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
                  Be the first to open a space. Anyone online can join and chat with you in real-time.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create First Room
                </button>
              </div>
            ) : (
              <div className="rooms-grid">
                {rooms.map((room, idx) => (
                  <motion.div
                    key={room.id}
                    className="room-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/rooms/${room.id}`)}
                  >
                    <div className="room-card__header">
                      <span className="room-card__category font-mono">{room.category}</span>
                      <span className="room-card__badge font-mono">● Active</span>
                    </div>

                    <h3 className="room-card__title font-display">{room.name}</h3>
                    <p className="room-card__desc font-body">{room.desc}</p>

                    <div className="room-card__footer font-mono">
                      <span className="room-card__active">Created by {room.creatorTag}</span>
                      <span className="room-card__join-btn">Join Space →</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rooms-one-on-one">
            <div className="one-on-one-card">
              <div className="one-on-one-card__glow" />
              <div className="one-on-one-card__icon">{character.emoji}</div>
              <h3 className="one-on-one-card__title font-display">1-on-1 Emotion-Matched Chat</h3>
              <p className="one-on-one-card__desc font-body">
                Get paired with an anonymous peer navigating the exact same emotional landscape as you. Fully private with real-time translation.
              </p>
              <button
                type="button"
                className="btn btn-primary one-on-one-card__btn"
                onClick={handleStartOneOnOne}
              >
                {hasCheckIn ? 'Find an Anonymous Peer →' : 'Start Emotional Check-In →'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="rooms-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(6px)',
            }}
          >
            <motion.div
              className="rooms-create-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '460px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              }}
            >
              <h3 className="font-display" style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
                Create an Open Room
              </h3>
              <p className="font-body" style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '18px' }}>
                Open spaces are public for any online user to discover and join.
              </p>

              <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="font-mono" style={{ display: 'block', fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '6px' }}>
                    ROOM NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Late Night Study Grind, Venting Space, Anime & Chill"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#27272a',
                      border: '1px solid #52525b',
                      borderRadius: '8px',
                      color: '#f4f4f5',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label className="font-mono" style={{ display: 'block', fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '6px' }}>
                    CATEGORY / THEME
                  </label>
                  <select
                    value={newRoomCategory}
                    onChange={(e) => setNewRoomCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#27272a',
                      border: '1px solid #52525b',
                      borderRadius: '8px',
                      color: '#f4f4f5',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="Academics">Academics & Exams</option>
                    <option value="Venting">Safe Venting</option>
                    <option value="Late Night">Late Night Thoughts</option>
                    <option value="Wellness">Wellness & Habits</option>
                    <option value="General">General & Casual</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono" style={{ display: 'block', fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '6px' }}>
                    DESCRIPTION (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="What is this space for?"
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#27272a',
                      border: '1px solid #52525b',
                      borderRadius: '8px',
                      color: '#f4f4f5',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowCreateModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!newRoomName.trim() || isCreating}
                    style={{ flex: 1 }}
                  >
                    {isCreating ? 'Creating…' : 'Launch Space'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
