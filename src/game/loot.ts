import { Equipment, Rarity } from '@/types/game'
import { ITEM_TEMPLATES } from '@/data/items'

const RARITY_WEIGHTS: Record<number, Record<Rarity, number>> = {
  1: { common: 70, rare: 25, epic: 5, legendary: 0 },
  3: { common: 50, rare: 35, epic: 13, legendary: 2 },
  5: { common: 35, rare: 35, epic: 25, legendary: 5 },
  7: { common: 20, rare: 35, epic: 35, legendary: 10 },
  10: { common: 10, rare: 30, epic: 40, legendary: 20 },
}

function getRarityWeights(level: number): Record<Rarity, number> {
  const keys = Object.keys(RARITY_WEIGHTS).map(Number).sort((a, b) => a - b)
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
  )
  return RARITY_WEIGHTS[closest]
}

function pickRarity(level: number): Rarity {
  const weights = getRarityWeights(level)
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight
    if (roll <= 0) return rarity as Rarity
  }
  return 'common'
}

export function generateLoot(level: number): Equipment {
  const rarity = pickRarity(level)
  const candidates = ITEM_TEMPLATES.filter(t => t.rarity === rarity)
  const template = candidates[Math.floor(Math.random() * candidates.length)]

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
    slot: template.slot,
    rarity: template.rarity,
    bonus: template.bonus,
    description: template.description,
  }
}

export function getDropChance(isBoss: boolean): number {
  return isBoss ? 1.0 : 0.4
}

export function shouldDropLoot(isBoss: boolean): boolean {
  return Math.random() < getDropChance(isBoss)
}
