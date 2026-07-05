import { Tile } from '@/types/game'

export function getReachableTiles(tiles: Tile[], fromId: string, steps: number): string[] {
  const tileMap = new Map(tiles.map(t => [t.id, t]))

  function walk(currentId: string, remaining: number): string[] {
    if (remaining === 0) return [currentId]

    const tile = tileMap.get(currentId)
    if (!tile || tile.connections.length === 0) return [currentId]

    if (tile.connections.length > 1 && currentId !== fromId) {
      return tile.connections
    }

    if (tile.connections.length === 1) {
      return walk(tile.connections[0], remaining - 1)
    }

    // From the starting tile with multiple connections and steps > 0:
    const results: string[] = []
    for (const nextId of tile.connections) {
      results.push(...walk(nextId, remaining - 1))
    }
    return [...new Set(results)]
  }

  return walk(fromId, steps)
}

export function getPathForSteps(tiles: Tile[], fromId: string, toId: string): string[] {
  const tileMap = new Map(tiles.map(t => [t.id, t]))
  const visited = new Set<string>()
  const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }]

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    if (id === toId) return path
    if (visited.has(id)) continue
    visited.add(id)

    const tile = tileMap.get(id)
    if (!tile) continue
    for (const nextId of tile.connections) {
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, path: [...path, nextId] })
      }
    }
  }

  return [fromId]
}
