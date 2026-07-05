export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1
}

export function rollWithBonus(bonus: number): number {
  return Math.min(rollD10() + bonus, 10)
}
