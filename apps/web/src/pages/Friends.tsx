import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SOSButton from '../components/common/SOSButton'
import './Friends.css'

interface AnonymousFriend {
  tag: string
  emoji: string
  character: string
  lastSeen: string
  accentColor: string
}

const DEFAULT_FRIENDS: AnonymousFriend[] = [
  { tag: 'StressedOwl#1204', emoji: '🦉', character: 'owl', lastSeen: 'Just now', accentColor: '#C9A84C' },
  { tag: 'GentleDeer#8821', emoji: '🦌', character: 'deer', lastSeen: '1 hour ago', accentColor: '#7BAE7F' },
]

export default function Friends() {
  const navigate = useNavigate()
  const [friends, setFriends] = useState<AnonymousFriend[]>([])
  const [copied, setCopied] = useState(false)

  const charId = sessionStorage.getItem('character') || 'owl'
  const myTag = sessionStorage.getItem('my_tag') || `${charId.charAt(0).toUpperCase() + charId.slice(1)}#${Math.floor(1000 + Math.random() * 9000)}`

  useEffect(() => {
    sessionStorage.setItem('my_tag', myTag)
    const stored = localStorage.getItem('safespeak_anonymous_friends')
    if (stored) {
      try {
        setFriends(JSON.parse(stored))
      } catch {
        setFriends(DEFAULT_FRIENDS)
      }
    } else {
      setFriends(DEFAULT_FRIENDS)
      localStorage.setItem('safespeak_anonymous_friends', JSON.stringify(DEFAULT_FRIENDS))
    }
  }, [myTag])

  const copyMyTag = () => {
    navigator.clipboard.writeText(myTag)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const removeFriend = (tag: string) => {
    const updated = friends.filter(f => f.tag !== tag)
    setFriends(updated)
    localStorage.setItem('safespeak_anonymous_friends', JSON.stringify(updated))
  }

  const startChat = (friend: AnonymousFriend) => {
    const roomId = `room_friend_${friend.character}_${Date.now()}`
    const matchPayload = {
      roomId,
      peerSocketId: 'peer_friend',
      peerCharacter: friend.character,
      peerTag: friend.tag,
      peerLanguage: 'English',
      myCharacter: charId,
      myTag,
      myLanguage: 'English',
      sharedContext: 'reconnecting with an anonymous peer',
      icebreaker: `Hey! Good to reconnect with you again.`,
      isSimulatedPeer: true,
    }
    sessionStorage.setItem('current_match', JSON.stringify(matchPayload))
    navigate(`/chat/${roomId}`)
  }

  return (
    <div className="friends-page">
      <header className="friends-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="friends-header__title font-display">Anonymous Friends</h1>
        <SOSButton />
      </header>

      <div className="friends-body container">
        {/* Your tag */}
        <motion.div className="friends-my-tag" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="friends-my-tag__label font-mono">YOUR ANONYMOUS TAG</p>
          <div className="my-tag-display-row">
            <p className="friends-my-tag__value font-display">{myTag}</p>
            <button className="btn btn-ghost copy-tag-btn font-mono" onClick={copyMyTag}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="friends-my-tag__note font-body">
            Share this tag to reconnect later. It never reveals your identity or chat history.
          </p>
        </motion.div>

        {/* Add Friend Action Bar */}
        <div className="friends-actions-bar">
          <button className="btn btn-secondary add-friend-btn font-mono" onClick={() => navigate('/friends/add')}>
            + Add Friend by Tag
          </button>
        </div>

        {/* Friends list */}
        {friends.length > 0 ? (
          <div className="friends-list">
            {friends.map((f, i) => (
              <motion.div
                key={f.tag}
                className="friend-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <div
                  className="friend-card__avatar"
                  style={{ background: `${f.accentColor}15`, border: `1.5px solid ${f.accentColor}30` }}
                >
                  {f.emoji}
                </div>
                <div className="friend-card__info">
                  <p className="friend-card__tag font-display">{f.tag}</p>
                  <p className="friend-card__last font-mono">Active {f.lastSeen}</p>
                </div>
                <div className="friend-card__actions">
                  <button className="btn btn-primary friend-card__chat" onClick={() => startChat(f)}>
                    Chat
                  </button>
                  <button
                    className="btn btn-ghost friend-card__remove"
                    onClick={() => removeFriend(f.tag)}
                    aria-label="Remove friend"
                    title="Remove friend"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="friends-empty">
            <p className="font-display">🌿 No anonymous friends yet.</p>
            <p className="font-body" style={{ color: 'var(--color-text-muted)' }}>
              After a supportive conversation, you can exchange tags to reconnect here — no identity required.
            </p>
          </div>
        )}

        <button className="btn btn-primary friends-match-btn" onClick={() => navigate('/characters')}>
          Find a new match
        </button>
      </div>
    </div>
  )
}
