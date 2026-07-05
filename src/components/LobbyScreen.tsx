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
      await connect('ws://localhost:3001')
      wsClient.send({ type: 'join', playerName: 'Spieler 1', character })
      setStatus('waiting')
    } catch { setStatus('error') }
  }

  const handleJoin = async () => {
    setStatus('connecting')
    setMultiplayer(false)
    try {
      await connect(`ws://${serverIp}:3001`)
      wsClient.send({ type: 'join', playerName: 'Spieler 2', character })
      setStatus('waiting')
    } catch { setStatus('error') }
  }

  if (syncState && syncState.players.length === 2) {
    onStart()
    return null
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)', color: 'white' }}>
      <h2 style={{ marginBottom: '2rem', color: '#a78bfa' }}>Koop-Modus</h2>

      {status === 'idle' && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>Deine Figur:</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setCharacter('human')} style={{ padding: '0.7rem 1.5rem', background: character === 'human' ? '#7c3aed' : '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>🧙 Mensch</button>
              <button onClick={() => setCharacter('tiger')} style={{ padding: '0.7rem 1.5rem', background: character === 'tiger' ? '#d97706' : '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>🐯 Tiger</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={handleHost} style={{ padding: '1rem 2rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Spiel erstellen (Host)</button>
            <button onClick={handleJoin} style={{ padding: '1rem 2rem', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Beitreten</button>
          </div>
          <input value={serverIp} onChange={(e) => setServerIp(e.target.value)} placeholder="Server-IP (z.B. 192.168.1.50)" style={{ padding: '0.5rem 1rem', background: '#1f2937', color: 'white', border: '1px solid #4b5563', borderRadius: '6px', width: '250px', textAlign: 'center' }} />
        </>
      )}

      {status === 'waiting' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Warte auf zweiten Spieler...</p>
          <p style={{ opacity: 0.6 }}>{connected ? '✅ Verbunden' : '⏳ Verbinde...'}</p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Verbindung fehlgeschlagen!</p>
          <button onClick={() => setStatus('idle')} style={{ padding: '0.7rem 1.5rem', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Nochmal versuchen</button>
        </div>
      )}

      <button onClick={onBack} style={{ marginTop: '2rem', padding: '0.5rem 1.5rem', background: 'transparent', color: '#9ca3af', border: '1px solid #4b5563', borderRadius: '6px', cursor: 'pointer' }}>← Zurück</button>
    </div>
  )
}
