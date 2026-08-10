import { Router } from 'express'
import Counter from '../models/Counter.js'

const router = Router()

router.get('/', async (_request, response, next) => {
  try {
    const counter = await Counter.findOne({ name: 'site_views' })
    response.json({ views: counter?.value ?? 0 })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (_request, response, next) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'site_views' },
      { $inc: { value: 1 } },
      { new: true, upsert: true },
    )
    response.json({ views: counter.value })
  } catch (error) {
    next(error)
  }
})

export default router
