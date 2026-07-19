import { useEffect, useMemo, useRef, useState } from 'react'

const GAME_WIDTH = 760
const GAME_HEIGHT = 460
const LAUNCHER_WIDTH = 78
const BRICK_WIDTH = 18
const BRICK_HEIGHT = 12
const BRICK_GAP = 4
const LASER_HEIGHT = 34
const LASER_WIDTH = 12
const BRICK_DRIFT_LIMIT = 46
const BRICK_DRIFT_SPEED = 2
const BRICK_BOB_AMOUNT = 10

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
    launcherX: GAME_WIDTH / 2 - LAUNCHER_WIDTH / 2,
    brickOffsetX: 0,
    brickOffsetY: 0,
    brickDirection: 1,
    tick: 0,
    score: 0,
    round,
    won: false,
  }
}

function laserHitsBrick(laser, brick, offsetX, offsetY) {
  const brickX = brick.x + offsetX
  const brickY = brick.y + offsetY

  return (
    laser.x < brickX + BRICK_WIDTH &&
    laser.x + LASER_WIDTH > brickX &&
    laser.y < brickY + BRICK_HEIGHT &&
    laser.y + LASER_HEIGHT > brickY
  )
}

export default function MesaBreaker() {
  const [game, setGame] = useState(() => createInitialGame())
  const [stageScale, setStageScale] = useState(1)
  const stageWrapRef = useRef(null)
  const progress = useMemo(() => {
    const total = createMesaBricks().length
    return Math.round(((total - game.bricks.length) / total) * 100)
  }, [game.bricks.length])

  useEffect(() => {
    function updateScale() {
      if (!stageWrapRef.current) return

      const availableWidth = stageWrapRef.current.clientWidth
      setStageScale(Math.min(1, availableWidth / GAME_WIDTH))
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)

    if (stageWrapRef.current) {
      observer.observe(stageWrapRef.current)
    }

    window.addEventListener('resize', updateScale)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [])

  function moveLauncher(direction) {
    setGame((current) => ({
      ...current,
      launcherX: Math.min(
        GAME_WIDTH - LAUNCHER_WIDTH - 16,
        Math.max(16, current.launcherX + direction * 36),
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
            x: current.launcherX + LAUNCHER_WIDTH / 2 - LASER_WIDTH / 2,
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
        moveLauncher(-1)
      }

      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        moveLauncher(1)
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

        const nextTick = current.tick + 1
        let nextDirection = current.brickDirection
        let nextOffsetX = current.brickOffsetX + current.brickDirection * BRICK_DRIFT_SPEED

        if (Math.abs(nextOffsetX) >= BRICK_DRIFT_LIMIT) {
          nextDirection = current.brickDirection * -1
          nextOffsetX = current.brickOffsetX + nextDirection * BRICK_DRIFT_SPEED
        }

        const nextOffsetY = Math.sin(nextTick / 13) * BRICK_BOB_AMOUNT
        const movedLasers = current.lasers
          .map((laser) => ({ ...laser, y: laser.y - 16 }))
          .filter((laser) => laser.y > -LASER_HEIGHT)
        const hitBrickIds = new Set()
        const usedLaserIds = new Set()

        movedLasers.forEach((laser) => {
          const brick = current.bricks.find(
            (candidate) =>
              !hitBrickIds.has(candidate.id) &&
              laserHitsBrick(laser, candidate, nextOffsetX, nextOffsetY),
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
          brickOffsetX: nextOffsetX,
          brickOffsetY: nextOffsetY,
          brickDirection: nextDirection,
          tick: nextTick,
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
            Move the launcher with arrow keys or A/D. Fire with Space, W, Arrow Up, or the CORE
            button. Clear every brick to reset the board.
          </p>
        </div>
        <div className="mesa-stats">
          <span>Score: {game.score}</span>
          <span>Round: {game.round}</span>
          <span>Cleared: {progress}%</span>
        </div>
      </section>

      <section
        className="mesa-stage-wrap"
        ref={stageWrapRef}
        style={{ '--stage-scale': stageScale, '--scaled-game-height': `${GAME_HEIGHT * stageScale}px` }}
      >
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
                transform: `translate(${game.brickOffsetX}px, ${game.brickOffsetY}px)`,
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

          <div
            aria-label="CORE launcher"
            className="mesa-launcher"
            role="img"
            style={{ left: `${game.launcherX}px` }}
          >
            <span />
          </div>

          {game.won && (
            <div className="mesa-win">
              <strong>MESA cleared.</strong>
              <span>Resetting the board...</span>
            </div>
          )}
        </div>
      </section>

      <div className="mesa-controls" aria-label="MESA Breaker controls">
        <button type="button" onClick={() => moveLauncher(-1)}>
          Left
        </button>
        <button className="core-button" type="button" onClick={fireCore}>
          Fire CORE
        </button>
        <button type="button" onClick={() => moveLauncher(1)}>
          Right
        </button>
        <button type="button" onClick={resetGame}>
          Reset
        </button>
      </div>
    </div>
  )
}
