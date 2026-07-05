export type TileType = 'normal' | 'snail' | 'rocket' | 'car' | 'enemy' | 'boss' | 'loot'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type EquipmentSlot = 'weapon' | 'gloves' | 'amulet' | 'boots' | 'shield'

export type CombatType = 'click' | 'dice' | 'reaction'

export type CharacterType = 'human' | 'tiger'

export interface Position {
  x: number
  y: number
  z: number
}

export interface Tile {
  id: string
  position: Position
  type: TileType
  hidden: boolean
  connections: string[]
}

export interface LevelData {
  id: number
  name: string
  theme: string
  tiles: Tile[]
  startTileId: string
  bossTileId: string
}

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: Rarity
  bonus: number
  description: string
}

export interface Player {
  id: string
  character: CharacterType
  currentTileId: string
  lives: number
  equipment: Equipment[]
  equippedItems: Partial<Record<EquipmentSlot, Equipment>>
}

export interface GameState {
  phase: 'menu' | 'playing' | 'combat' | 'result'
  currentLevel: number
  players: Player[]
  activePlayerIndex: number
  unlockedLevels: number[]
  diceResult: number | null
  waitingUntil: number | null
}
