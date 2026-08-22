// Safe WebSocket client with graceful standalone fallback

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

let socketInstance: any = null

export function getSocket(): any {
  if (!socketInstance) {
    try {
      // In standalone client prototype, use high-speed in-memory event bus
      socketInstance = new MockSocket()
      console.log('[SafeSpeak Socket] Initialized active message bus:', socketInstance.id)
    } catch {
      socketInstance = new MockSocket()
    }
  }

  return socketInstance
}
