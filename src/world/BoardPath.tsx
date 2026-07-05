import { level1 } from '@/data/levels/level1'
import { useGameStore } from '@/store/gameStore'
import { TileModel } from './Tile'

export function BoardPath() {
  const players = useGameStore((s) => s.players)
  const currentPlayerTile = players[0]?.currentTileId

  return (
    <group>
      {level1.tiles.map((tile) => {
        const revealed = tile.id === currentPlayerTile || !tile.hidden
        return <TileModel key={tile.id} tile={tile} revealed={revealed} />
      })}
    </group>
  )
}
