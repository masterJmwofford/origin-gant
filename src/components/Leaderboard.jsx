import { useEffect, useState } from 'react'
import { apiRequest, useAuth } from '../context/AuthContext'

export default function Leaderboard({ onOpenAccount }) {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      return undefined
    }

    let active = true
    apiRequest('/api/leaderboard')
      .then((data) => {
        if (active) setLeaders(data.leaderboard)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [user, user?.points])

  return (
    <section className="leaderboard" aria-labelledby="leaderboard-title">
      <div className="leaderboard-heading">
        <div><p className="eyebrow">Member rankings</p><h2 id="leaderboard-title">Lyceum Leaderboard</h2></div>
        {user && <span className="leaderboard-score">Your score: <strong>{user.points}</strong></span>}
      </div>
      {!user ? (
        <div className="leaderboard-signin"><p>Log in to earn points and compare progress with other members.</p><button type="button" onClick={onOpenAccount}>Log in or sign up</button></div>
      ) : error ? (
        <p className="account-error">{error}</p>
      ) : leaders.length === 0 ? (
        <p>Leaderboard results are loading.</p>
      ) : (
        <ol className="leaderboard-list">
          {leaders.slice(0, 10).map((leader) => (
            <li className={leader.id === user.id ? 'current-member' : ''} key={leader.id}>
              <span className="leader-rank">#{leader.rank}</span>
              <span className="leader-avatar" aria-hidden="true">{leader.displayName.slice(0, 1).toUpperCase()}</span>
              <strong>{leader.displayName}</strong>
              <span>{leader.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
