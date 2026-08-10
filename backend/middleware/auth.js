import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function requireAuth(request, response, next) {
  try {
    const token = request.cookies.lyceum_token
    if (!token) return response.status(401).json({ error: 'Please log in to continue.' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.userId)
    if (!user) return response.status(401).json({ error: 'User account not found.' })

    request.user = user
    return next()
  } catch {
    return response.status(401).json({ error: 'Your session has expired. Please log in again.' })
  }
}
