import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { useGameStore } from '@/store/gameStore'
import { level1 } from '@/data/levels/level1'

export function PlayerModel() {
  const meshRef = useRef<Mesh>(null)
  const players = useGameStore((s) => s.players)
  const player = players[0]

  useFrame(() => {
    if (!meshRef.current || !player) return
    const tile = level1.tiles.find(t => t.id === player.currentTileId)
    if (!tile) return

    const target = new Vector3(tile.position.x, tile.position.y + 0.7, tile.position.z)
    meshRef.current.position.lerp(target, 0.08)
  })

  if (!player) return null

  const isHuman = player.character === 'human'

  return (
    <mesh ref={meshRef} position={[0, 0.7, 0]} castShadow>
      {isHuman ? (
        <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
      ) : (
        <sphereGeometry args={[0.35, 8, 8]} />
      )}
      <meshStandardMaterial
        color={isHuman ? '#c4b5fd' : '#f59e0b'}
        emissive={isHuman ? '#7c3aed' : '#d97706'}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}
