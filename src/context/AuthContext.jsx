/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

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
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiRequest('/api/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) setUser(null)
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
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (details) => {
    const data = await apiRequest('/api/auth/signup', { method: 'POST', body: JSON.stringify(details) })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' })
    setUser(null)
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

  const value = useMemo(
    () => ({ user, authLoading, login, signup, logout, awardSection, awardQuiz }),
    [authLoading, awardQuiz, awardSection, login, logout, signup, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}

export { apiRequest }
