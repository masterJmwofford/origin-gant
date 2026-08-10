import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (_request, response, next) => {
  try {
    const users = await User.find().sort({ points: -1, createdAt: 1 }).limit(100).select('displayName points')
    response.json({
      leaderboard: users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        displayName: user.displayName,
        points: user.points,
      })),
    })
  } catch (error) {
    next(error)
  }
})

export default router
