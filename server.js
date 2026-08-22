// SafeSpeak Root Server Launcher for Replit / Cloud Deployments
import { spawn } from 'child_process'

console.log('[SafeSpeak Deploy] Starting backend server via tsx...')

const child = spawn('npx', ['tsx', 'apps/server/src/server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code || 0)
})
