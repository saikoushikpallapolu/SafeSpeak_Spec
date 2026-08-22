import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, MeshToonMaterial, Color } from 'three'

/* ── Shared Material factory ── */
function toon(color: string, emissiveIntensity = 0.05) {
  return new MeshToonMaterial({
    color: new Color(color),
    emissive: new Color(color),
    emissiveIntensity,
  })
}

/* ════════════════════════════════════════
   OWL — Stardust
   Round body, big eyes, ear tufts
   ════════════════════════════════════════ */
export function OwlModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)
  const bodyRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    // Breathing
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    // Hover bob
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    // Gentle rotate
    group.current.rotation.y += delta * 0.3
    if (selected) group.current.rotation.y += delta * 1.2
  })

  const bodyColor = '#8B7355'
  const headColor = '#9E8468'
  const eyeColor = '#F5E6C8'
  const pupilColor = '#1A1A1A'
  const wingColor = '#6B5840'
  const bellyColor = '#D4C4A8'

  return (
    <group ref={group} dispose={null}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, -0.3, 0]} castShadow>
        <icosahedronGeometry args={[0.7, 1]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Belly patch */}
      <mesh position={[0, -0.25, 0.55]}>
        <sphereGeometry args={[0.38, 8, 8]} />
        <primitive object={toon(bellyColor)} attach="material" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.52, 10, 10]} />
        <primitive object={toon(headColor)} attach="material" />
      </mesh>

      {/* Eyes */}
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.6, 0.42]}>
          <mesh>
            <sphereGeometry args={[0.14, 8, 8]} />
            <primitive object={toon(eyeColor)} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <primitive object={toon(pupilColor)} attach="material" />
          </mesh>
          {/* Eye shine */}
          <mesh position={[0.04, 0.04, 0.15]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <primitive object={toon('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Ear tufts */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0.05]} rotation={[0, 0, i === 0 ? -0.4 : 0.4]}>
          <coneGeometry args={[0.1, 0.3, 5]} />
          <primitive object={toon(bodyColor)} attach="material" />
        </mesh>
      ))}

      {/* Wings */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.75, -0.2, -0.1]} rotation={[0.1, side * 0.3, side * 0.4]}>
          <boxGeometry args={[0.25, 0.65, 0.1]} />
          <primitive object={toon(wingColor)} attach="material" />
        </mesh>
      ))}

      {/* Beak */}
      <mesh position={[0, 0.5, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.18, 4]} />
        <primitive object={toon('#C9A84C')} attach="material" />
      </mesh>

      {/* Feet */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.95, 0.1]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.15, 5]} />
          <primitive object={toon('#C9A84C')} attach="material" />
        </mesh>
      ))}

      {selected && <pointLight color="#C9A84C" intensity={2} distance={3} />}
    </group>
  )
}

/* ════════════════════════════════════════
   DEER — Echo
   Slender, antlers, gentle long neck
   ════════════════════════════════════════ */
export function DeerModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.1) * 0.02
    group.current.rotation.y += delta * (selected ? 1.5 : 0.25)
  })

  const bodyColor = '#A0826D'
  const spotColor = '#C8A882'
  const noseColor = '#D4875A'

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.7, 0.65, 0.55]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.32, 0.2]}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <primitive object={toon(spotColor)} attach="material" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.12, 0.1]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 7]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.62, 0.18]}>
        <icosahedronGeometry args={[0.38, 1]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Face — lighter snout */}
      <mesh position={[0, 0.55, 0.5]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <primitive object={toon(spotColor)} attach="material" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.5, 0.67]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <primitive object={toon(noseColor)} attach="material" />
      </mesh>

      {/* Eyes */}
      {[-0.18, 0.18].map((x, i) => (
        <group key={i} position={[x, 0.68, 0.46]}>
          <mesh>
            <sphereGeometry args={[0.08, 8, 8]} />
            <primitive object={toon('#2A1A0A')} attach="material" />
          </mesh>
          <mesh position={[0.03, 0.03, 0.06]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <primitive object={toon('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Ears */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.92, 0.1]} rotation={[0, 0, i === 0 ? -0.6 : 0.6]}>
          <coneGeometry args={[0.12, 0.35, 5]} />
          <primitive object={toon(bodyColor)} attach="material" />
        </mesh>
      ))}

      {/* Antlers */}
      {[-0.22, 0.22].map((x, side) => (
        <group key={side} position={[x, 1.05, 0.05]}>
          <mesh rotation={[0, 0, side === 0 ? -0.3 : 0.3]}>
            <cylinderGeometry args={[0.03, 0.04, 0.45, 5]} />
            <primitive object={toon('#8B6914')} attach="material" />
          </mesh>
          {/* Branch */}
          <mesh position={[side === 0 ? -0.1 : 0.1, 0.2, 0]} rotation={[0, 0, side === 0 ? -1.1 : 1.1]}>
            <cylinderGeometry args={[0.02, 0.03, 0.25, 4]} />
            <primitive object={toon('#8B6914')} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Legs */}
      {[[-0.22, -0.15], [0.22, -0.15], [-0.22, 0.15], [0.22, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.75, z]}>
          <cylinderGeometry args={[0.06, 0.04, 0.35, 5]} />
          <primitive object={toon(bodyColor)} attach="material" />
        </mesh>
      ))}

      {selected && <pointLight color="#D4875A" intensity={2} distance={3} />}
    </group>
  )
}

/* ════════════════════════════════════════
   PANDA — Cosmo
   Round, black & white, soft and plump
   ════════════════════════════════════════ */
export function PandaModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.3) * 0.02
    group.current.rotation.y += delta * (selected ? 1.5 : 0.2)
  })

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, -0.25, 0]}>
        <sphereGeometry args={[0.72, 10, 10]} />
        <primitive object={toon('#E8E4DC')} attach="material" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.55, 10, 10]} />
        <primitive object={toon('#E8E4DC')} attach="material" />
      </mesh>

      {/* Black eye patches */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.72, 0.42]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <primitive object={toon('#1A1A1A')} attach="material" />
        </mesh>
      ))}

      {/* Eyes — white + pupil */}
      {[-0.18, 0.18].map((x, i) => (
        <group key={i} position={[x, 0.72, 0.52]}>
          <mesh>
            <sphereGeometry args={[0.085, 8, 8]} />
            <primitive object={toon('#F5F5F5')} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.05, 7, 7]} />
            <primitive object={toon('#111')} attach="material" />
          </mesh>
          <mesh position={[0.025, 0.025, 0.1]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <primitive object={toon('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Ears (black) */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0.0]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <primitive object={toon('#1A1A1A')} attach="material" />
        </mesh>
      ))}

      {/* Nose */}
      <mesh position={[0, 0.57, 0.53]}>
        <sphereGeometry args={[0.06, 7, 7]} />
        <primitive object={toon('#1A1A1A')} attach="material" />
      </mesh>

      {/* Arms — black */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, -0.1, 0.2]} rotation={[0, 0, i === 0 ? 0.5 : -0.5]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <primitive object={toon('#1A1A1A')} attach="material" />
        </mesh>
      ))}

      {/* Legs */}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, -0.88, 0.3]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <primitive object={toon('#1A1A1A')} attach="material" />
        </mesh>
      ))}

      {selected && <pointLight color="#9BAF98" intensity={2} distance={3} />}
    </group>
  )
}

/* ════════════════════════════════════════
   RABBIT — Mochi
   Soft oval body, long ears, shy pose
   ════════════════════════════════════════ */
export function RabbitModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)
  const earLRef = useRef<Mesh>(null)
  const earRRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.4) * 0.02
    group.current.rotation.y += delta * (selected ? 1.5 : 0.22)

    // Ear wiggle
    if (earLRef.current) earLRef.current.rotation.z = -0.15 + Math.sin(t * 2) * 0.1
    if (earRRef.current) earRRef.current.rotation.z = 0.15 - Math.sin(t * 2) * 0.1
  })

  const bodyColor = '#D8C8E0'
  const bellyColor = '#EDE6F5'

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, -0.28, 0]} scale={[1, 1.15, 0.9]}>
        <sphereGeometry args={[0.62, 10, 10]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.22, 0.4]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <primitive object={toon(bellyColor)} attach="material" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Cheeks */}
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.38]}>
          <sphereGeometry args={[0.1, 7, 7]} />
          <primitive object={toon('#F0C0C8')} attach="material" />
        </mesh>
      ))}

      {/* Eyes */}
      {[-0.16, 0.16].map((x, i) => (
        <group key={i} position={[x, 0.65, 0.38]}>
          <mesh>
            <sphereGeometry args={[0.085, 8, 8]} />
            <primitive object={toon('#2A1040')} attach="material" />
          </mesh>
          <mesh position={[0.03, 0.03, 0.06]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <primitive object={toon('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Nose */}
      <mesh position={[0, 0.54, 0.44]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <primitive object={toon('#E8A0B4')} attach="material" />
      </mesh>

      {/* Ears */}
      <mesh ref={earLRef} position={[-0.2, 1.2, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>
      <mesh ref={earRRef} position={[0.2, 1.2, 0]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>
      {/* Inner ear */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0.06]} rotation={[0, 0, i === 0 ? -0.15 : 0.15]}>
          <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
          <primitive object={toon('#E8A0B4')} attach="material" />
        </mesh>
      ))}

      {/* Tail */}
      <mesh position={[0, -0.2, -0.62]}>
        <sphereGeometry args={[0.15, 7, 7]} />
        <primitive object={toon(bellyColor)} attach="material" />
      </mesh>

      {/* Legs */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, -0.82, 0.2]} scale={[1, 0.7, 1.4]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <primitive object={toon(bodyColor)} attach="material" />
        </mesh>
      ))}

      {selected && <pointLight color="#9B89BC" intensity={2} distance={3} />}
    </group>
  )
}

/* ════════════════════════════════════════
   CAPYBARA — Haze
   Barrel-bodied, chill, wide face
   ════════════════════════════════════════ */
export function CapybaraModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 0.9) * 0.02
    group.current.rotation.y += delta * (selected ? 1.5 : 0.18)
  })

  const bodyColor = '#B5956A'
  const faceColor = '#C8A87A'
  const noseColor = '#8B6B40'

  return (
    <group ref={group}>
      {/* Body — barrel shape */}
      <mesh position={[0, -0.2, 0]} scale={[1.15, 0.85, 0.9]}>
        <capsuleGeometry args={[0.52, 0.5, 6, 10]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Head — wide and rectangular */}
      <mesh position={[0, 0.55, 0.2]} scale={[1.1, 0.85, 0.9]}>
        <boxGeometry args={[0.75, 0.55, 0.65]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.44, 0.6]} scale={[0.9, 0.65, 0.9]}>
        <boxGeometry args={[0.48, 0.32, 0.35]} />
        <primitive object={toon(faceColor)} attach="material" />
      </mesh>

      {/* Nostrils */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.46, 0.77]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <primitive object={toon(noseColor)} attach="material" />
        </mesh>
      ))}

      {/* Eyes */}
      {[-0.27, 0.27].map((x, i) => (
        <group key={i} position={[x, 0.67, 0.42]}>
          <mesh>
            <sphereGeometry args={[0.075, 8, 8]} />
            <primitive object={toon('#2A1800')} attach="material" />
          </mesh>
          <mesh position={[0.025, 0.025, 0.05]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <primitive object={toon('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Small round ears */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.87, 0.15]}>
          <sphereGeometry args={[0.1, 7, 7]} />
          <primitive object={toon(bodyColor)} attach="material" />
        </mesh>
      ))}

      {/* Legs — short and stubby */}
      {[[-0.32, -0.25], [0.32, -0.25], [-0.32, 0.2], [0.32, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.82, z]}>
          <cylinderGeometry args={[0.1, 0.1, 0.28, 6]} />
          <primitive object={toon(bodyColor)} attach="material" />
        </mesh>
      ))}

      {selected && <pointLight color="#C9A84C" intensity={2} distance={3} />}
    </group>
  )
}

/* ════════════════════════════════════════
   AXOLOTL — Wisp
   Feathery gills, wide smile, aquatic
   ════════════════════════════════════════ */
export function AxolotlModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)
  const gillsRef = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.6) * 0.02
    group.current.rotation.y += delta * (selected ? 1.5 : 0.28)

    // Gill sway
    if (gillsRef.current) {
      gillsRef.current.rotation.z = Math.sin(t * 2) * 0.12
    }
  })

  const bodyColor = '#F0A0C0'
  const bellyColor = '#FFD0E8'
  const gillColor = '#E87898'

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, -0.2, 0]} scale={[1.05, 0.88, 0.82]}>
        <capsuleGeometry args={[0.55, 0.4, 6, 10]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.15, 0.38]}>
        <sphereGeometry args={[0.38, 8, 8]} />
        <primitive object={toon(bellyColor)} attach="material" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, -0.1, -0.85]} rotation={[0.5, 0, 0]} scale={[0.6, 1.2, 0.4]}>
        <coneGeometry args={[0.35, 0.7, 8]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.58, 0.1]} scale={[1.1, 0.95, 1.0]}>
        <sphereGeometry args={[0.48, 10, 10]} />
        <primitive object={toon(bodyColor)} attach="material" />
      </mesh>

      {/* Wide smile */}
      <mesh position={[0, 0.47, 0.52]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.14, 0.025, 6, 12, Math.PI]} />
        <primitive object={toon('#C04060')} attach="material" />
      </mesh>

      {/* Eyes */}
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.66, 0.44]}>
          <mesh>
            <sphereGeometry args={[0.09, 8, 8]} />
            <primitive object={toon('#3A1040')} attach="material" />
          </mesh>
          <mesh position={[0.03, 0.03, 0.06]}>
            <sphereGeometry args={[0.032, 6, 6]} />
            <primitive object={toon('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}

      {/* External gills — 3 per side */}
      <group ref={gillsRef}>
        {[-1, 1].map((side, si) =>
          [0, 1, 2].map((j) => (
            <mesh
              key={`${si}-${j}`}
              position={[side * (0.45 + j * 0.05), 0.7 + j * 0.12, -0.05 + j * 0.05]}
              rotation={[0, 0, side * (0.6 + j * 0.3)]}
            >
              <coneGeometry args={[0.06 - j * 0.01, 0.32 - j * 0.05, 5]} />
              <primitive object={toon(gillColor)} attach="material" />
            </mesh>
          ))
        )}
      </group>

      {/* 4 stubby legs */}
      {[[-0.5, -0.65, 0.2], [0.5, -0.65, 0.2], [-0.42, -0.65, -0.25], [0.42, -0.65, -0.25]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, 0, x < 0 ? 0.4 : -0.4]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.06, 0.25, 5]} />
            <primitive object={toon(bodyColor)} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Freckles */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0.62, 0.54]}>
          <sphereGeometry args={[0.018, 4, 4]} />
          <primitive object={toon('#D070A0')} attach="material" />
        </mesh>
      ))}

      {selected && <pointLight color="#C47B7B" intensity={2} distance={3} />}
    </group>
  )
}
