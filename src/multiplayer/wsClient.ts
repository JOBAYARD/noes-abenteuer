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
