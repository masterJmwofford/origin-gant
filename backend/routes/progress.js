import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { billingEligibilityQuiz, quizQuestions } from '../../src/data/studyGuide.js'

const router = Router()
const allowedSections = new Set([
  'billing',
  'eligibility',
  'index-cards',
  'sso',
  'questions',
  'roadmap',
  'heatmap',
  'shipping',
  'device-upgrades',
  'mesa-breaker',
  'deescalation',
  'script-studio',
])
const quizAnswers = new Map([
  ...billingEligibilityQuiz.map((question) => [`billing-eligibility:${question.prompt}`, question.answer]),
  ...quizQuestions.map((question) => [`index-cards:${question.prompt}`, question.answer]),
])

async function awardUniqueEvent(userId, event) {
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, 'progress.key': { $ne: event.key } },
    { $inc: { points: event.points }, $push: { progress: event } },
    { new: true },
  )

  if (updatedUser) return { awarded: event.points, user: updatedUser }
  return { awarded: 0, user: await User.findById(userId) }
}

router.post('/section-view', requireAuth, async (request, response, next) => {
  try {
    const section = String(request.body.section ?? '')
    if (!allowedSections.has(section)) return response.status(400).json({ error: 'Unknown application section.' })

    const result = await awardUniqueEvent(request.user.id, {
      key: `section:${section}`,
      type: 'section_view',
      section,
      points: 10,
    })
    return response.json({ awarded: result.awarded, points: result.user.points, progress: result.user.progress })
  } catch (error) {
    return next(error)
  }
})

router.post('/quiz-correct', requireAuth, async (request, response, next) => {
  try {
    const quizId = String(request.body.quizId ?? '')
    const questionId = String(request.body.questionId ?? '').slice(0, 160)
    const answer = String(request.body.answer ?? '')
    const correctAnswer = quizAnswers.get(`${quizId}:${questionId}`)
    if (!correctAnswer) return response.status(400).json({ error: 'Unknown quiz question.' })
    if (answer !== correctAnswer) return response.status(400).json({ error: 'Points are only awarded for correct answers.' })

    const result = await awardUniqueEvent(request.user.id, {
      key: `quiz:${quizId}:${questionId}`,
      type: 'quiz_correct',
      section: quizId,
      points: 20,
    })
    return response.json({ awarded: result.awarded, points: result.user.points, progress: result.user.progress })
  } catch (error) {
    return next(error)
  }
})

router.post('/explore', requireAuth, async (request, response, next) => {
  try {
    const section = String(request.body.section ?? '')
    const item = String(request.body.item ?? '').toLowerCase()
    const kind = request.body.kind === 'action' ? 'action' : 'view'
    if (!allowedSections.has(section) || !/^[a-z0-9][a-z0-9:_-]{0,99}$/.test(item)) {
      return response.status(400).json({ error: 'Unknown exploration achievement.' })
    }

    const explorationCount = request.user.progress.filter(
      (event) => event.type === 'exploration' && event.section === section,
    ).length
    if (explorationCount >= 150) {
      return response.json({ awarded: 0, points: request.user.points, progress: request.user.progress })
    }

    const points = kind === 'action' ? 3 : 2
    const result = await awardUniqueEvent(request.user.id, {
      key: `explore:${section}:${kind}:${item}`,
      type: 'exploration',
      section,
      points,
    })
    return response.json({ awarded: result.awarded, points: result.user.points, progress: result.user.progress })
  } catch (error) {
    return next(error)
  }
})

router.post('/mesa-round', requireAuth, async (request, response, next) => {
  try {
    const round = Number.parseInt(request.body.round, 10)
    const score = Number.parseInt(request.body.score, 10)
    if (!Number.isInteger(round) || round < 1 || round > 1000 || !Number.isInteger(score) || score < 100 || score > 20_000 || score % 100 !== 0) {
      return response.status(400).json({ error: 'Invalid MESA round result.' })
    }

    const result = await awardUniqueEvent(request.user.id, {
      key: `mesa:round:${round}`,
      type: 'mesa_round',
      section: 'mesa-breaker',
      points: score,
    })
    return response.json({ awarded: result.awarded, points: result.user.points, progress: result.user.progress })
  } catch (error) {
    return next(error)
  }
})

export default router
