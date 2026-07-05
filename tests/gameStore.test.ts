import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../src/store/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset()
  })

  it('starts in menu phase', () => {
    const state = useGameStore.getState()
    expect(state.phase).toBe('menu')
  })

  it('starts a new game with correct initial state', () => {
    const { startGame } = useGameStore.getState()
    startGame('human')
    const state = useGameStore.getState()
    expect(state.phase).toBe('playing')
    expect(state.currentLevel).toBe(1)
    expect(state.players[0].character).toBe('human')
    expect(state.players[0].lives).toBe(2)
  })

  it('rolls dice and returns value between 1 and 10', () => {
    const { startGame, rollDice } = useGameStore.getState()
    startGame('human')
    rollDice()
    const state = useGameStore.getState()
    expect(state.diceResult).toBeGreaterThanOrEqual(1)
    expect(state.diceResult).toBeLessThanOrEqual(10)
  })

  it('loses a life correctly', () => {
    const { startGame, loseLife } = useGameStore.getState()
    startGame('tiger')
    loseLife(0)
    const state = useGameStore.getState()
    expect(state.players[0].lives).toBe(1)
  })

  it('resets level when lives reach 0', () => {
    const { startGame, loseLife } = useGameStore.getState()
    startGame('human')
    loseLife(0)
    loseLife(0)
    const state = useGameStore.getState()
    expect(state.players[0].lives).toBe(2)
    expect(state.players[0].currentTileId).toBe('start')
  })
})
