import { useEffect, useState } from 'react'

export default function AdminLock({ children }) {
  const [status, setStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/admin-lock/status', { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => setStatus(data.unlocked ? 'unlocked' : 'locked'))
      .catch(() => setStatus('locked'))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin-lock/unlock', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'The app could not be unlocked.')
      setStatus('unlocked')
      setPassword('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'unlocked') return children

  if (status === 'checking') {
    return (
      <main className="auth-loading" aria-live="polite">
        <div className="auth-loading-mark" aria-hidden="true">L</div>
        <strong>Checking access…</strong>
      </main>
    )
  }

  return (
    <main className="admin-lock">
      <form className="admin-lock-card" onSubmit={handleSubmit}>
        <div className="admin-lock-icon" aria-hidden="true">L</div>
        <p className="eyebrow">Private workspace</p>
        <h1>Admin access</h1>
        <p>This app is locked. Enter the owner password to continue.</p>
        <label htmlFor="admin-password">Admin password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          autoFocus
          required
        />
        {error && <p className="admin-lock-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Unlocking…' : 'Unlock app'}
        </button>
      </form>
    </main>
  )
}
