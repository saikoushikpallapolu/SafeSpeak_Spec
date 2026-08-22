// SafeSpeak Root Server Launcher for Cloud & Replit Deployments
import { spawn } from 'child_process'

console.log('[SafeSpeak Deploy] Starting backend server via tsx...')

const child = spawn('npx', ['tsx', 'apps/server/src/server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: process.env.PORT || '4000',
    HOST: '0.0.0.0',
  },
})

child.on('exit', (code) => {
  process.exit(code || 0)
})
