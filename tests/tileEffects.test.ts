import { describe, it, expect } from 'vitest'
import { getTileEffect } from '../src/game/tileEffects'

describe('tileEffects', () => {
  it('normal tile has no effect', () => {
    const effect = getTileEffect('normal')
    expect(effect).toEqual({ type: 'none' })
  })

  it('snail tile causes wait', () => {
    const effect = getTileEffect('snail')
    expect(effect).toEqual({ type: 'wait', duration: 60000 })
  })

  it('rocket tile moves forward 6', () => {
    const effect = getTileEffect('rocket')
    expect(effect).toEqual({ type: 'advance', steps: 6 })
  })

  it('car tile moves forward 4', () => {
    const effect = getTileEffect('car')
    expect(effect).toEqual({ type: 'advance', steps: 4 })
  })

  it('enemy tile triggers combat', () => {
    const effect = getTileEffect('enemy')
    expect(effect).toEqual({ type: 'combat', isBoss: false })
  })

  it('boss tile triggers boss combat', () => {
    const effect = getTileEffect('boss')
    expect(effect).toEqual({ type: 'combat', isBoss: true })
  })

  it('loot tile gives item', () => {
    const effect = getTileEffect('loot')
    expect(effect).toEqual({ type: 'loot' })
  })
})
