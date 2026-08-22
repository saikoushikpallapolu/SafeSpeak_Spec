import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './FeelingWeather.css'

interface WeatherOption {
  id: string
  emoji: string
  label: string
  description: string
  affirmation: string
}

const WEATHERS: WeatherOption[] = [
  {
    id: 'rain',
    emoji: '🌧️',
    label: 'Heavy Rain',
    description: 'Downcast, exhausting, heavy in your chest',
    affirmation: "It's okay to feel weighed down. Rain doesn't last forever, and you don't have to force yourself to be okay right now.",
  },
  {
    id: 'overcast',
    emoji: '⛅',
    label: 'Overcast',
    description: 'Quiet background tension or numbness',
    affirmation: "Carrying a quiet weight is still tiring. Be exceptionally gentle with yourself today.",
  },
  {
    id: 'storm',
    emoji: '🌪️',
    label: 'Stormy',
    description: 'Racing thoughts, anxious chaos, overwhelmed',
    affirmation: "When the mind storms, focus on one steady thing: your breath. You are safe in this moment.",
  },
  {
    id: 'clearing',
    emoji: '☀️',
    label: 'Clearing Up',
    description: 'A little breathing room or hope',
    affirmation: "Celebrate even a small moment of lightness. You've navigated through a lot to get here.",
  },
]

export default function FeelingWeather() {
  const [selected, setSelected] = useState<WeatherOption | null>(null)

  return (
    <div className="feeling-weather-card">
      <div className="feeling-weather-header">
        <span className="feeling-weather-tag font-mono">EMOTIONAL WEATHER</span>
        <h3 className="feeling-weather-title font-display">How does your mind feel right now?</h3>
      </div>

      <div className="feeling-weather-grid">
        {WEATHERS.map((w) => (
          <button
            key={w.id}
            className={`feeling-weather-opt ${selected?.id === w.id ? 'feeling-weather-opt--active' : ''}`}
            onClick={() => setSelected(w)}
            aria-label={w.label}
          >
            <span className="feeling-weather-emoji">{w.emoji}</span>
            <span className="feeling-weather-name font-mono">{w.label}</span>
            <span className="feeling-weather-sub">{w.description}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="feeling-weather-affirmation"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="affirmation-icon">{selected.emoji}</span>
            <p className="affirmation-text font-body">{selected.affirmation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
