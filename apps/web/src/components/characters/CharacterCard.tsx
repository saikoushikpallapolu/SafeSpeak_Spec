import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import type { CharacterData } from '../../data/characters'
import { OwlModel, DeerModel, PandaModel, RabbitModel, CapybaraModel, AxolotlModel } from './CharacterModels'
import './CharacterCard.css'

interface Props {
  character: CharacterData
  selected: boolean
  hovered: boolean
  onSelect: () => void
  onHover: (v: boolean) => void
  compact?: boolean
}

function ModelComponent({ id, hovered, selected }: { id: string; hovered: boolean; selected: boolean }) {
  switch (id) {
    case 'owl':      return <OwlModel hovered={hovered} selected={selected} />
    case 'deer':     return <DeerModel hovered={hovered} selected={selected} />
    case 'panda':    return <PandaModel hovered={hovered} selected={selected} />
    case 'rabbit':   return <RabbitModel hovered={hovered} selected={selected} />
    case 'capybara': return <CapybaraModel hovered={hovered} selected={selected} />
    case 'axolotl':  return <AxolotlModel hovered={hovered} selected={selected} />
    default: return null
  }
}

export default function CharacterCard({ character, selected, hovered, onSelect, onHover, compact }: Props) {
  return (
    <button
      className={`char-card ${selected ? 'char-card--selected' : ''} ${hovered ? 'char-card--hovered' : ''} ${compact ? 'char-card--compact' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      aria-pressed={selected}
      aria-label={`${character.name} the ${character.animal} — ${character.situation}`}
    >
      {/* Glow ring */}
      <div
        className="char-card__glow"
        style={{ '--glow-color': character.accentColor } as React.CSSProperties}
      />

      {/* 3D Canvas */}
      <div className="char-card__canvas">
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 3]} intensity={1.2} color="#F0EDE6" />
          <directionalLight position={[-2, -1, -2]} intensity={0.3} color={character.accentColor} />
          <Suspense fallback={null}>
            <ModelComponent id={character.id} hovered={hovered} selected={selected} />
          </Suspense>
        </Canvas>
      </div>

      {/* Info */}
      <div className="char-card__info">
        <div className="char-card__name-row">
          <span className="char-card__name">{character.name}</span>
          <span className="char-card__animal">{character.animal}</span>
        </div>
        <p className="char-card__situation">"{character.situation}"</p>
        {!compact && (
          <p className="char-card__description">{character.description}</p>
        )}
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="char-card__check">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  )
}
