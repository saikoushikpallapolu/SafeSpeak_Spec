import { io, Socket } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

let socketInstance: Socket | null = null

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('[SafeSpeak Socket] Connected:', socketInstance?.id)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('[SafeSpeak Socket] Disconnected:', reason)
    })

    socketInstance.on('connect_error', (err) => {
      console.warn('[SafeSpeak Socket] Connection error:', err.message)
    })
  }

  return socketInstance
}
