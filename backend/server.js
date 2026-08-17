import express from 'express'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import mongoose from 'mongoose'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth.js'
import adminLockRoutes, { requireAdminUnlock } from './routes/adminLock.js'
import leaderboardRoutes from './routes/leaderboard.js'
import progressRoutes from './routes/progress.js'
import viewsRoutes from './routes/views.js'

const backendDir = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(backendDir, '..')
const distDir = resolve(rootDir, 'dist')
config({ path: resolve(backendDir, '.env') })
const port = Number.parseInt(process.env.PORT || '3001', 10)
const host = process.env.HOST || '127.0.0.1'

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is required and must be at least 32 characters.')
}

await mongoose.connect(process.env.MONGODB_URI)

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '512kb' }))
app.use(cookieParser())

app.use('/api/admin-lock', adminLockRoutes)
app.use('/api', requireAdminUnlock)
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/views', viewsRoutes)

app.use('/api', (_request, response) => response.status(404).json({ error: 'API route not found.' }))

if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*path', (_request, response) => response.sendFile(resolve(distDir, 'index.html')))
}

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'The server could not complete that request.' })
})

app.listen(port, host, () => {
  console.log(`Lyceum server listening on http://${host}:${port}`)
})
