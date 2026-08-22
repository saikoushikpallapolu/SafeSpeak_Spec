import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { setupSocketHandlers } from './socket/chatHandlers.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

// Health check endpoint
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

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

setupSocketHandlers(io)

server.listen(PORT, () => {
  console.log(`[SafeSpeak Server] Running on http://localhost:${PORT}`)
})
