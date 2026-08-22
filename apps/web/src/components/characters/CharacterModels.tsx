import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, MeshStandardMaterial, Color, Box3, Vector3, Object3D, AnimationMixer, LoopRepeat } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/* ── Global In-Memory Model Cache to prevent any re-fetching or flashing ── */
interface CachedModel {
  scene: Object3D
  animations: any[]
}

const GLB_CACHE = new Map<string, CachedModel>()
const PENDING_LOADS = new Map<string, Promise<CachedModel | null>>()

/* ── Helper to preload models in background ── */
export function preloadGLBModel(id: string): Promise<CachedModel | null> {
  if (GLB_CACHE.has(id)) {
    return Promise.resolve(GLB_CACHE.get(id)!)
  }
  if (PENDING_LOADS.has(id)) {
    return PENDING_LOADS.get(id)!
  }

  const loader = new GLTFLoader()
  const possibleUrls = [
    `/models/${id}.glb`,
    `/models/${id}_3d_model.glb`,
    `/models/${id === 'rabbit' ? 'raabit_3d_model.glb' : `${id}.glb`}`,
  ]

  const loadPromise = new Promise<CachedModel | null>((resolve) => {
    let urlIndex = 0

    function tryNext() {
      if (urlIndex >= possibleUrls.length) {
        resolve(null)
        return
      }
      const url = possibleUrls[urlIndex]
      loader.load(
        url,
        (gltf) => {
          const scene = gltf.scene
          // Normalize bounding box & scale once
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
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
                mats.forEach((m: any) => {
                  m.needsUpdate = true
                  if (m.color && m.color.r < 0.08 && m.color.g < 0.08 && m.color.b < 0.08) {
                    m.color.setRGB(0.28, 0.28, 0.28)
                  }
                })
              }
            }
          })

          const cached: CachedModel = {
            scene,
            animations: gltf.animations || [],
          }
          GLB_CACHE.set(id, cached)
          resolve(cached)
        },
        undefined,
        () => {
          urlIndex++
          tryNext()
        }
      )
    }

    tryNext()
  })

  PENDING_LOADS.set(id, loadPromise)
  return loadPromise
}

// Auto-preload all 6 models on initial script evaluation
if (typeof window !== 'undefined') {
  ;['penguin', 'owl', 'deer', 'panda', 'rabbit', 'capybara'].forEach((id) => {
    preloadGLBModel(id)
  })
}

/* ── Shared Material factory for procedural fallbacks ── */
function monoMaterial(colorHex: string, roughness = 0.4, metalness = 0.1) {
  return new MeshStandardMaterial({
    color: new Color(colorHex),
    roughness,
    metalness,
  })
}

/* ════════════════════════════════════════
   SMOOTH LOADING PLACEHOLDER (No blocky mesh flash)
   ════════════════════════════════════════ */
function LoadingAura() {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const t = Date.now() / 1000
    meshRef.current.rotation.y = t * 0.8
    const s = 1 + Math.sin(t * 2) * 0.08
    meshRef.current.scale.set(s, s, s)
  })

  return (
    <group position={[0, -0.2, 0]}>
      {/* Subtle glowing floor ring */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.65, 32]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

/* ════════════════════════════════════════
   DYNAMIC GLB MODEL LOADER (Glitch-Free)
   ════════════════════════════════════════ */
export function GLBModel({
  id,
  hovered = false,
  selected = false,
  staticPose = false,
}: {
  id: string
  hovered?: boolean
  selected?: boolean
  staticPose?: boolean
}) {
  const group = useRef<Group>(null)
  const [modelScene, setModelScene] = useState<Object3D | null>(() => {
    const cached = GLB_CACHE.get(id)
    return cached ? cached.scene.clone(true) : null
  })
  const mixerRef = useRef<AnimationMixer | null>(null)

  useEffect(() => {
    let isMounted = true

    if (GLB_CACHE.has(id)) {
      const cached = GLB_CACHE.get(id)!
      const scene = cached.scene.clone(true)
      if (cached.animations && cached.animations.length > 0 && !staticPose) {
        const mixer = new AnimationMixer(scene)
        const action = mixer.clipAction(cached.animations[0])
        action.setLoop(LoopRepeat, Infinity)
        action.play()
        mixerRef.current = mixer
      }
      setModelScene(scene)
      return
    }

    preloadGLBModel(id).then((cached) => {
      if (!isMounted || !cached) return
      const scene = cached.scene.clone(true)
      if (cached.animations && cached.animations.length > 0 && !staticPose) {
        const mixer = new AnimationMixer(scene)
        const action = mixer.clipAction(cached.animations[0])
        action.setLoop(LoopRepeat, Infinity)
        action.play()
        mixerRef.current = mixer
      }
      setModelScene(scene)
    })

    return () => {
      isMounted = false
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
      }
    }
  }, [id, staticPose])

  useFrame((_, delta) => {
    if (!group.current) return

    // If staticPose is true, completely lock mascot facing front with 0 movement
    if (staticPose) {
      group.current.position.set(0, 0, 0)
      group.current.rotation.set(0, 0, 0)
      group.current.scale.set(1, 1, 1)
      return
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }

    const t = Date.now() / 1000
    // Breathing & hover bob
    group.current.scale.y = 1 + Math.sin(t * 1.5) * 0.015
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  return (
    <group ref={group}>
      {modelScene ? (
        <primitive object={modelScene} />
      ) : (
        <LoadingAura />
      )}
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
        <capsuleGeometry args={[0.55, 0.7, 4, 16]} />
        <primitive object={monoMaterial('#262626')} attach="material" />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.48, 16, 16]} />
        <primitive object={monoMaterial('#404040')} attach="material" />
      </mesh>
      <mesh position={[0, -0.22, 0.28]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <primitive object={monoMaterial('#FAFAFA', 0.6)} attach="material" />
      </mesh>
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.52, 0.38]}>
          <mesh>
            <circleGeometry args={[0.16, 16]} />
            <primitive object={monoMaterial('#FAFAFA', 0.2)} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.08, 16]} />
            <primitive object={monoMaterial('#0A0A0A', 0.1)} attach="material" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.36, 0.48]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.08, 0.22, 4]} />
        <primitive object={monoMaterial('#E5E5E5')} attach="material" />
      </mesh>
      {[-0.22, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.88, 0.08]} rotation={[0, 0, i === 0 ? 0.3 : -0.3]}>
          <coneGeometry args={[0.12, 0.32, 4]} />
          <primitive object={monoMaterial('#171717')} attach="material" />
        </mesh>
      ))}
      {[-0.58, 0.58].map((x, i) => (
        <mesh key={i} position={[x, -0.25, 0]} rotation={[0, 0, i === 0 ? -0.2 : 0.2]}>
          <boxGeometry args={[0.12, 0.7, 0.4]} />
          <primitive object={monoMaterial('#171717')} attach="material" />
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
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[0.65, 0.75, 0.5]} />
        <primitive object={monoMaterial('#262626')} attach="material" />
      </mesh>
      <mesh position={[0, 0.15, 0.08]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.4, 8]} />
        <primitive object={monoMaterial('#404040')} attach="material" />
      </mesh>
      <mesh position={[0, 0.42, 0.22]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <primitive object={monoMaterial('#525252')} attach="material" />
      </mesh>
      <mesh position={[0, 0.32, 0.46]}>
        <coneGeometry args={[0.14, 0.22, 6]} />
        <primitive object={monoMaterial('#E5E5E5')} attach="material" />
      </mesh>
      <mesh position={[0, 0.38, 0.58]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <primitive object={monoMaterial('#0A0A0A')} attach="material" />
      </mesh>
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, 0.48, 0.46]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <primitive object={monoMaterial('#0A0A0A')} attach="material" />
        </mesh>
      ))}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.62, 0.12]} rotation={[0, 0, i === 0 ? 0.6 : -0.6]}>
          <coneGeometry args={[0.08, 0.24, 4]} />
          <primitive object={monoMaterial('#171717')} attach="material" />
        </mesh>
      ))}
      {[-0.2, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.72, 0.1]}>
          <mesh rotation={[0, 0, i === 0 ? 0.35 : -0.35]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
            <primitive object={monoMaterial('#D4D4D4', 0.2, 0.2)} attach="material" />
          </mesh>
        </group>
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
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.35, 0]} castShadow>
        <sphereGeometry args={[0.62, 16, 16]} />
        <primitive object={monoMaterial('#FAFAFA')} attach="material" />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.48, 16, 16]} />
        <primitive object={monoMaterial('#FAFAFA')} attach="material" />
      </mesh>
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0.76, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <primitive object={monoMaterial('#171717')} attach="material" />
        </mesh>
      ))}
      {[-0.18, 0.18].map((x, i) => (
        <group key={i} position={[x, 0.42, 0.4]}>
          <mesh rotation={[0, 0, i === 0 ? 0.2 : -0.2]}>
            <circleGeometry args={[0.12, 12]} />
            <primitive object={monoMaterial('#171717')} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.05, 8]} />
            <primitive object={monoMaterial('#FAFAFA')} attach="material" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.28, 0.44]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <primitive object={monoMaterial('#171717')} attach="material" />
      </mesh>
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, -0.2, 0.1]} rotation={[0, 0, i === 0 ? -0.4 : 0.4]}>
          <capsuleGeometry args={[0.16, 0.45, 4, 8]} />
          <primitive object={monoMaterial('#171717')} attach="material" />
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
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.38, 0]} castShadow>
        <sphereGeometry args={[0.54, 16, 16]} />
        <primitive object={monoMaterial('#E5E5E5')} attach="material" />
      </mesh>
      <mesh position={[0, 0.26, 0]} castShadow>
        <sphereGeometry args={[0.42, 16, 16]} />
        <primitive object={monoMaterial('#FAFAFA')} attach="material" />
      </mesh>
      {[-0.18, 0.18].map((x, i) => (
        <group key={i} position={[x, 0.88, 0]}>
          <mesh rotation={[0, 0, i === 0 ? -0.1 : 0.1]}>
            <capsuleGeometry args={[0.1, 0.65, 4, 8]} />
            <primitive object={monoMaterial('#FAFAFA')} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.04]} rotation={[0, 0, i === 0 ? -0.1 : 0.1]}>
            <capsuleGeometry args={[0.05, 0.45, 4, 8]} />
            <primitive object={monoMaterial('#737373')} attach="material" />
          </mesh>
        </group>
      ))}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, 0.32, 0.38]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <primitive object={monoMaterial('#0A0A0A')} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0.42]}>
        <coneGeometry args={[0.05, 0.06, 3]} />
        <primitive object={monoMaterial('#525252')} attach="material" />
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
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.32, 0]} castShadow>
        <boxGeometry args={[0.78, 0.65, 0.88]} />
        <primitive object={monoMaterial('#404040')} attach="material" />
      </mesh>
      <mesh position={[0, 0.18, 0.18]} castShadow>
        <boxGeometry args={[0.62, 0.52, 0.68]} />
        <primitive object={monoMaterial('#525252')} attach="material" />
      </mesh>
      <mesh position={[0, 0.08, 0.54]}>
        <boxGeometry args={[0.48, 0.36, 0.22]} />
        <primitive object={monoMaterial('#262626')} attach="material" />
      </mesh>
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0.66]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <primitive object={monoMaterial('#0A0A0A')} attach="material" />
        </mesh>
      ))}
      {[-0.24, 0.24].map((x, i) => (
        <mesh key={i} position={[x, 0.28, 0.48]}>
          <boxGeometry args={[0.06, 0.03, 0.06]} />
          <primitive object={monoMaterial('#0A0A0A')} attach="material" />
        </mesh>
      ))}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.44, 0.05]} rotation={[0, 0, i === 0 ? 0.3 : -0.3]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <primitive object={monoMaterial('#262626')} attach="material" />
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
    group.current.position.y = hovered ? Math.sin(t * 3) * 0.05 + 0.05 : Math.sin(t * 1.2) * 0.02
    group.current.rotation.y += delta * (selected ? 1.4 : 0.3)
  })

  return (
    <group ref={group}>
      <mesh position={[0, -0.15, 0]} castShadow>
        <capsuleGeometry args={[0.52, 0.95, 4, 16]} />
        <primitive object={monoMaterial('#121212', 0.3, 0.1)} attach="material" />
      </mesh>
      <mesh position={[0, -0.15, 0.22]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <primitive object={monoMaterial('#FFFFFF', 0.5, 0.05)} attach="material" />
      </mesh>
      {[-0.16, 0.16].map((x, i) => (
        <group key={i} position={[x, 0.52, 0.38]}>
          <mesh>
            <circleGeometry args={[0.1, 16]} />
            <primitive object={monoMaterial('#FFFFFF')} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.05, 12]} />
            <primitive object={monoMaterial('#0A0A0A')} attach="material" />
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
  staticPose = false,
}: {
  id: string
  hovered?: boolean
  selected?: boolean
  staticPose?: boolean
}) {
  return (
    <GLBModel
      key={id}
      id={id}
      hovered={hovered}
      selected={selected}
      staticPose={staticPose}
    />
  )
}
