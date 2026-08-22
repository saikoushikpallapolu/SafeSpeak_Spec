import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CHARACTERS } from '../data/characters'
import './AddFriend.css'

export default function AddFriend() {
  const navigate = useNavigate()
  const [tagInput, setTagInput] = useState('')
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleAdd = () => {
    const clean = tagInput.trim()
    if (!clean) {
      setError('Please enter an anonymous tag (e.g. GentleDeer#4821)')
      return
    }
    if (!clean.includes('#')) {
      setError('Tag must be in Name#1234 format')
      return
    }

    const stored = localStorage.getItem('safespeak_anonymous_friends')
    let friends = []
    if (stored) {
      try {
        friends = JSON.parse(stored)
      } catch {
        friends = []
      }
    }

    // Check duplicate
    if (friends.some((f: any) => f.tag.toLowerCase() === clean.toLowerCase())) {
      setError('This friend is already in your list')
      return
    }

    const newFriend = {
      tag: clean,
      emoji: selectedChar.emoji,
      character: selectedChar.id,
      lastSeen: 'Just added',
      accentColor: selectedChar.accentColor,
    }

    friends.push(newFriend)
    localStorage.setItem('safespeak_anonymous_friends', JSON.stringify(friends))
    setSuccess(true)

    setTimeout(() => {
      navigate('/friends')
    }, 1200)
  }

  return (
    <div className="addfriend-page">
      <div className="addfriend-backdrop" onClick={() => navigate(-1)} />
      <motion.div
        className="addfriend-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="addfriend-avatar">{selectedChar.emoji}</div>
        <h2 className="addfriend-title font-display">
          {success ? 'Friend Added!' : 'Add Anonymous Friend'}
        </h2>

        {success ? (
          <p className="addfriend-note font-body" style={{ color: '#7BAE7F', margin: '16px 0' }}>
            ✓ Successfully added to your reconnect list.
          </p>
        ) : (
          <>
            <p className="addfriend-note font-body">
              Enter the anonymous tag shared with you at the end of a conversation. No real identity is ever shared.
            </p>

            <div className="addfriend-input-wrap">
              <input
                className="addfriend-tag-input font-mono"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value)
                  setError('')
                }}
                placeholder="e.g. GentleDeer#4821"
                autoFocus
              />
              {error && <p className="addfriend-error-msg font-mono">{error}</p>}
            </div>

            {/* Pick Avatar for friend */}
            <div className="addfriend-avatar-picker">
              <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                CHOOSE COMPANION ICON
              </span>
              <div className="addfriend-avatars-row">
                {CHARACTERS.map((c) => (
                  <button
                    key={c.id}
                    className={`addfriend-char-opt ${selectedChar.id === c.id ? 'addfriend-char-opt--active' : ''}`}
                    onClick={() => setSelectedChar(c)}
                    type="button"
                  >
                    {c.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="addfriend-actions">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Friend
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
