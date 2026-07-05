import { CharacterType, Equipment } from '@/types/game'

export type ClientMessage =
  | { type: 'join'; playerName: string; character: CharacterType }
  | { type: 'roll'; result: number }
  | { type: 'move'; tileId: string }
  | { type: 'choose_direction'; tileId: string }
  | { type: 'combat_result'; won: boolean }
  | { type: 'share_life'; toPlayerId: string }
  | { type: 'equip_item'; item: Equipment }
  | { type: 'help_combat' }
  | { type: 'ready' }

export type ServerMessage =
  | { type: 'game_state'; state: GameSyncState }
  | { type: 'player_joined'; playerId: string; character: CharacterType }
  | { type: 'player_rolled'; playerId: string; result: number }
  | { type: 'player_moved'; playerId: string; tileId: string }
  | { type: 'combat_started'; playerId: string; combatType: string }
  | { type: 'combat_ended'; playerId: string; won: boolean }
  | { type: 'life_shared'; fromId: string; toId: string }
  | { type: 'loot_found'; playerId: string; item: Equipment }
  | { type: 'level_complete' }
  | { type: 'turn_change'; activePlayerId: string }
  | { type: 'error'; message: string }

export interface GameSyncState {
  currentLevel: number
  players: Array<{
    id: string
    character: CharacterType
    currentTileId: string
    lives: number
    equipment: Equipment[]
    equippedItems: Record<string, Equipment>
  }>
  activePlayerId: string
  phase: string
}
