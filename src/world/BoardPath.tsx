import { useGameStore } from '@/store/gameStore'
import { getLevel } from '@/data/levels'
import { TileModel } from './Tile'

export function BoardPath() {
  const players = useGameStore((s) => s.players)
  const currentLevel = useGameStore((s) => s.currentLevel)
  const level = getLevel(currentLevel)
  const currentPlayerTile = players[0]?.currentTileId

  return (
    <group>
      {level.tiles.map((tile) => {
        const revealed = tile.id === currentPlayerTile || !tile.hidden
        return <TileModel key={tile.id} tile={tile} revealed={revealed} />
      })}
    </group>
  )
}
