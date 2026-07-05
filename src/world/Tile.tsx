import { useRef } from 'react'
import { Mesh } from 'three'
import { Tile as TileData } from '@/types/game'

const TILE_COLORS: Record<string, string> = {
  normal: '#4a5568',
  snail: '#4a5568',
  rocket: '#4a5568',
  car: '#4a5568',
  enemy: '#742a2a',
  boss: '#5b21b6',
  loot: '#92400e',
}

const REVEALED_COLORS: Record<string, string> = {
  snail: '#d97706',
  rocket: '#2563eb',
  car: '#059669',
}

interface TileProps {
  tile: TileData
  revealed: boolean
}

export function TileModel({ tile, revealed }: TileProps) {
  const meshRef = useRef<Mesh>(null)
  const color = revealed && !tile.hidden ? (REVEALED_COLORS[tile.type] ?? TILE_COLORS[tile.type]) : TILE_COLORS[tile.type]

  return (
    <mesh
      ref={meshRef}
      position={[tile.position.x, tile.position.y, tile.position.z]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[0.6, 0.6, 0.2, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
    </mesh>
  )
}
