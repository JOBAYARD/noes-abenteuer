import { describe, it, expect } from 'vitest'
import { generateLoot, getDropChance } from '../src/game/loot'

describe('loot', () => {
  it('generateLoot returns an item with valid properties', () => {
    const item = generateLoot(1)
    expect(item.id).toBeDefined()
    expect(item.name).toBeDefined()
    expect(item.slot).toBeDefined()
    expect(item.rarity).toBeDefined()
    expect(item.bonus).toBeGreaterThanOrEqual(1)
  })

  it('higher levels produce rarer items on average', () => {
    const rarities = { common: 0, rare: 0, epic: 0, legendary: 0 }
    for (let i = 0; i < 200; i++) {
      const item = generateLoot(10)
      rarities[item.rarity]++
    }
    expect(rarities.rare + rarities.epic + rarities.legendary).toBeGreaterThan(rarities.common)
  })

  it('getDropChance returns higher chance for bosses', () => {
    expect(getDropChance(true)).toBeGreaterThan(getDropChance(false))
  })
})
