import { describe, it, expect } from 'vitest'
import { getReachableTiles, getPathForSteps } from '../src/game/movement'
import { level1 } from '../src/data/levels/level1'

describe('movement', () => {
  it('getReachableTiles returns correct tiles for 1 step', () => {
    const tiles = getReachableTiles(level1.tiles, 'start', 1)
    expect(tiles).toEqual(['t1'])
  })

  it('getReachableTiles returns correct tiles for 2 steps', () => {
    const tiles = getReachableTiles(level1.tiles, 'start', 2)
    expect(tiles).toEqual(['t2'])
  })

  it('getReachableTiles stops at fork and returns choices', () => {
    const tiles = getReachableTiles(level1.tiles, 't1', 2)
    expect(tiles.sort()).toEqual(['t3', 't4'].sort())
  })

  it('getPathForSteps returns intermediate path', () => {
    const path = getPathForSteps(level1.tiles, 'start', 't2')
    expect(path).toEqual(['start', 't1', 't2'])
  })

  it('getReachableTiles stops at dead end', () => {
    const tiles = getReachableTiles(level1.tiles, 'dead1', 3)
    expect(tiles).toEqual(['dead1'])
  })
})
