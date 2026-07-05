import { describe, it, expect } from 'vitest'
import { pickCombatType, calculateClickBattle, calculateDiceDuel, calculateReactionClick, getClickThreshold } from '../src/game/combat'

describe('combat', () => {
  it('pickCombatType returns one of the three types', () => {
    for (let i = 0; i < 50; i++) {
      const type = pickCombatType()
      expect(['click', 'dice', 'reaction']).toContain(type)
    }
  })

  it('calculateClickBattle — win when clicks >= threshold', () => {
    const result = calculateClickBattle(25, 20)
    expect(result.won).toBe(true)
  })

  it('calculateClickBattle — lose when clicks < threshold', () => {
    const result = calculateClickBattle(10, 20)
    expect(result.won).toBe(false)
  })

  it('calculateDiceDuel — win when player roll > enemy roll', () => {
    const result = calculateDiceDuel(8, 5, 0)
    expect(result.won).toBe(true)
  })

  it('calculateDiceDuel — lose when player roll < enemy roll', () => {
    const result = calculateDiceDuel(3, 7, 0)
    expect(result.won).toBe(false)
  })

  it('calculateDiceDuel — weapon bonus adds to player roll', () => {
    const result = calculateDiceDuel(5, 7, 3)
    expect(result.playerTotal).toBe(8)
    expect(result.won).toBe(true)
  })

  it('calculateReactionClick — win when timing is in green zone', () => {
    const result = calculateReactionClick(0.5, 0.3, 0.7, 0)
    expect(result.won).toBe(true)
  })

  it('calculateReactionClick — lose when timing is outside green zone', () => {
    const result = calculateReactionClick(0.1, 0.3, 0.7, 0)
    expect(result.won).toBe(false)
  })

  it('calculateReactionClick — amulet bonus widens green zone', () => {
    const result = calculateReactionClick(0.2, 0.3, 0.7, 2)
    expect(result.greenStart).toBeLessThan(0.3)
    expect(result.won).toBe(true)
  })

  it('getClickThreshold scales with level', () => {
    expect(getClickThreshold(1, false)).toBeLessThan(getClickThreshold(5, false))
    expect(getClickThreshold(1, true)).toBeGreaterThan(getClickThreshold(1, false))
  })
})
