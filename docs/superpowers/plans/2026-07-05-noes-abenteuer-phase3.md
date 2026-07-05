# Noés Abenteuer — Phase 3: Koop-Multiplayer & Audio

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** LAN-Koop-Multiplayer (WebSocket) für 2 Spieler am selben PC (abwechselnd) oder über Netzwerk (gleichzeitig). Splitscreen-Ansicht. Audio-System mit Hintergrundmusik und Soundeffekten. Speicherstand-System.

**Architecture:** WebSocket-Server in Node.js synchronisiert Spielstatus zwischen Clients. Client erkennt automatisch ob Solo/Lokal-Koop/LAN-Koop. Audio über Howler.js mit Theme-basierter Musikauswahl. Speicherstand in LocalStorage.

**Tech Stack:** ws (WebSocket), Howler.js, Node.js Express (minimal für WS-Server)

---

## Dateistruktur (Phase 3 — neue/geänderte Dateien)

```
src/
├── multiplayer/
│   ├── wsClient.ts               # WebSocket Client
│   ├── messages.ts               # Message-Typen
│   └── syncStore.ts              # Store-Sync zwischen Clients
├── components/
│   ├── CoopHUD.tsx               # Partner-Leben + Entfernung
│   ├── ShareLife.tsx             # Leben-Teilen UI
│   └── LobbyScreen.tsx          # Host/Join-Lobby
├── audio/
│   ├── audioManager.ts           # Sound + Musik Verwaltung
│   └── tracks.ts                 # Track-Definitionen pro Level
├── save/
│   └── saveManager.ts            # LocalStorage Speicherstand
└── App.tsx (erweitern)
server/
├── package.json
├── index.ts                      # WebSocket Server
└── gameState.ts                  # Server-seitiger State
```

---

### Task 1: WebSocket Message-Typen

**Files:**
- Create: `src/multiplayer/messages.ts`

- [ ] **Step 1: Message-Typen definieren**

```typescript
// src/multiplayer/messages.ts
import { CharacterType, Equipment } from '@/types/game'

export type ClientMessage =
  | { type: 'join'; playerName: string; character: CharacterType }
  | { type: 'roll'; result: number }
  | { type: 'move'; tileId: string }
  | { type: 'choose_direction'; tileId: string }
  | { type: 'combat_result'; won: boolean }
  | { type: 'share_life'; toPlayerId: string }
  | { type: 'equip_item'; item: Equipment }
  | { type: 'help_combat' }
  | { type: 'ready' }

export type ServerMessage =
  | { type: 'game_state'; state: GameSyncState }
  | { type: 'player_joined'; playerId: string; character: CharacterType }
  | { type: 'player_rolled'; playerId: string; result: number }
  | { type: 'player_moved'; playerId: string; tileId: string }
  | { type: 'combat_started'; playerId: string; combatType: string }
  | { type: 'combat_ended'; playerId: string; won: boolean }
  | { type: 'life_shared'; fromId: string; toId: string }
  | { type: 'loot_found'; playerId: string; item: Equipment }
  | { type: 'level_complete' }
  | { type: 'turn_change'; activePlayerId: string }
  | { type: 'error'; message: string }

export interface GameSyncState {
  currentLevel: number
  players: Array<{
    id: string
    character: CharacterType
    currentTileId: string
    lives: number
    equipment: Equipment[]
    equippedItems: Record<string, Equipment>
  }>
  activePlayerId: string
  phase: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/multiplayer/messages.ts
git commit -m "feat: WebSocket message type definitions for multiplayer"
```

---

### Task 2: WebSocket Server

**Files:**
- Create: `server/package.json`, `server/index.ts`, `server/gameState.ts`

- [ ] **Step 1: Server-Package initialisieren**

```bash
cd C:/Code/zz_Noe && mkdir -p server
```

```json
// server/package.json
{
  "name": "noes-abenteuer-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx index.ts"
  },
  "dependencies": {
    "ws": "^8.16.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "@types/ws": "^8.5.10"
  }
}
```

- [ ] **Step 2: Server-State erstellen**

```typescript
// server/gameState.ts
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
      id,
      character,
      currentTileId: 'start',
      lives: 2,
      equipment: [],
      equippedItems: {},
      ready: false,
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

  getDistance(id1: string, id2: string): number {
    // Simplified: returns tile index difference
    const p1 = this.players.get(id1)
    const p2 = this.players.get(id2)
    if (!p1 || !p2) return Infinity
    const idx1 = parseInt(p1.currentTileId.replace(/\D/g, '')) || 0
    const idx2 = parseInt(p2.currentTileId.replace(/\D/g, '')) || 0
    return Math.abs(idx1 - idx2)
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
```

- [ ] **Step 3: WebSocket-Server implementieren**

```typescript
// server/index.ts
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
```

- [ ] **Step 4: Server-Dependencies installieren**

```bash
cd C:/Code/zz_Noe/server && npm install
```

- [ ] **Step 5: Commit**

```bash
cd C:/Code/zz_Noe && git add server/
git commit -m "feat: WebSocket multiplayer server with game state sync"
```

---

### Task 3: WebSocket Client

**Files:**
- Create: `src/multiplayer/wsClient.ts`, `src/multiplayer/syncStore.ts`

- [ ] **Step 1: wsClient erstellen**

```typescript
// src/multiplayer/wsClient.ts
import { ClientMessage, ServerMessage } from './messages'

type MessageHandler = (msg: ServerMessage) => void

class WsClient {
  private ws: WebSocket | null = null
  private handlers: MessageHandler[] = []
  private reconnectTimer: number | null = null

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url)
      this.ws.onopen = () => resolve()
      this.ws.onerror = () => reject(new Error('Connection failed'))
      this.ws.onmessage = (event) => {
        const msg: ServerMessage = JSON.parse(event.data)
        this.handlers.forEach(h => h(msg))
      }
      this.ws.onclose = () => {
        this.ws = null
      }
    })
  }

  send(msg: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler)
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsClient = new WsClient()
```

- [ ] **Step 2: syncStore erstellen**

```typescript
// src/multiplayer/syncStore.ts
import { create } from 'zustand'
import { wsClient } from './wsClient'
import { GameSyncState, ServerMessage } from './messages'

interface MultiplayerState {
  isMultiplayer: boolean
  isHost: boolean
  connected: boolean
  myPlayerId: string | null
  syncState: GameSyncState | null
  setMultiplayer: (isHost: boolean) => void
  connect: (url: string) => Promise<void>
  disconnect: () => void
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  isMultiplayer: false,
  isHost: false,
  connected: false,
  myPlayerId: null,
  syncState: null,

  setMultiplayer: (isHost) => set({ isMultiplayer: true, isHost }),

  connect: async (url) => {
    await wsClient.connect(url)
    set({ connected: true })

    wsClient.onMessage((msg: ServerMessage) => {
      switch (msg.type) {
        case 'game_state':
          set({ syncState: msg.state })
          break
        case 'player_joined':
          if (!get().myPlayerId) {
            set({ myPlayerId: msg.playerId })
          }
          break
      }
    })
  },

  disconnect: () => {
    wsClient.disconnect()
    set({ isMultiplayer: false, connected: false, myPlayerId: null, syncState: null })
  },
}))
```

- [ ] **Step 3: Commit**

```bash
git add src/multiplayer/
git commit -m "feat: WebSocket client and multiplayer sync store"
```

---

### Task 4: Lobby-Bildschirm

**Files:**
- Create: `src/components/LobbyScreen.tsx`

- [ ] **Step 1: LobbyScreen erstellen**

```typescript
// src/components/LobbyScreen.tsx
import { useState } from 'react'
import { useMultiplayerStore } from '@/multiplayer/syncStore'
import { wsClient } from '@/multiplayer/wsClient'
import { CharacterType } from '@/types/game'

interface LobbyScreenProps {
  onStart: () => void
  onBack: () => void
}

export function LobbyScreen({ onStart, onBack }: LobbyScreenProps) {
  const [serverIp, setServerIp] = useState('localhost')
  const [character, setCharacter] = useState<CharacterType>('human')
  const [status, setStatus] = useState<'idle' | 'connecting' | 'waiting' | 'error'>('idle')
  const { connect, setMultiplayer, connected, syncState } = useMultiplayerStore()

  const handleHost = async () => {
    setStatus('connecting')
    setMultiplayer(true)
    try {
      await connect(`ws://localhost:3001`)
      wsClient.send({ type: 'join', playerName: 'Spieler 1', character })
      setStatus('waiting')
    } catch {
      setStatus('error')
    }
  }

  const handleJoin = async () => {
    setStatus('connecting')
    setMultiplayer(false)
    try {
      await connect(`ws://${serverIp}:3001`)
      wsClient.send({ type: 'join', playerName: 'Spieler 2', character })
      setStatus('waiting')
    } catch {
      setStatus('error')
    }
  }

  if (syncState && syncState.players.length === 2) {
    onStart()
    return null
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)',
      color: 'white',
    }}>
      <h2 style={{ marginBottom: '2rem', color: '#a78bfa' }}>Koop-Modus</h2>

      {status === 'idle' && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>Deine Figur:</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setCharacter('human')}
                style={{
                  padding: '0.7rem 1.5rem',
                  background: character === 'human' ? '#7c3aed' : '#374151',
                  color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                }}
              >🧙 Mensch</button>
              <button
                onClick={() => setCharacter('tiger')}
                style={{
                  padding: '0.7rem 1.5rem',
                  background: character === 'tiger' ? '#d97706' : '#374151',
                  color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                }}
              >🐯 Tiger</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={handleHost} style={{
              padding: '1rem 2rem', background: '#7c3aed',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}>Spiel erstellen (Host)</button>

            <button onClick={handleJoin} style={{
              padding: '1rem 2rem', background: '#059669',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}>Beitreten</button>
          </div>

          <input
            value={serverIp}
            onChange={(e) => setServerIp(e.target.value)}
            placeholder="Server-IP (z.B. 192.168.1.50)"
            style={{
              padding: '0.5rem 1rem', background: '#1f2937',
              color: 'white', border: '1px solid #4b5563',
              borderRadius: '6px', width: '250px', textAlign: 'center',
            }}
          />
        </>
      )}

      {status === 'waiting' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            Warte auf zweiten Spieler...
          </p>
          <p style={{ opacity: 0.6 }}>
            {connected ? '✅ Verbunden' : '⏳ Verbinde...'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Verbindung fehlgeschlagen!</p>
          <button onClick={() => setStatus('idle')} style={{
            padding: '0.7rem 1.5rem', background: '#374151',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>Nochmal versuchen</button>
        </div>
      )}

      <button onClick={onBack} style={{
        marginTop: '2rem', padding: '0.5rem 1.5rem',
        background: 'transparent', color: '#9ca3af',
        border: '1px solid #4b5563', borderRadius: '6px', cursor: 'pointer',
      }}>← Zurück</button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LobbyScreen.tsx
git commit -m "feat: multiplayer lobby screen with host/join flow"
```

---

### Task 5: Koop-HUD (Partner-Info + Leben teilen)

**Files:**
- Create: `src/components/CoopHUD.tsx`, `src/components/ShareLife.tsx`

- [ ] **Step 1: CoopHUD erstellen**

```typescript
// src/components/CoopHUD.tsx
import { useGameStore } from '@/store/gameStore'

export function CoopHUD() {
  const players = useGameStore((s) => s.players)
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex)

  if (players.length < 2) return null

  const partner = players[activePlayerIndex === 0 ? 1 : 0]
  const active = players[activePlayerIndex]

  const getFieldNumber = (tileId: string): number => {
    const num = parseInt(tileId.replace(/\D/g, ''))
    return isNaN(num) ? 0 : num
  }

  const distance = Math.abs(getFieldNumber(active.currentTileId) - getFieldNumber(partner.currentTileId))
  const canHelp = distance <= 3

  return (
    <div style={{
      position: 'absolute', top: '3.5rem', left: '1rem',
      background: 'rgba(0,0,0,0.6)', padding: '0.7rem 1rem',
      borderRadius: '8px', color: 'white', fontSize: '0.9rem',
    }}>
      <div style={{ marginBottom: '0.3rem', color: '#a78bfa' }}>
        Partner ({partner.character === 'human' ? '🧙' : '🐯'})
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
        {Array.from({ length: partner.lives }).map((_, i) => <span key={i}>❤️</span>)}
        {Array.from({ length: Math.max(0, 2 - partner.lives) }).map((_, i) => <span key={i} style={{ opacity: 0.3 }}>🖤</span>)}
      </div>
      <div style={{ color: canHelp ? '#10b981' : '#6b7280' }}>
        Abstand: {distance} Felder {canHelp ? '(kann helfen!)' : ''}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: ShareLife erstellen**

```typescript
// src/components/ShareLife.tsx
import { useGameStore } from '@/store/gameStore'

export function ShareLife() {
  const players = useGameStore((s) => s.players)
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex)

  if (players.length < 2) return null

  const activePlayer = players[activePlayerIndex]
  const partnerIndex = activePlayerIndex === 0 ? 1 : 0

  const canShare = activePlayer.lives > 1

  const handleShare = () => {
    if (!canShare) return
    useGameStore.setState((state) => {
      const newPlayers = [...state.players]
      newPlayers[activePlayerIndex] = { ...newPlayers[activePlayerIndex], lives: newPlayers[activePlayerIndex].lives - 1 }
      newPlayers[partnerIndex] = { ...newPlayers[partnerIndex], lives: newPlayers[partnerIndex].lives + 1 }
      return { players: newPlayers }
    })
  }

  return (
    <button
      onClick={handleShare}
      disabled={!canShare}
      title={canShare ? 'Ein Leben an Partner senden' : 'Du brauchst mind. 2 Leben'}
      style={{
        position: 'absolute', top: '3.5rem', right: '1rem',
        padding: '0.5rem 1rem',
        background: canShare ? '#dc2626' : '#374151',
        color: 'white', border: 'none', borderRadius: '8px',
        cursor: canShare ? 'pointer' : 'default',
        opacity: canShare ? 1 : 0.5,
        fontSize: '0.9rem',
      }}
    >
      ❤️ → Partner
    </button>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CoopHUD.tsx src/components/ShareLife.tsx
git commit -m "feat: coop HUD with partner info and life sharing"
```

---

### Task 6: Audio-System

**Files:**
- Create: `src/audio/audioManager.ts`, `src/audio/tracks.ts`

- [ ] **Step 1: Howler.js installieren**

```bash
cd C:/Code/zz_Noe && npm install howler && npm install -D @types/howler
```

- [ ] **Step 2: Track-Definitionen erstellen**

```typescript
// src/audio/tracks.ts
export interface TrackDef {
  key: string
  src: string
  loop: boolean
  volume: number
}

export const MUSIC_TRACKS: Record<string, TrackDef> = {
  menu: { key: 'menu', src: '/audio/music/menu.mp3', loop: true, volume: 0.4 },
  forest: { key: 'forest', src: '/audio/music/forest.mp3', loop: true, volume: 0.3 },
  swamp: { key: 'swamp', src: '/audio/music/swamp.mp3', loop: true, volume: 0.3 },
  cave: { key: 'cave', src: '/audio/music/cave.mp3', loop: true, volume: 0.3 },
  desert: { key: 'desert', src: '/audio/music/desert.mp3', loop: true, volume: 0.3 },
  underwater: { key: 'underwater', src: '/audio/music/underwater.mp3', loop: true, volume: 0.3 },
  ice: { key: 'ice', src: '/audio/music/ice.mp3', loop: true, volume: 0.3 },
  volcano: { key: 'volcano', src: '/audio/music/volcano.mp3', loop: true, volume: 0.3 },
  castle: { key: 'castle', src: '/audio/music/castle.mp3', loop: true, volume: 0.3 },
  sky: { key: 'sky', src: '/audio/music/sky.mp3', loop: true, volume: 0.3 },
  space: { key: 'space', src: '/audio/music/space.mp3', loop: true, volume: 0.3 },
  combat: { key: 'combat', src: '/audio/music/combat.mp3', loop: true, volume: 0.4 },
}

export const SFX: Record<string, TrackDef> = {
  dice_roll: { key: 'dice_roll', src: '/audio/sfx/dice.mp3', loop: false, volume: 0.6 },
  step: { key: 'step', src: '/audio/sfx/step.mp3', loop: false, volume: 0.4 },
  hit: { key: 'hit', src: '/audio/sfx/hit.mp3', loop: false, volume: 0.5 },
  victory: { key: 'victory', src: '/audio/sfx/victory.mp3', loop: false, volume: 0.7 },
  defeat: { key: 'defeat', src: '/audio/sfx/defeat.mp3', loop: false, volume: 0.5 },
  loot: { key: 'loot', src: '/audio/sfx/loot.mp3', loop: false, volume: 0.6 },
  snail: { key: 'snail', src: '/audio/sfx/snail.mp3', loop: false, volume: 0.5 },
  rocket: { key: 'rocket', src: '/audio/sfx/rocket.mp3', loop: false, volume: 0.6 },
  level_complete: { key: 'level_complete', src: '/audio/sfx/fanfare.mp3', loop: false, volume: 0.8 },
}
```

- [ ] **Step 3: AudioManager implementieren**

```typescript
// src/audio/audioManager.ts
import { Howl, Howler } from 'howler'
import { MUSIC_TRACKS, SFX, TrackDef } from './tracks'

class AudioManager {
  private music: Howl | null = null
  private currentMusicKey: string | null = null
  private sfxCache: Map<string, Howl> = new Map()
  private muted = false

  playMusic(key: string) {
    if (key === this.currentMusicKey) return

    const track = MUSIC_TRACKS[key]
    if (!track) return

    this.stopMusic()
    this.currentMusicKey = key
    this.music = new Howl({
      src: [track.src],
      loop: track.loop,
      volume: track.volume,
    })
    this.music.play()
  }

  stopMusic() {
    if (this.music) {
      this.music.fade(this.music.volume(), 0, 500)
      setTimeout(() => {
        this.music?.stop()
        this.music = null
      }, 500)
    }
    this.currentMusicKey = null
  }

  playSfx(key: string) {
    const track = SFX[key]
    if (!track) return

    let howl = this.sfxCache.get(key)
    if (!howl) {
      howl = new Howl({ src: [track.src], volume: track.volume })
      this.sfxCache.set(key, howl)
    }
    howl.play()
  }

  toggleMute() {
    this.muted = !this.muted
    Howler.mute(this.muted)
    return this.muted
  }

  get isMuted() {
    return this.muted
  }
}

export const audioManager = new AudioManager()
```

- [ ] **Step 4: Audio-Platzhalter-Verzeichnis erstellen**

```bash
mkdir -p C:/Code/zz_Noe/public/audio/music C:/Code/zz_Noe/public/audio/sfx
```

- [ ] **Step 5: Commit**

```bash
git add src/audio/ public/audio/
git commit -m "feat: audio manager with Howler.js for music and SFX"
```

---

### Task 7: Speicherstand-System

**Files:**
- Create: `src/save/saveManager.ts`

- [ ] **Step 1: SaveManager implementieren**

```typescript
// src/save/saveManager.ts
import { Equipment } from '@/types/game'

interface SaveData {
  currentLevel: number
  unlockedLevels: number[]
  character: string
  equipment: Equipment[]
  equippedItems: Record<string, Equipment>
  savedAt: string
}

const SAVE_KEY = 'noes-abenteuer-save'

export function saveGame(data: Omit<SaveData, 'savedAt'>) {
  const save: SaveData = { ...data, savedAt: new Date().toISOString() }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

export function loadGame(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SaveData
  } catch {
    return null
  }
}

export function hasSaveGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function deleteSaveGame() {
  localStorage.removeItem(SAVE_KEY)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/save/saveManager.ts
git commit -m "feat: localStorage save/load system"
```

---

### Task 8: Integration — Koop + Audio + Save in App

**Files:**
- Modify: `src/App.tsx`, `src/components/MainMenu.tsx`

- [ ] **Step 1: MainMenu um Koop + Laden erweitern**

In `MainMenu.tsx` hinzufügen:
- "Spiel laden" Button (wenn Speicherstand existiert)
- "Koop (LAN)" Button der zur LobbyScreen führt

```typescript
// Ergänzungen in MainMenu.tsx:
import { hasSaveGame, loadGame } from '@/save/saveManager'

// Im JSX nach "Spiel starten" Button:
{hasSaveGame() && (
  <button
    onClick={() => {
      const save = loadGame()
      if (save) {
        startGame(save.character as any)
        // Level + Equipment aus Save setzen
      }
    }}
    style={{
      marginTop: '1rem', padding: '0.8rem 2rem',
      background: '#374151', color: 'white',
      border: '1px solid #4b5563', borderRadius: '8px', cursor: 'pointer',
    }}
  >
    Spiel laden
  </button>
)}

<button
  onClick={() => { /* navigate to lobby */ }}
  style={{
    marginTop: '1rem', padding: '0.8rem 2rem',
    background: '#059669', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
  }}
>
  🤝 Koop (LAN)
</button>
```

- [ ] **Step 2: Audio-Hooks in App.tsx einbauen**

```typescript
// In App.tsx importieren:
import { audioManager } from '@/audio/audioManager'
import { getLevel } from '@/data/levels'

// Bei Phase-Wechsel Musik wechseln:
// Wenn phase === 'menu': audioManager.playMusic('menu')
// Wenn phase === 'playing': audioManager.playMusic(getLevel(currentLevel).theme)
// Wenn phase === 'combat': audioManager.playMusic('combat')

// Bei Events SFX abspielen:
// Würfel: audioManager.playSfx('dice_roll')
// Kampf gewonnen: audioManager.playSfx('victory')
// Level geschafft: audioManager.playSfx('level_complete')
// Loot: audioManager.playSfx('loot')
```

- [ ] **Step 3: Auto-Save nach Level-Abschluss**

```typescript
// In App.tsx nach completeLevel():
import { saveGame } from '@/save/saveManager'

// Nach Level-Sieg:
saveGame({
  currentLevel: currentLevel + 1,
  unlockedLevels: [...unlockedLevels, currentLevel + 1],
  character: player.character,
  equipment: player.equipment,
  equippedItems: player.equippedItems as Record<string, Equipment>,
})
```

- [ ] **Step 4: CoopHUD + ShareLife in App.tsx einbinden (wenn 2 Spieler)**

```typescript
// In der Game-Ansicht:
import { CoopHUD } from '@/components/CoopHUD'
import { ShareLife } from '@/components/ShareLife'

// Im JSX (nach HUD):
{players.length > 1 && <CoopHUD />}
{players.length > 1 && <ShareLife />}
```

- [ ] **Step 5: Dev-Server testen**

```bash
npx vite
```

Expected: Spiel startet mit Musik, SFX bei Aktionen, Speicherstand funktioniert.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/MainMenu.tsx
git commit -m "feat: integrate coop, audio, and save system into main app"
```

---

## Phase 3 — Zusammenfassung

Nach Abschluss aller 8 Tasks hat man:
- WebSocket-Server für LAN-Multiplayer
- Host/Join-Lobby für Koop
- Splitscreen-fähige Darstellung (2 Spieler)
- Leben teilen zwischen Partnern
- Koop-HUD mit Partner-Info und Entfernungsanzeige
- Audio-System (Musik + Soundeffekte)
- Level-basierte Hintergrundmusik
- Auto-Save nach jedem abgeschlossenen Level
- Speicherstand laden/löschen

---

## Gesamtprojekt — Was danach noch möglich ist (Optional)

- Echte 3D-Modelle statt Platzhalter-Geometrie laden
- Partikeleffekte für Magie/Spezialfelder
- Animierte Übergänge zwischen Leveln
- Bessere Level-Layouts (kurvige Pfade statt gerade Linien)
- Sound-Dateien besorgen (freie Assets von freesound.org, opengameart.org)
- Touch-Optimierung für iPad
- Polishing: Schatten, Post-Processing, Partikel
