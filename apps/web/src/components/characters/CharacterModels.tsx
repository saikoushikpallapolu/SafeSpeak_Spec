import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, MeshStandardMaterial, Color, Box3, Vector3, Object3D, AnimationMixer, LoopRepeat } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/* ── Shared Material factory for procedural fallbacks ── */
function monoMaterial(colorHex: string, roughness = 0.4, metalness = 0.1) {
  return new MeshStandardMaterial({
    color: new Color(colorHex),
    roughness,
    metalness,
  })
}

/* ════════════════════════════════════════
   DYNAMIC GLB MODEL LOADER
   Loads `/models/${id}.glb` or `/models/${id}_3d_model.glb`,
   auto-centers, normalizes scale, and plays animations if embedded.
   ════════════════════════════════════════ */
export function GLBModel({
  id,
  hovered = false,
  selected = false,
  onLoadFailed,
}: {
  id: string
  hovered?: boolean
  selected?: boolean
  onLoadFailed?: () => void
}) {
  const group = useRef<Group>(null)
  const [gltfScene, setGltfScene] = useState<Object3D | null>(null)
  const mixerRef = useRef<AnimationMixer | null>(null)

  useEffect(() => {
    let isMounted = true
    const loader = new GLTFLoader()
    const possibleUrls = [
      `/models/${id}.glb`,
      `/models/${id}_3d_model.glb`,
      `/models/${id === 'rabbit' ? 'raabit_3d_model.glb' : `${id}.glb`}`,
    ]

    let currentUrlIndex = 0

    function attemptLoad() {
      if (currentUrlIndex >= possibleUrls.length) {
        if (isMounted && onLoadFailed) onLoadFailed()
        return
      }

      const url = possibleUrls[currentUrlIndex]

      loader.load(
        url,
        (gltf) => {
          if (!isMounted) return
          const scene = gltf.scene.clone(true)

          // Center & normalize scale based on bounding box
          const box = new Box3().setFromObject(scene)
          const size = new Vector3()
          box.getSize(size)
          const center = new Vector3()
          box.getCenter(center)

          const maxDim = Math.max(size.x, size.y, size.z) || 1
          const scale = 2.0 / maxDim

          scene.position.x = -center.x * scale
          scene.position.y = -center.y * scale - 0.1
          scene.position.z = -center.z * scale
          scene.scale.setScalar(scale)

          scene.traverse((child) => {
            const mesh = child as Mesh
            if (mesh.isMesh) {
              mesh.castShadow = true
              mesh.receiveShadow = true
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(m => { m.needsUpdate = true })
                } else {
                  mesh.material.needsUpdate = true
                }
              }
            }
          })

          // Setup animation mixer if animations exist
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new AnimationMixer(scene)
            const action = mixer.clipAction(gltf.animations[0])
            action.setLoop(LoopRepeat, Infinity)
            action.play()
            mixerRef.current = mixer
          }

          setGltfScene(scene)
        },
        undefined,
        () => {
          currentUrlIndex++
          attemptLoad()
        }
      )
    }

    attemptLoad()

    return () => {
      isMounted = false
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
    }
  }, [id, onLoadFailed])

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
    if (!group.current) return
    const t = Date.now() / 1000
    // Breathing & hover bob
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    // Gentle rotation
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  if (!gltfScene) return null

  return (
    <group ref={group}>
      <primitive object={gltfScene} />
      {selected && <pointLight color="#FFFFFF" intensity={2.5} distance={4} />}
    </group>
  )
}

/* ════════════════════════════════════════
   PROCEDURAL FALLBACK MODELS (Black & White Monochromatic)
   ════════════════════════════════════════ */

/* OWL */
export function OwlModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.3, 0]} castShadow>
        <icosahedronGeometry args={[0.7, 1]} />
        <primitive object={monoMaterial('#2B2B2B')} attach="material" />
      </mesh>
      <mesh position={[0, -0.25, 0.55]}>
        <sphereGeometry args={[0.38, 8, 8]} />
        <primitive object={monoMaterial('#E0E0E0')} attach="material" />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.52, 10, 10]} />
        <primitive object={monoMaterial('#3D3D3D')} attach="material" />
      </mesh>
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.6, 0.42]}>
          <mesh>
            <sphereGeometry args={[0.14, 8, 8]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <primitive object={monoMaterial('#0A0A0A')} attach="material" />
          </mesh>
          <mesh position={[0.04, 0.04, 0.15]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0.05]} rotation={[0, 0, i === 0 ? -0.4 : 0.4]}>
          <coneGeometry args={[0.1, 0.3, 5]} />
          <primitive object={monoMaterial('#2B2B2B')} attach="material" />
        </mesh>
      ))}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.75, -0.2, -0.1]} rotation={[0.1, side * 0.3, side * 0.4]}>
          <boxGeometry args={[0.25, 0.65, 0.1]} />
          <primitive object={monoMaterial('#1E1E1E')} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.18, 4]} />
        <primitive object={monoMaterial('#E0E0E0')} attach="material" />
      </mesh>
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.95, 0.1]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.15, 5]} />
          <primitive object={monoMaterial('#9E9E9E')} attach="material" />
        </mesh>
      ))}
      {selected && <pointLight color="#FFFFFF" intensity={2} distance={3} />}
    </group>
  )
}

/* DEER */
export function DeerModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.1) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.25)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.7, 0.65, 0.55]} />
        <primitive object={monoMaterial('#383838')} attach="material" />
      </mesh>
      <mesh position={[0, -0.32, 0.2]}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <primitive object={monoMaterial('#CCCCCC')} attach="material" />
      </mesh>
      <mesh position={[0, 0.12, 0.1]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 7]} />
        <primitive object={monoMaterial('#383838')} attach="material" />
      </mesh>
      <mesh position={[0, 0.62, 0.18]}>
        <icosahedronGeometry args={[0.38, 1]} />
        <primitive object={monoMaterial('#383838')} attach="material" />
      </mesh>
      <mesh position={[0, 0.55, 0.5]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <primitive object={monoMaterial('#B8B8B8')} attach="material" />
      </mesh>
      <mesh position={[0, 0.5, 0.67]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <primitive object={monoMaterial('#FFFFFF')} attach="material" />
      </mesh>
      {[-0.18, 0.18].map((x, i) => (
        <group key={i} position={[x, 0.68, 0.46]}>
          <mesh>
            <sphereGeometry args={[0.08, 8, 8]} />
            <primitive object={monoMaterial('#0A0A0A')} attach="material" />
          </mesh>
          <mesh position={[0.03, 0.03, 0.06]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.92, 0.1]} rotation={[0, 0, i === 0 ? -0.6 : 0.6]}>
          <coneGeometry args={[0.12, 0.35, 5]} />
          <primitive object={monoMaterial('#383838')} attach="material" />
        </mesh>
      ))}
      {[-0.22, 0.22].map((x, side) => (
        <group key={side} position={[x, 1.05, 0.05]}>
          <mesh rotation={[0, 0, side === 0 ? -0.3 : 0.3]}>
            <cylinderGeometry args={[0.03, 0.04, 0.45, 5]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
          <mesh position={[side === 0 ? -0.1 : 0.1, 0.2, 0]} rotation={[0, 0, side === 0 ? -1.1 : 1.1]}>
            <cylinderGeometry args={[0.02, 0.03, 0.25, 4]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}
      {[[-0.22, -0.15], [0.22, -0.15], [-0.22, 0.15], [0.22, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.75, z]}>
          <cylinderGeometry args={[0.06, 0.04, 0.35, 5]} />
          <primitive object={monoMaterial('#262626')} attach="material" />
        </mesh>
      ))}
      {selected && <pointLight color="#FFFFFF" intensity={2} distance={3} />}
    </group>
  )
}

/* PANDA */
export function PandaModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.3) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.2)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.25, 0]}>
        <sphereGeometry args={[0.72, 10, 10]} />
        <primitive object={monoMaterial('#F0F0F0')} attach="material" />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.55, 10, 10]} />
        <primitive object={monoMaterial('#F0F0F0')} attach="material" />
      </mesh>
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.72, 0.42]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <primitive object={monoMaterial('#121212')} attach="material" />
        </mesh>
      ))}
      {[-0.18, 0.18].map((x, i) => (
        <group key={i} position={[x, 0.72, 0.52]}>
          <mesh>
            <sphereGeometry args={[0.085, 8, 8]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.05, 7, 7]} />
            <primitive object={monoMaterial('#000000')} attach="material" />
          </mesh>
          <mesh position={[0.025, 0.025, 0.1]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0.0]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <primitive object={monoMaterial('#121212')} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, 0.57, 0.53]}>
        <sphereGeometry args={[0.06, 7, 7]} />
        <primitive object={monoMaterial('#121212')} attach="material" />
      </mesh>
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, -0.1, 0.2]} rotation={[0, 0, i === 0 ? 0.5 : -0.5]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <primitive object={monoMaterial('#121212')} attach="material" />
        </mesh>
      ))}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, -0.88, 0.3]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <primitive object={monoMaterial('#121212')} attach="material" />
        </mesh>
      ))}
      {selected && <pointLight color="#FFFFFF" intensity={2} distance={3} />}
    </group>
  )
}

/* RABBIT */
export function RabbitModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.4) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.22)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.28, 0]} scale={[1, 1.15, 0.9]}>
        <sphereGeometry args={[0.62, 10, 10]} />
        <primitive object={monoMaterial('#D6D6D6')} attach="material" />
      </mesh>
      <mesh position={[0, -0.22, 0.4]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <primitive object={monoMaterial('#FAFAFA')} attach="material" />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <primitive object={monoMaterial('#D6D6D6')} attach="material" />
      </mesh>
      {[-0.16, 0.16].map((x, i) => (
        <group key={i} position={[x, 0.65, 0.38]}>
          <mesh>
            <sphereGeometry args={[0.085, 8, 8]} />
            <primitive object={monoMaterial('#171717')} attach="material" />
          </mesh>
          <mesh position={[0.03, 0.03, 0.06]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.54, 0.44]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <primitive object={monoMaterial('#FFFFFF')} attach="material" />
      </mesh>
      <mesh position={[-0.2, 1.2, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
        <primitive object={monoMaterial('#D6D6D6')} attach="material" />
      </mesh>
      <mesh position={[0.2, 1.2, 0]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
        <primitive object={monoMaterial('#D6D6D6')} attach="material" />
      </mesh>
      <mesh position={[0, -0.2, -0.62]}>
        <sphereGeometry args={[0.15, 7, 7]} />
        <primitive object={monoMaterial('#FAFAFA')} attach="material" />
      </mesh>
      {selected && <pointLight color="#FFFFFF" intensity={2} distance={3} />}
    </group>
  )
}

/* CAPYBARA */
export function CapybaraModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 0.9) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.18)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.2, 0]} scale={[1.15, 0.85, 0.9]}>
        <capsuleGeometry args={[0.52, 0.5, 6, 10]} />
        <primitive object={monoMaterial('#333333')} attach="material" />
      </mesh>
      <mesh position={[0, 0.55, 0.2]} scale={[1.1, 0.85, 0.9]}>
        <boxGeometry args={[0.75, 0.55, 0.65]} />
        <primitive object={monoMaterial('#333333')} attach="material" />
      </mesh>
      <mesh position={[0, 0.44, 0.6]} scale={[0.9, 0.65, 0.9]}>
        <boxGeometry args={[0.48, 0.32, 0.35]} />
        <primitive object={monoMaterial('#555555')} attach="material" />
      </mesh>
      {[-0.27, 0.27].map((x, i) => (
        <group key={i} position={[x, 0.67, 0.42]}>
          <mesh>
            <sphereGeometry args={[0.075, 8, 8]} />
            <primitive object={monoMaterial('#0A0A0A')} attach="material" />
          </mesh>
          <mesh position={[0.025, 0.025, 0.05]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.87, 0.15]}>
          <sphereGeometry args={[0.1, 7, 7]} />
          <primitive object={monoMaterial('#333333')} attach="material" />
        </mesh>
      ))}
      {selected && <pointLight color="#FFFFFF" intensity={2} distance={3} />}
    </group>
  )
}

/* PENGUIN */
export function PenguinModel({ hovered, selected }: { hovered?: boolean; selected?: boolean }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current) return
    const t = Date.now() / 1000
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.4) * 0.02
    group.current.rotation.z = Math.sin(t * 2) * 0.04
    group.current.rotation.y += delta * (selected ? 1.4 : 0.25)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.2, 0]} scale={[1, 1.1, 0.95]}>
        <capsuleGeometry args={[0.55, 0.45, 8, 12]} />
        <primitive object={monoMaterial('#1C1C1C')} attach="material" />
      </mesh>
      <mesh position={[0, -0.15, 0.35]} scale={[0.85, 1, 0.6]}>
        <sphereGeometry args={[0.48, 10, 10]} />
        <primitive object={monoMaterial('#FFFFFF')} attach="material" />
      </mesh>
      <mesh position={[0, 0.52, 0.05]} scale={[1.05, 0.95, 1.0]}>
        <sphereGeometry args={[0.46, 10, 10]} />
        <primitive object={monoMaterial('#1C1C1C')} attach="material" />
      </mesh>
      <mesh position={[0, 0.52, 0.32]} scale={[0.85, 0.75, 0.4]}>
        <sphereGeometry args={[0.36, 10, 10]} />
        <primitive object={monoMaterial('#FFFFFF')} attach="material" />
      </mesh>
      {[-0.15, 0.15].map((x, i) => (
        <group key={i} position={[x, 0.58, 0.43]}>
          <mesh>
            <sphereGeometry args={[0.075, 8, 8]} />
            <primitive object={monoMaterial('#0A0A0A')} attach="material" />
          </mesh>
          <mesh position={[0.025, 0.025, 0.05]}>
            <sphereGeometry args={[0.026, 6, 6]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.46, 0.56]} rotation={[Math.PI / 2 + 0.15, 0, 0]}>
        <coneGeometry args={[0.08, 0.18, 5]} />
        <primitive object={monoMaterial('#E0E0E0')} attach="material" />
      </mesh>
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0]} rotation={[0, 0, i === 0 ? 0.4 : -0.4]}>
          <capsuleGeometry args={[0.1, 0.48, 4, 8]} />
          <primitive object={monoMaterial('#1C1C1C')} attach="material" />
        </mesh>
      ))}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.85, 0.2]} scale={[1.3, 0.5, 1.5]}>
          <boxGeometry args={[0.18, 0.1, 0.26]} />
          <primitive object={monoMaterial('#737373')} attach="material" />
        </mesh>
      ))}
      {selected && <pointLight color="#FFFFFF" intensity={2} distance={3} />}
    </group>
  )
}

/* ════════════════════════════════════════
   UNIVERSAL CHARACTER RENDERER
   ════════════════════════════════════════ */
export function CharacterModelRenderer({
  id,
  hovered = false,
  selected = false,
}: {
  id: string
  hovered?: boolean
  selected?: boolean
}) {
  const [glbFailed, setGlbFailed] = useState(false)

  if (!glbFailed) {
    return (
      <GLBModel
        id={id}
        hovered={hovered}
        selected={selected}
        onLoadFailed={() => setGlbFailed(true)}
      />
    )
  }

  // Fallback to geometric models if GLB cannot load
  switch (id) {
    case 'owl':      return <OwlModel hovered={hovered} selected={selected} />
    case 'deer':     return <DeerModel hovered={hovered} selected={selected} />
    case 'panda':    return <PandaModel hovered={hovered} selected={selected} />
    case 'rabbit':   return <RabbitModel hovered={hovered} selected={selected} />
    case 'capybara': return <CapybaraModel hovered={hovered} selected={selected} />
    case 'penguin':  return <PenguinModel hovered={hovered} selected={selected} />
    default:         return <OwlModel hovered={hovered} selected={selected} />
  }
}
