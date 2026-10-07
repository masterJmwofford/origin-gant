/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const guestStorageKey = 'lyceum_guest'

function getStoredGuest() {
  try {
    const displayName = sessionStorage.getItem(guestStorageKey)?.trim()
    return displayName
      ? { id: null, displayName, email: '', points: 0, progress: [], profileImage: '', isGuest: true }
      : null
  } catch {
    return null
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.')
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredGuest())
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiRequest('/api/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) setUser((current) => current?.isGuest ? current : null)
      })
      .finally(() => {
        if (active) setAuthLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
    sessionStorage.removeItem(guestStorageKey)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (details) => {
    const data = await apiRequest('/api/auth/signup', { method: 'POST', body: JSON.stringify(details) })
    sessionStorage.removeItem(guestStorageKey)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    if (!user?.isGuest) await apiRequest('/api/auth/logout', { method: 'POST' })
    sessionStorage.removeItem(guestStorageKey)
    setUser(null)
  }, [user?.isGuest])

  const loginAsGuest = useCallback((displayName) => {
    const guestName = String(displayName ?? '').trim()
    if (guestName.length < 2) throw new Error('Guest name must be at least 2 characters.')
    if (guestName.length > 50) throw new Error('Guest name must be 50 characters or fewer.')
    sessionStorage.setItem(guestStorageKey, guestName)
    const guest = {
      id: null,
      displayName: guestName,
      email: '',
      points: 0,
      progress: [],
      profileImage: '',
      isGuest: true,
    }
    setUser(guest)
    return guest
  }, [])

  const syncProgress = useCallback((data) => {
    setUser((current) =>
      current ? { ...current, points: data.points, progress: data.progress } : current,
    )
    return data
  }, [])

  const awardSection = useCallback(async (section) => {
    const data = await apiRequest('/api/progress/section-view', {
      method: 'POST',
      body: JSON.stringify({ section }),
    })
    return syncProgress(data)
  }, [syncProgress])

  const awardQuiz = useCallback(async (quizId, questionId, answer) => {
    const data = await apiRequest('/api/progress/quiz-correct', {
      method: 'POST',
      body: JSON.stringify({ quizId, questionId, answer }),
    })
    return syncProgress(data)
  }, [syncProgress])

  const awardExploration = useCallback(async (section, item, kind = 'view') => {
    const data = await apiRequest('/api/progress/explore', {
      method: 'POST',
      body: JSON.stringify({ section, item, kind }),
    })
    return syncProgress(data)
  }, [syncProgress])

  const awardMesaRound = useCallback(async (round, score) => {
    const data = await apiRequest('/api/progress/mesa-round', {
      method: 'POST',
      body: JSON.stringify({ round, score }),
    })
    return syncProgress(data)
  }, [syncProgress])

  const uploadProfileImage = useCallback(async (profileImage) => {
    const data = await apiRequest('/api/auth/profile-image', {
      method: 'PATCH',
      body: JSON.stringify({ profileImage }),
    })
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      authLoading,
      login,
      signup,
      logout,
      loginAsGuest,
      awardSection,
      awardQuiz,
      awardExploration,
      awardMesaRound,
      uploadProfileImage,
    }),
    [
      authLoading,
      awardExploration,
      awardMesaRound,
      awardQuiz,
      awardSection,
      login,
      loginAsGuest,
      logout,
      signup,
      uploadProfileImage,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}

export { apiRequest }
