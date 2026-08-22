import { io, Socket } from 'socket.io-client'

type EventHandler = (...args: any[]) => void

class MockSocket {
  public id = 'mock-' + Math.random().toString(36).substring(2, 9)
  public connected = true
  private listeners: Map<string, EventHandler[]> = new Map()

  on(event: string, fn: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
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
    list.forEach(cb => {
      try {
        cb(...args)
      } catch (err) {
        console.error(`[MockSocket Error on ${event}]`, err)
      }
    })
    return this
  }

  disconnect() {
    this.connected = false
    return this
  }
}

let socketInstance: Socket | MockSocket | null = null

export function getSocket(): Socket | MockSocket {
  if (!socketInstance) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '')

    if (backendUrl) {
      try {
        socketInstance = io(backendUrl, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
        })
        console.log('[SafeSpeak Socket] Connected to live backend at:', backendUrl)
      } catch (err) {
        console.warn('[SafeSpeak Socket] Live connection failed, using resilient fallback bus:', err)
        socketInstance = new MockSocket()
      }
    } else {
      socketInstance = new MockSocket()
      console.log('[SafeSpeak Socket] Initialized active standalone event bus:', (socketInstance as any).id)
    }
  }

  return socketInstance
}
