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
  const [previewOptionIndex, setPreviewOptionIndex] = useState(0)
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
  const previewOption = shuffledOptions[previewOptionIndex]

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
    setPreviewOptionIndex(0)
    setScenarioIndex((index) => pickRandomIndex(game.scenarios.length, index))
  }

  function showPreviousOption() {
    if (answered) return

    setPreviewOptionIndex((index) => (index === 0 ? shuffledOptions.length - 1 : index - 1))
  }

  function showNextOption() {
    if (answered) return

    setPreviewOptionIndex((index) => (index === shuffledOptions.length - 1 ? 0 : index + 1))
  }

  function chooseOption(index) {
    if (answered) return

    setPreviewOptionIndex(index)
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

          <div className={`drop-zone ${answered ? 'answered' : ''}`}>
            <strong>
              {answered ? selectedOption.title : `Previewing: ${previewOption.title}`}
            </strong>
            <p>
              {answered
                ? selectedOption.detail
                : 'Toggle through the self-service options, compare the detail to the customer clue, then lock in the best match.'}
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
          <article className="sso-option-preview">
            <div className="sso-option-preview-top">
              <button type="button" onClick={showPreviousOption} disabled={answered} aria-label="Show previous option">
                Previous
              </button>
              <span>
                {previewOptionIndex + 1} / {shuffledOptions.length}
              </span>
              <button type="button" onClick={showNextOption} disabled={answered} aria-label="Show next option">
                Next
              </button>
            </div>
            <div className="sso-option-preview-card">
              <strong>{previewOption.title}</strong>
              <p>{previewOption.detail}</p>
            </div>
            <button className="primary sso-lock-button" type="button" onClick={() => answer(previewOption.id)} disabled={answered}>
              Lock in match
            </button>
          </article>
          <div className="sso-options">
            {shuffledOptions.map((option, index) => (
              <button
                className={`sso-option ${
                  previewOptionIndex === index || selectedOptionId === option.id ? 'selected' : ''
                }`}
                key={option.id}
                type="button"
                onClick={() => chooseOption(index)}
                disabled={answered}
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
