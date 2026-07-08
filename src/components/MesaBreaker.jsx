import { useEffect, useMemo, useState } from 'react'

const GAME_WIDTH = 760
const GAME_HEIGHT = 460
const OWL_WIDTH = 78
const BRICK_WIDTH = 18
const BRICK_HEIGHT = 12
const BRICK_GAP = 4
const LASER_HEIGHT = 34
const LASER_WIDTH = 12
const OWL_AVI = 'https://i.pinimg.com/originals/a2/7c/76/a27c768c469972cec4cd4b1500a13c23.gif'

const letterMap = {
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  S: ['11111', '10000', '10000', '11111', '00001', '00001', '11111'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
}

function createMesaBricks() {
  const letters = ['M', 'E', 'S', 'A']
  const columnsPerLetter = 5
  const letterGap = 2
  const totalColumns = letters.length * columnsPerLetter + (letters.length - 1) * letterGap
  const startX = (GAME_WIDTH - totalColumns * (BRICK_WIDTH + BRICK_GAP)) / 2
  const startY = 48
  const bricks = []

  letters.forEach((letter, letterIndex) => {
    const pattern = letterMap[letter]
    const offsetColumns = letterIndex * (columnsPerLetter + letterGap)

    pattern.forEach((row, rowIndex) => {
      row.split('').forEach((cell, columnIndex) => {
        if (cell !== '1') return

        bricks.push({
          id: `${letter}-${rowIndex}-${columnIndex}`,
          letter,
          x: startX + (offsetColumns + columnIndex) * (BRICK_WIDTH + BRICK_GAP),
          y: startY + rowIndex * (BRICK_HEIGHT + BRICK_GAP),
        })
      })
    })
  })

  return bricks
}

function createInitialGame(round = 1) {
  return {
    bricks: createMesaBricks(),
    lasers: [],
    owlX: GAME_WIDTH / 2 - OWL_WIDTH / 2,
    score: 0,
    round,
    won: false,
  }
}

function laserHitsBrick(laser, brick) {
  return (
    laser.x < brick.x + BRICK_WIDTH &&
    laser.x + LASER_WIDTH > brick.x &&
    laser.y < brick.y + BRICK_HEIGHT &&
    laser.y + LASER_HEIGHT > brick.y
  )
}

export default function MesaBreaker() {
  const [game, setGame] = useState(() => createInitialGame())
  const progress = useMemo(() => {
    const total = createMesaBricks().length
    return Math.round(((total - game.bricks.length) / total) * 100)
  }, [game.bricks.length])

  function moveOwl(direction) {
    setGame((current) => ({
      ...current,
      owlX: Math.min(
        GAME_WIDTH - OWL_WIDTH - 16,
        Math.max(16, current.owlX + direction * 36),
      ),
    }))
  }

  function fireCore() {
    setGame((current) => {
      if (current.won) return current

      return {
        ...current,
        lasers: [
          ...current.lasers,
          {
            id: crypto.randomUUID(),
            x: current.owlX + OWL_WIDTH / 2 - LASER_WIDTH / 2,
            y: GAME_HEIGHT - 112,
          },
        ],
      }
    })
  }

  function resetGame() {
    setGame((current) => createInitialGame(current.round + 1))
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        moveOwl(-1)
      }

      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        moveOwl(1)
      }

      if (event.key === ' ' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        event.preventDefault()
        fireCore()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const animation = window.setInterval(() => {
      setGame((current) => {
        if (current.won) return current

        const movedLasers = current.lasers
          .map((laser) => ({ ...laser, y: laser.y - 16 }))
          .filter((laser) => laser.y > -LASER_HEIGHT)
        const hitBrickIds = new Set()
        const usedLaserIds = new Set()

        movedLasers.forEach((laser) => {
          const brick = current.bricks.find(
            (candidate) => !hitBrickIds.has(candidate.id) && laserHitsBrick(laser, candidate),
          )

          if (brick) {
            hitBrickIds.add(brick.id)
            usedLaserIds.add(laser.id)
          }
        })

        const remainingBricks = current.bricks.filter((brick) => !hitBrickIds.has(brick.id))
        const won = remainingBricks.length === 0

        return {
          ...current,
          bricks: remainingBricks,
          lasers: movedLasers.filter((laser) => !usedLaserIds.has(laser.id)),
          score: current.score + hitBrickIds.size * 100,
          won,
        }
      })
    }, 45)

    return () => window.clearInterval(animation)
  }, [])

  useEffect(() => {
    if (!game.won) return undefined

    const resetTimer = window.setTimeout(() => {
      resetGame()
    }, 2400)

    return () => window.clearTimeout(resetTimer)
  }, [game.won])

  return (
    <div className="mesa-breaker">
      <section className="mesa-info">
        <div>
          <p className="eyebrow">MESA Breaker</p>
          <h2>Blast the MESA bricks with CORE shots</h2>
          <p>
            Move the owl with arrow keys or A/D. Fire with Space, W, Arrow Up, or the CORE
            button. Clear every brick to reset the board.
          </p>
        </div>
        <div className="mesa-stats">
          <span>Score: {game.score}</span>
          <span>Round: {game.round}</span>
          <span>Cleared: {progress}%</span>
        </div>
      </section>

      <section className="mesa-stage-wrap">
        <div
          className="mesa-stage"
          style={{
            '--game-width': `${GAME_WIDTH}px`,
            '--game-height': `${GAME_HEIGHT}px`,
          }}
        >
          <div className="mesa-stars" />

          {game.bricks.map((brick) => (
            <span
              className={`mesa-brick brick-${brick.letter.toLowerCase()}`}
              key={brick.id}
              style={{
                left: `${brick.x}px`,
                top: `${brick.y}px`,
              }}
            />
          ))}

          {game.lasers.map((laser) => (
            <span
              className="core-laser"
              key={laser.id}
              style={{
                left: `${laser.x}px`,
                top: `${laser.y}px`,
              }}
            >
              CORE
            </span>
          ))}

          <img
            className="mesa-owl"
            src={OWL_AVI}
            alt="Owl avatar ship"
            draggable="false"
            style={{ left: `${game.owlX}px` }}
          />

          {game.won && (
            <div className="mesa-win">
              <strong>MESA cleared.</strong>
              <span>Resetting the board...</span>
            </div>
          )}
        </div>
      </section>

      <div className="mesa-controls" aria-label="MESA Breaker controls">
        <button type="button" onClick={() => moveOwl(-1)}>
          Left
        </button>
        <button className="core-button" type="button" onClick={fireCore}>
          Fire CORE
        </button>
        <button type="button" onClick={() => moveOwl(1)}>
          Right
        </button>
        <button type="button" onClick={resetGame}>
          Reset
        </button>
      </div>
    </div>
  )
}
