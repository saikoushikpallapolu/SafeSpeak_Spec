import { io, Socket } from 'socket.io-client'

type EventHandler = (...args: any[]) => void

class MockSocket {
  public id = 'mock-' + Math.random().toString(36).substring(2, 9)
  public connected = true
  private listeners: Map<string, EventHandler[]> = new Map()

  on(event: string, fn: EventHandler) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(fn)
    return this
  }

  off(event: string, fn?: EventHandler) {
    if (!fn) {
      this.listeners.delete(event)
    } else {
      const list = this.listeners.get(event) || []
      this.listeners.set(event, list.filter(cb => cb !== fn))
    }
    return this
  }

  emit(event: string, ...args: any[]) {
    const list = this.listeners.get(event) || []
    list.forEach(cb => { try { cb(...args) } catch (err) { console.error(`[MockSocket] Error on ${event}:`, err) } })
    return this
  }

  disconnect() { this.connected = false; return this }
}

let socketInstance: Socket | MockSocket | null = null

const BACKEND_URL = 'https://safespeak-backend-mv7h.onrender.com'

export function getSocket(): Socket | MockSocket {
  if (!socketInstance) {
    console.log('[SafeSpeak Socket] Initializing connection to:', BACKEND_URL)
    try {
      socketInstance = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        timeout: 20000,
      })

      socketInstance.on('connect', () => {
        console.log('[SafeSpeak Socket] ✅ Connected! Socket ID:', (socketInstance as Socket).id)
      })
      socketInstance.on('connect_error', (err: Error) => {
        console.error('[SafeSpeak Socket] ❌ Connection error:', err.message)
      })
      socketInstance.on('disconnect', (reason: string) => {
        console.warn('[SafeSpeak Socket] Disconnected:', reason)
      })
    } catch (err) {
      console.error('[SafeSpeak Socket] Failed to create socket, using mock bus:', err)
      socketInstance = new MockSocket()
    }
  }
  return socketInstance
}

/** Utility: wait until the socket is connected, then call fn */
export function whenConnected(fn: (s: Socket | MockSocket) => void) {
  const s = getSocket()
  if ((s as any).connected) {
    fn(s)
  } else {
    s.once('connect', () => fn(s))
    // If still not connected after 10s, try anyway
    setTimeout(() => {
      if (!(s as any).connected) {
        console.warn('[SafeSpeak Socket] Socket not connected after 10s — emitting anyway')
        fn(s)
      }
    }, 10000)
  }
}
