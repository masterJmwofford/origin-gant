import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')
const dataDir = join(rootDir, '.data')
const counterPath = join(dataDir, 'site-views.json')
const distDir = join(rootDir, 'dist')
const port = Number.parseInt(process.env.PORT || '3001', 10)
const host = process.env.HOST || '127.0.0.1'

const mimeTypes = {
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

function readViews() {
  try {
    const data = JSON.parse(readFileSync(counterPath, 'utf8'))
    return Number.isFinite(data.views) ? data.views : 0
  } catch {
    return 0
  }
}

function writeViews(views) {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  writeFileSync(counterPath, `${JSON.stringify({ views }, null, 2)}\n`)
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(data))
}

function sendFile(response, filePath) {
  try {
    const extension = extname(filePath)
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    })
    response.end(readFileSync(filePath))
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
}

createServer((request, response) => {
  if (request.url === '/api/views' && request.method === 'POST') {
    const views = readViews() + 1
    writeViews(views)
    sendJson(response, 200, { views })
    return
  }

  if (request.url === '/api/views' && request.method === 'GET') {
    sendJson(response, 200, { views: readViews() })
    return
  }

  if (request.url?.startsWith('/api/')) {
    sendJson(response, 404, { error: 'Not found' })
    return
  }

  const requestPath = request.url === '/' ? '/index.html' : request.url || '/index.html'
  const filePath = join(distDir, requestPath)

  if (existsSync(filePath)) {
    sendFile(response, filePath)
    return
  }

  sendFile(response, join(distDir, 'index.html'))
}).listen(port, host, () => {
  console.log(`View tracker server listening on http://${host}:${port}`)
})
