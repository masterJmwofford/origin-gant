import { useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Leaderboard from './Leaderboard'

function prepareProfileImage(file) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5_000_000) {
      reject(new Error('Choose a JPG, PNG, or WebP image smaller than 5 MB.'))
      return
    }

    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      const size = Math.min(image.naturalWidth, image.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 320
      const context = canvas.getContext('2d')
      context.drawImage(
        image,
        (image.naturalWidth - size) / 2,
        (image.naturalHeight - size) / 2,
        size,
        size,
        0,
        0,
        320,
        320,
      )
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.84))
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('That image could not be processed.'))
    }
    image.src = objectUrl
  })
}

export default function AccountPanel({ onClose, required = false }) {
  const { user, login, signup, logout, uploadProfileImage } = useAuth()
  const [mode, setMode] = useState('login')
  const [profileView, setProfileView] = useState('profile')
  const [form, setForm] = useState({ displayName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const memberName = user?.displayName || user?.email?.split('@')[0] || 'Member'
  const achievements = useMemo(() => {
    const events = user?.progress ?? []
    return {
      sections: events.filter((event) => event.type === 'section_view').length,
      quiz: events.filter((event) => event.type === 'quiz_correct').length,
      exploration: events.filter((event) => event.type === 'exploration').length,
      mesa: events.filter((event) => event.type === 'mesa_round').length,
    }
  }, [user?.progress])
  const recentAchievements = [...(user?.progress ?? [])].slice(-5).reverse()
  const level = Math.floor((user?.points ?? 0) / 500) + 1
  const levelProgress = ((user?.points ?? 0) % 500) / 5

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

  async function chooseProfileImage(event) {
    const [file] = event.target.files
    if (!file) return
    setSubmitting(true)
    setError('')
    try {
      const profileImage = await prepareProfileImage(file)
      await uploadProfileImage(profileImage)
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      event.target.value = ''
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
      <section className={`account-panel ${profileView === 'leaderboard' ? 'leaderboard-open' : ''}`}>
        {!required && (
          <button className="account-close" type="button" onClick={onClose} aria-label="Close account panel">×</button>
        )}
        {user ? (
          <>
            <div className="profile-view-tabs" role="tablist" aria-label="Profile pages">
              <button className={profileView === 'profile' ? 'active' : ''} type="button" onClick={() => setProfileView('profile')}>My profile</button>
              <button className={profileView === 'leaderboard' ? 'active' : ''} type="button" onClick={() => setProfileView('leaderboard')}>Leaderboard</button>
            </div>
            {profileView === 'leaderboard' ? (
              <Leaderboard />
            ) : (
              <>
                <div className="profile-identity">
                  <button className="profile-photo-button" type="button" onClick={() => fileInputRef.current?.click()} disabled={submitting} aria-label="Upload profile picture">
                    {user.profileImage ? <img src={user.profileImage} alt="" /> : <span>{memberName.charAt(0).toUpperCase()}</span>}
                    <small>{submitting ? 'Uploading…' : 'Change photo'}</small>
                  </button>
                  <input ref={fileInputRef} className="profile-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseProfileImage} />
                  <div><p className="eyebrow">Member profile</p><h2 id="account-title">{memberName}</h2><p className="account-email">{user.email}</p></div>
                </div>
                <div className="member-level">
                  <div><strong>Level {level}</strong><span>{user.points ?? 0} total points</span></div>
                  <div className="member-level-track"><span style={{ width: `${levelProgress}%` }} /></div>
                  <small>{500 - ((user.points ?? 0) % 500)} points to Level {level + 1}</small>
                </div>
                <div className="account-stats robust">
                  <article><strong>{achievements.sections}</strong><span>Sections explored</span></article>
                  <article><strong>{achievements.exploration}</strong><span>Details discovered</span></article>
                  <article><strong>{achievements.quiz}</strong><span>Quiz answers</span></article>
                  <article><strong>{achievements.mesa}</strong><span>MESA rounds</span></article>
                </div>
                {recentAchievements.length > 0 && (
                  <section className="recent-achievements">
                    <h3>Recent achievements</h3>
                    <ul>
                      {recentAchievements.map((achievement) => (
                        <li key={achievement.key}>
                          <span>{achievement.type.replaceAll('_', ' ')}</span>
                          <strong>+{achievement.points}</strong>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {error && <p className="account-error" role="alert">{error}</p>}
                <button className="account-submit secondary" type="button" onClick={signOut} disabled={submitting}>Log out</button>
              </>
            )}
          </>
        ) : (
          <>
            <p className="eyebrow">Lyceum membership</p>
            <h2 id="account-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p>{required ? 'Log in or create an account to access the Lyceum learning workspace.' : 'Sign in to save progress, earn points, and join the leaderboard.'}</p>
            <div className="account-mode-tabs">
              <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Log in</button>
              <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>Sign up</button>
            </div>
            <form className="account-form" onSubmit={submit}>
              {mode === 'signup' && <label>Display name<input type="text" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} autoComplete="name" required minLength={2} /></label>}
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
