import { WebSocketServer, WebSocket } from 'ws'
import { GameState } from './gameState.js'

const PORT = parseInt(process.env.PORT || '3001')
const wss = new WebSocketServer({ port: PORT })
const state = new GameState()
const clients = new Map<string, WebSocket>()

function broadcast(message: object) {
  const data = JSON.stringify(message)
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(data)
  }
}

function sendTo(id: string, message: object) {
  const ws = clients.get(id)
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

wss.on('connection', (ws) => {
  let playerId: string | null = null

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())

    switch (msg.type) {
      case 'join': {
        playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
        clients.set(playerId, ws)
        state.addPlayer(playerId, msg.character)
        broadcast({ type: 'player_joined', playerId, character: msg.character })
        broadcast({ type: 'game_state', state: state.toSyncState() })
        if (state.players.size === 2) {
          state.phase = 'playing'
          broadcast({ type: 'game_state', state: state.toSyncState() })
        }
        break
      }
      case 'roll': {
        if (playerId !== state.activePlayerId) {
          sendTo(playerId!, { type: 'error', message: 'Nicht dein Zug!' })
          return
        }
        broadcast({ type: 'player_rolled', playerId, result: msg.result })
        break
      }
      case 'move': {
        if (!playerId) return
        state.movePlayer(playerId, msg.tileId)
        broadcast({ type: 'player_moved', playerId, tileId: msg.tileId })
        break
      }
      case 'combat_result': {
        if (!playerId) return
        if (!msg.won) state.loseLife(playerId)
        broadcast({ type: 'combat_ended', playerId, won: msg.won })
        state.nextTurn()
        broadcast({ type: 'turn_change', activePlayerId: state.activePlayerId! })
        broadcast({ type: 'game_state', state: state.toSyncState() })
        break
      }
      case 'share_life': {
        if (!playerId) return
        const success = state.shareLife(playerId, msg.toPlayerId)
        if (success) {
          broadcast({ type: 'life_shared', fromId: playerId, toId: msg.toPlayerId })
          broadcast({ type: 'game_state', state: state.toSyncState() })
        }
        break
      }
      case 'ready': {
        if (!playerId) return
        const player = state.players.get(playerId)
        if (player) player.ready = true
        if ([...state.players.values()].every(p => p.ready)) {
          state.phase = 'playing'
          broadcast({ type: 'game_state', state: state.toSyncState() })
        }
        break
      }
    }
  })

  ws.on('close', () => {
    if (playerId) {
      state.removePlayer(playerId)
      clients.delete(playerId)
      broadcast({ type: 'game_state', state: state.toSyncState() })
    }
  })
})

console.log(`WebSocket Server running on ws://0.0.0.0:${PORT}`)
