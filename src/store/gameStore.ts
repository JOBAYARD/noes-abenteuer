import { create } from 'zustand'
import { CharacterType, Equipment, EquipmentSlot, GameState, Player } from '@/types/game'

interface GameActions {
  reset: () => void
  startGame: (character: CharacterType) => void
  rollDice: () => void
  movePlayer: (playerIndex: number, tileId: string) => void
  loseLife: (playerIndex: number) => void
  addEquipment: (playerIndex: number, item: Equipment) => void
  equipItem: (playerIndex: number, item: Equipment) => void
  setPhase: (phase: GameState['phase']) => void
  setWaiting: (until: number | null) => void
  completeLevel: () => void
}

const initialState: GameState = {
  phase: 'menu',
  currentLevel: 1,
  players: [],
  activePlayerIndex: 0,
  unlockedLevels: [1],
  diceResult: null,
  waitingUntil: null,
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  reset: () => set(initialState),

  startGame: (character) => {
    const player: Player = {
      id: 'player1',
      character,
      currentTileId: 'start',
      lives: 2,
      equipment: [],
      equippedItems: {},
    }
    set({
      phase: 'playing',
      currentLevel: 1,
      players: [player],
      activePlayerIndex: 0,
      unlockedLevels: [1],
      diceResult: null,
    })
  },

  rollDice: () => {
    const result = Math.floor(Math.random() * 10) + 1
    const { players, activePlayerIndex } = get()
    const player = players[activePlayerIndex]
    const bootsBonus = player.equippedItems.boots?.bonus ?? 0
    set({ diceResult: Math.min(result + bootsBonus, 10) })
  },

  movePlayer: (playerIndex, tileId) => {
    set((state) => {
      const players = [...state.players]
      players[playerIndex] = { ...players[playerIndex], currentTileId: tileId }
      return { players, diceResult: null }
    })
  },

  loseLife: (playerIndex) => {
    set((state) => {
      const players = [...state.players]
      const player = { ...players[playerIndex] }
      player.lives -= 1
      if (player.lives <= 0) {
        player.lives = 2
        player.currentTileId = 'start'
      }
      players[playerIndex] = player
      return { players }
    })
  },

  addEquipment: (playerIndex, item) => {
    set((state) => {
      const players = [...state.players]
      players[playerIndex] = {
        ...players[playerIndex],
        equipment: [...players[playerIndex].equipment, item],
      }
      return { players }
    })
  },

  equipItem: (playerIndex, item) => {
    set((state) => {
      const players = [...state.players]
      players[playerIndex] = {
        ...players[playerIndex],
        equippedItems: { ...players[playerIndex].equippedItems, [item.slot]: item },
      }
      return { players }
    })
  },

  setPhase: (phase) => set({ phase }),

  setWaiting: (until) => set({ waitingUntil: until }),

  completeLevel: () => {
    set((state) => {
      const nextLevel = state.currentLevel + 1
      const unlockedLevels = state.unlockedLevels.includes(nextLevel)
        ? state.unlockedLevels
        : [...state.unlockedLevels, nextLevel]
      return { phase: 'result', unlockedLevels }
    })
  },
}))
