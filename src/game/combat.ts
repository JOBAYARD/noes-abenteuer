import { CombatType } from '@/types/game'

export function pickCombatType(): CombatType {
  const types: CombatType[] = ['click', 'dice', 'reaction']
  return types[Math.floor(Math.random() * 3)]
}

export function getClickThreshold(level: number, isBoss: boolean): number {
  const base = 15 + level * 2
  return isBoss ? base + 10 : base
}

export function getClickDuration(level: number, isBoss: boolean): number {
  const base = 5000 - level * 100
  return isBoss ? Math.max(base - 1000, 2000) : Math.max(base, 3000)
}

export function calculateClickBattle(clicks: number, threshold: number) {
  return { won: clicks >= threshold, clicks, threshold }
}

export function calculateDiceDuel(playerRoll: number, enemyRoll: number, weaponBonus: number) {
  const playerTotal = playerRoll + weaponBonus
  return { won: playerTotal > enemyRoll, playerTotal, enemyRoll }
}

export function getEnemyDiceBonus(level: number, isBoss: boolean): number {
  const base = Math.floor(level / 3)
  return isBoss ? base + 2 : base
}

export function calculateReactionClick(
  clickTiming: number,
  greenStart: number,
  greenEnd: number,
  amuletBonus: number
) {
  const bonusWidth = amuletBonus * 0.05
  const adjustedStart = Math.max(0, greenStart - bonusWidth)
  const adjustedEnd = Math.min(1, greenEnd + bonusWidth)
  const won = clickTiming >= adjustedStart && clickTiming <= adjustedEnd
  return { won, clickTiming, greenStart: adjustedStart, greenEnd: adjustedEnd }
}

export function getGreenZone(level: number, isBoss: boolean): { start: number; end: number } {
  const width = Math.max(0.15, 0.4 - level * 0.025)
  const bossWidth = isBoss ? width * 0.6 : width
  const center = 0.5
  return { start: center - bossWidth / 2, end: center + bossWidth / 2 }
}

export function getBossHitsRequired(level: number): number {
  return Math.min(2 + Math.floor(level / 3), 5)
}
