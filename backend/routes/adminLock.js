import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()
const adminPasswordHash = '$2b$12$j3Op4G//pFKh8TZolI07reuSIr08QbIw5XRKw7h1MA.kmlJZzlTHe'
const cookieName = 'lyceum_admin'

function isUnlocked(request) {
  try {
    const payload = jwt.verify(request.cookies[cookieName], process.env.JWT_SECRET)
    return payload.access === 'admin'
  } catch {
    return false
  }
}

export function requireAdminUnlock(request, response, next) {
  if (!isUnlocked(request)) {
    return response.status(401).json({ error: 'Admin access is required.' })
  }
  return next()
}

router.get('/status', (request, response) => {
  response.json({ unlocked: isUnlocked(request) })
})

router.post('/unlock', async (request, response) => {
  const password = String(request.body.password ?? '')
  if (!(await bcrypt.compare(password, adminPasswordHash))) {
    return response.status(401).json({ error: 'That admin password is incorrect.' })
  }

  const token = jwt.sign({ access: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' })
  response.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
  return response.json({ unlocked: true })
})

export default router
