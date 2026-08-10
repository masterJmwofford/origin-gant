import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AccountPanel({ onClose, required = false }) {
  const { user, login, signup, logout } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ displayName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (mode === 'signup') await signup(form)
      else await login({ email: form.email, password: form.password })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function signOut() {
    setSubmitting(true)
    try {
      await logout()
      onClose?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`account-overlay ${required ? 'account-required' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-title"
    >
      <section className="account-panel">
        {!required && (
          <button className="account-close" type="button" onClick={onClose} aria-label="Close account panel">
            ×
          </button>
        )}
        {user ? (
          <>
            <div className="account-avatar" aria-hidden="true">{user.displayName.slice(0, 1).toUpperCase()}</div>
            <p className="eyebrow">Member profile</p>
            <h2 id="account-title">{user.displayName}</h2>
            <p className="account-email">{user.email}</p>
            <div className="account-stats">
              <article><strong>{user.points}</strong><span>Total points</span></article>
              <article><strong>{user.progress?.length ?? 0}</strong><span>Achievements</span></article>
            </div>
            {error && <p className="account-error" role="alert">{error}</p>}
            <button className="account-submit secondary" type="button" onClick={signOut} disabled={submitting}>
              Log out
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">Lyceum membership</p>
            <h2 id="account-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p>
              {required
                ? 'Log in or create an account to access the Lyceum learning workspace.'
                : 'Sign in to save progress, earn points, and join the leaderboard.'}
            </p>
            <div className="account-mode-tabs">
              <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Log in</button>
              <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>Sign up</button>
            </div>
            <form className="account-form" onSubmit={submit}>
              {mode === 'signup' && (
                <label>Display name<input type="text" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} autoComplete="name" required minLength={2} /></label>
              )}
              <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></label>
              <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} /></label>
              {error && <p className="account-error" role="alert">{error}</p>}
              <button className="account-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
