import { TileType } from '@/types/game'

export type TileEffect =
  | { type: 'none' }
  | { type: 'wait'; duration: number }
  | { type: 'advance'; steps: number }
  | { type: 'combat'; isBoss: boolean }
  | { type: 'loot' }

export function getTileEffect(tileType: TileType): TileEffect {
  switch (tileType) {
    case 'normal': return { type: 'none' }
    case 'snail': return { type: 'wait', duration: 60000 }
    case 'rocket': return { type: 'advance', steps: 6 }
    case 'car': return { type: 'advance', steps: 4 }
    case 'enemy': return { type: 'combat', isBoss: false }
    case 'boss': return { type: 'combat', isBoss: true }
    case 'loot': return { type: 'loot' }
  }
}
