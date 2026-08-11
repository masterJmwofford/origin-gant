import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser(user) {
  const displayName = user.displayName || user.name || user.email?.split('@')[0] || 'Member'
  return {
    id: user.id,
    displayName,
    email: user.email,
    points: user.points ?? 0,
    progress: user.progress ?? [],
    profileImage: user.profileImage ?? '',
    createdAt: user.createdAt,
  }
}

function setSession(response, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
  response.cookie('lyceum_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

router.post('/signup', async (request, response, next) => {
  try {
    const displayName = String(request.body.displayName ?? '').trim()
    const email = String(request.body.email ?? '').trim().toLowerCase()
    const password = String(request.body.password ?? '')

    if (displayName.length < 2) return response.status(400).json({ error: 'Name must be at least 2 characters.' })
    if (!emailPattern.test(email)) return response.status(400).json({ error: 'Enter a valid email address.' })
    if (password.length < 8) return response.status(400).json({ error: 'Password must be at least 8 characters.' })
    if (await User.exists({ email })) return response.status(409).json({ error: 'An account already uses that email.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ displayName, email, passwordHash })
    setSession(response, user.id)
    return response.status(201).json({ user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/login', async (request, response, next) => {
  try {
    const email = String(request.body.email ?? '').trim().toLowerCase()
    const password = String(request.body.password ?? '')
    const user = await User.findOne({ email }).select('+passwordHash +profileImage')

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ error: 'Email or password is incorrect.' })
    }

    if (!user.displayName) {
      user.displayName = user.name || user.email.split('@')[0] || 'Member'
      await user.save()
    }

    setSession(response, user.id)
    return response.json({ user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', (_request, response) => {
  response.clearCookie('lyceum_token', { httpOnly: true, sameSite: 'lax' })
  return response.json({ success: true })
})

router.get('/me', requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.user.id).select('+profileImage')
    if (!user.displayName) {
      user.displayName = user.name || user.email?.split('@')[0] || 'Member'
      await user.save()
    }
    response.json({ user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

router.patch('/profile-image', requireAuth, async (request, response, next) => {
  try {
    const profileImage = String(request.body.profileImage ?? '')
    const isSupportedImage = /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(profileImage)
    if (!isSupportedImage || profileImage.length > 400_000) {
      return response.status(400).json({ error: 'Upload a JPG, PNG, or WebP profile image under 5 MB.' })
    }

    const user = await User.findByIdAndUpdate(
      request.user.id,
      { profileImage },
      { new: true, runValidators: true },
    ).select('+profileImage')
    return response.json({ user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

export default router
