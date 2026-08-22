import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { setupSocketHandlers } from './socket/chatHandlers.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

const PORT = Number(process.env.PORT) || 4000
const HOST = '0.0.0.0'

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'SafeSpeak Backend Real-Time Engine',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
    },
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SafeSpeak Backend',
    timestamp: new Date().toISOString(),
    features: {
      crisisDetection: 'active',
      multilingualTranslation: 'active',
      matchingQueue: 'active',
      peerSimulator: 'active',
      groupRooms: 'active',
    },
  })
})

// Setup Socket.IO with cross-origin support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})

setupSocketHandlers(io)

server.listen(PORT, HOST, () => {
  console.log(`[SafeSpeak Server] Running on http://${HOST}:${PORT}`)
})
