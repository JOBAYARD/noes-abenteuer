import { describe, it, expect } from 'vitest'
import { rollD10, rollWithBonus } from '../src/game/dice'

describe('dice', () => {
  it('rollD10 returns value between 1 and 10', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollD10()
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    }
  })

  it('rollWithBonus adds bonus and caps at 10', () => {
    const result = rollWithBonus(3)
    expect(result).toBeGreaterThanOrEqual(4)
    expect(result).toBeLessThanOrEqual(10)
  })

  it('rollWithBonus with 0 bonus is same as rollD10', () => {
    const result = rollWithBonus(0)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(10)
  })
})
