import { useState } from 'react'

import './App.css'
import AccountRoadmap from './components/AccountRoadmap'
import BillingEligibilityGuide from './components/BillingEligibilityGuide'
import DashBoard from './components/DashBoard.jsx'
import FlashCardGrid from './components/FlashCardGrid'
import Plans from './components/Plans'
import Quiz from './components/Quiz'
import Search from './components/Search'
import {
  accountRoadmap,
  billingEligibilityGuide,
  billingEligibilityQuiz,
  quizQuestions,
  sources,
  studyNotes,
  terms,
} from './data/studyGuide'

function matchesSearch(item, query) {
  return JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
}

function App() {
  const [query, setQuery] = useState('')

  const filteredTerms = terms.filter((term) => matchesSearch(term, query))
  const filteredPlans = studyNotes.filter((plan) => matchesSearch(plan, query))
  const filteredQuestions = quizQuestions.filter((question) => matchesSearch(question, query))
  const visibleQuestions = filteredQuestions.length > 0 ? filteredQuestions : quizQuestions
  const stats = [
    {
      label: 'Terms',
      value: filteredTerms.length,
      description: 'Flashcards available from your current search.',
    },
    {
      label: 'Study Notes',
      value: filteredPlans.length,
      description: 'Expandable plan and activation topics.',
    },
    {
      label: 'Quiz Items',
      value: visibleQuestions.length,
      description: 'Practice questions ready for review.',
    },
  ]

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">FirstNet study guide</p>
          <h1>Review FirstNet terms, network features, eligibility, and tools.</h1>
          <p>
            Search the guide, open quick notes, flip flashcards, then test recall with
            a short quiz.
          </p>
        </div>
        <Search query={query} onQueryChange={setQuery} />
      </section>

      <DashBoard stats={stats} />

      <section className="study-section" id="notes">
        <div className="section-heading">
          <p className="eyebrow">Read</p>
          <h2>Plan and activation notes</h2>
        </div>
        <Plans plans={filteredPlans} />
      </section>

      <section className="study-section" id="billing-eligibility">
        <div className="section-heading">
          <p className="eyebrow">Deep Dive</p>
          <h2>Billing, Eligibility, and Plan Details</h2>
        </div>
        <BillingEligibilityGuide guide={billingEligibilityGuide} />
      </section>

      <section className="study-section" id="billing-eligibility-quiz">
        <div className="section-heading">
          <p className="eyebrow">Practice</p>
          <h2>Billing and Eligibility Quiz</h2>
        </div>
        <Quiz questions={billingEligibilityQuiz} />
      </section>

      <section className="study-section" id="account-roadmap">
        <div className="section-heading">
          <p className="eyebrow">Roadmap</p>
          <h2>Subscriber Paid vs. Agency Paid Accounts</h2>
        </div>
        <AccountRoadmap roadmap={accountRoadmap} />
      </section>

      <section className="study-section" id="flashcards">
        <div className="section-heading">
          <p className="eyebrow">Recall</p>
          <h2>Flashcards</h2>
        </div>
        <FlashCardGrid terms={filteredTerms} />
      </section>

      <section className="study-section" id="quiz">
        <div className="section-heading">
          <p className="eyebrow">Practice</p>
          <h2>Quiz</h2>
        </div>
        <Quiz
          key={visibleQuestions.map((question) => question.prompt).join('|')}
          questions={visibleQuestions}
        />
      </section>

      <section className="study-section source-section" id="sources">
        <div className="section-heading">
          <p className="eyebrow">Verify</p>
          <h2>Sources</h2>
        </div>
        <ul className="source-list">
          {sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
