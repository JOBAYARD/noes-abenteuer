interface PlayerState {
  id: string
  character: string
  currentTileId: string
  lives: number
  equipment: any[]
  equippedItems: Record<string, any>
  ready: boolean
}

export class GameState {
  players: Map<string, PlayerState> = new Map()
  currentLevel = 1
  activePlayerId: string | null = null
  phase: 'lobby' | 'playing' | 'combat' | 'result' = 'lobby'

  addPlayer(id: string, character: string): PlayerState {
    const player: PlayerState = {
      id, character, currentTileId: 'start', lives: 2,
      equipment: [], equippedItems: {}, ready: false,
    }
    this.players.set(id, player)
    if (!this.activePlayerId) this.activePlayerId = id
    return player
  }

  removePlayer(id: string) {
    this.players.delete(id)
    if (this.activePlayerId === id) {
      this.activePlayerId = this.players.keys().next().value ?? null
    }
  }

  nextTurn() {
    const ids = [...this.players.keys()]
    const currentIndex = ids.indexOf(this.activePlayerId!)
    this.activePlayerId = ids[(currentIndex + 1) % ids.length]
  }

  movePlayer(id: string, tileId: string) {
    const player = this.players.get(id)
    if (player) player.currentTileId = tileId
  }

  loseLife(id: string) {
    const player = this.players.get(id)
    if (player) {
      player.lives -= 1
      if (player.lives <= 0) {
        player.lives = 2
        player.currentTileId = 'start'
      }
    }
  }

  shareLife(fromId: string, toId: string): boolean {
    const from = this.players.get(fromId)
    const to = this.players.get(toId)
    if (!from || !to || from.lives <= 1) return false
    from.lives -= 1
    to.lives += 1
    return true
  }

  toSyncState() {
    return {
      currentLevel: this.currentLevel,
      players: [...this.players.values()],
      activePlayerId: this.activePlayerId,
      phase: this.phase,
    }
  }
}
