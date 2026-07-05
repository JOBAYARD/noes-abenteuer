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
