import { useState } from 'react'

const bucketLabels = {
  subscriber: 'Subscriber Paid',
  shared: 'Both',
  agency: 'Agency Paid',
}

function FactList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function AccountRoadmap({ roadmap }) {
  const [activeBucket, setActiveBucket] = useState('shared')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [selectedBucket, setSelectedBucket] = useState('')
  const [completedCards, setCompletedCards] = useState(0)
  const active = roadmap.buckets[activeBucket]
  const currentCard = roadmap.sortingCards[currentCardIndex]
  const isAnswered = selectedBucket !== ''
  const isCorrect = selectedBucket === currentCard.bucket

  function chooseBucket(bucket) {
    if (isAnswered) return
    setSelectedBucket(bucket)

    if (bucket === currentCard.bucket) {
      setCompletedCards((count) => count + 1)
    }
  }

  function nextCard() {
    setSelectedBucket('')
    setCurrentCardIndex((index) => (index + 1) % roadmap.sortingCards.length)
  }

  return (
    <div className="account-roadmap">
      <div className="billing-guide-intro">
        <p>{roadmap.sourceNote}</p>
      </div>

      <section className="roadmap-venn-panel">
        <div className="roadmap-venn">
          <button
            className={`venn-circle venn-subscriber ${
              activeBucket === 'subscriber' ? 'active' : ''
            }`}
            type="button"
            onClick={() => setActiveBucket('subscriber')}
          >
            <span>Subscriber Paid</span>
          </button>
          <button
            className={`venn-circle venn-agency ${activeBucket === 'agency' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveBucket('agency')}
          >
            <span>Agency Paid</span>
          </button>
          <button
            className={`venn-overlap ${activeBucket === 'shared' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveBucket('shared')}
          >
            Both
          </button>
        </div>

        <article className="roadmap-detail">
          <p className="eyebrow">Selected Path</p>
          <h3>{active.title}</h3>
          <p className="roadmap-subtitle">{active.subtitle}</p>
          <p>{active.summary}</p>
          <div className="roadmap-chip-row">
            {active.plans.map((plan) => (
              <span className="roadmap-chip" key={plan}>
                {plan}
              </span>
            ))}
          </div>
          <FactList items={active.facts} />
        </article>
      </section>

      <section className="roadmap-decision-grid">
        {roadmap.decisionSteps.map((step) => (
          <article className="decision-card" key={step.question}>
            <h4>{step.question}</h4>
            <div className="decision-columns">
              <div>
                <strong>Subscriber Paid</strong>
                <p>{step.subscriber}</p>
              </div>
              <div>
                <strong>Agency Paid</strong>
                <p>{step.agency}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="sort-activity">
        <div>
          <p className="eyebrow">Sort Activity</p>
          <h3>Place the scenario in the right part of the Venn diagram</h3>
          <p className="sort-progress">
            Correct this round: {completedCards} of {roadmap.sortingCards.length}
          </p>
        </div>

        <article className="scenario-card">
          <p>{currentCard.text}</p>
        </article>

        <div className="sort-buttons">
          {Object.entries(bucketLabels).map(([bucket, label]) => (
            <button
              className={`sort-button ${selectedBucket === bucket ? 'selected' : ''}`}
              key={bucket}
              type="button"
              onClick={() => chooseBucket(bucket)}
            >
              {label}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className={`sort-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <strong>{isCorrect ? 'Correct.' : `Correct answer: ${bucketLabels[currentCard.bucket]}.`}</strong>
            <p>{currentCard.explanation}</p>
            <button className="primary" type="button" onClick={nextCard}>
              Next scenario
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
