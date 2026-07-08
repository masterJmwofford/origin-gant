import { useMemo, useState } from 'react'

function pickRandomIndex(length, currentIndex = -1) {
  if (length <= 1) return 0

  let nextIndex = Math.floor(Math.random() * length)

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length)
  }

  return nextIndex
}

export default function SelfServiceGame({ game }) {
  const [scenarioIndex, setScenarioIndex] = useState(() => pickRandomIndex(game.scenarios.length))
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [draggedOptionId, setDraggedOptionId] = useState('')
  const [score, setScore] = useState(0)
  const [turns, setTurns] = useState(0)
  const scenario = game.scenarios[scenarioIndex]
  const correctOption = game.options.find((option) => option.id === scenario.answerId)
  const selectedOption = game.options.find((option) => option.id === selectedOptionId)
  const answered = selectedOptionId !== ''
  const isCorrect = selectedOptionId === scenario.answerId
  const shuffledOptions = useMemo(
    () => [...game.options].sort((a, b) => a.title.localeCompare(b.title)),
    [game.options],
  )

  function answer(optionId) {
    if (answered) return

    setSelectedOptionId(optionId)
    setTurns((count) => count + 1)

    if (optionId === scenario.answerId) {
      setScore((count) => count + 1)
    }
  }

  function nextScenario() {
    setSelectedOptionId('')
    setDraggedOptionId('')
    setScenarioIndex((index) => pickRandomIndex(game.scenarios.length, index))
  }

  function dropOption(event) {
    event.preventDefault()

    if (draggedOptionId) {
      answer(draggedOptionId)
    }
  }

  return (
    <div className="sso-game">
      <div className="billing-guide-intro">
        <p>{game.sourceNote}</p>
      </div>

      <section className="sso-game-board">
        <div className="sso-scenario-panel">
          <div className="sso-scorebar">
            <span>Scenario {turns + 1}</span>
            <span>
              Score {score}/{turns}
            </span>
          </div>

          <article className="sso-customer-card">
            <p className="eyebrow">Customer Scenario</p>
            <h3>{scenario.customer}</h3>
            <p>{scenario.clue}</p>
          </article>

          <div
            className={`drop-zone ${answered ? 'answered' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropOption}
          >
            <strong>{answered ? selectedOption.title : 'Drop the best self-service option here'}</strong>
            <p>
              {answered
                ? selectedOption.detail
                : 'You can also click an option card below if drag-and-drop is awkward on your device.'}
            </p>
          </div>

          {answered && (
            <div className={`sort-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              <strong>{isCorrect ? 'Correct.' : `Best match: ${correctOption.title}.`}</strong>
              {!isCorrect && <p>{correctOption.detail}</p>}
              <button className="primary" type="button" onClick={nextScenario}>
                New random scenario
              </button>
            </div>
          )}
        </div>

        <div className="sso-option-panel">
          <p className="eyebrow">Self-Service Options</p>
          <div className="sso-options">
            {shuffledOptions.map((option) => (
              <button
                className={`sso-option ${selectedOptionId === option.id ? 'selected' : ''}`}
                draggable={!answered}
                key={option.id}
                type="button"
                onClick={() => answer(option.id)}
                onDragStart={() => setDraggedOptionId(option.id)}
              >
                <strong>{option.title}</strong>
                <span>{option.detail}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
