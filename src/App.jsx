import { useEffect, useRef, useState } from 'react'

import './App.css'
import AccountRoadmap from './components/AccountRoadmap'
import BillingEligibilityGuide from './components/BillingEligibilityGuide'
import DashBoard from './components/DashBoard.jsx'
import DeescalationGame from './components/DeescalationGame'
import EagleEye from './components/EagleEye'
import FlashCardGrid from './components/FlashCardGrid'
import MesaBreaker from './components/MesaBreaker'
import PavoCristatus from './components/PavoCristatus'
import Plans from './components/Plans'
import Quiz from './components/Quiz'
import Search from './components/Search'
import SelfServiceGame from './components/SelfServiceGame'
import owlHero from './assets/owl-first-responder-shield.png'
import {
  accountRoadmap,
  billingEligibilityGuide,
  billingEligibilityQuiz,
  quizQuestions,
  selfServiceGame,
  sources,
  studyNotes,
  terms,
} from './data/studyGuide'

const navItems = [
  {
    id: 'billing',
    label: 'Billing',
    theme: 'aqua',
    description: 'Plans, bill pay, pricing rules, and billing quiz',
  },
  {
    id: 'eligibility',
    label: 'Eligibility',
    theme: 'emerald',
    description: 'Eligibility notes, account roadmap, and scenarios',
  },
  {
    id: 'index-cards',
    label: 'Index Cards',
    theme: 'amber',
    description: 'Searchable flashcards and knowledge checks',
  },
  {
    id: 'sso',
    label: 'SSO Options',
    theme: 'violet',
    description: 'Self-service scenario matching game',
  },
  {
    id: 'mesa-breaker',
    label: 'MESA Breaker',
    theme: 'green',
    description: 'Owl CORE laser brick-breaker game',
  },
  {
    id: 'deescalation',
    label: 'DoveTalk',
    theme: 'dove',
    description: 'Call-center customer calming simulator',
  },
  {
    id: 'pavo',
    label: 'Pavo Scripts',
    theme: 'peacock',
    description: 'Customer script builder with source-colored feathers',
  },
]

const eagleEyeSummaries = {
  billing: {
    title: 'Billing in plain words',
    points: [
      'The individual plans mostly differ by monthly price, international benefits, hotspot/tablet/wearable extras, and family-line discounts.',
      'Published FirstNet individual prices assume eligible AutoPay and paperless billing discounts; the app data says those discounts start within two bills.',
      'Bill pay is not guest pay here: the customer signs in to FirstNet Central, then goes to Manage Services & Billing.',
    ],
  },
  eligibility: {
    title: 'Eligibility in plain words',
    points: [
      'Subscriber Paid means the eligible person pays for their own FirstNet service.',
      'Agency Paid means the organization manages service for employees or personnel.',
      'FirstNet and Family is for verified Subscriber Paid users; family lines use AT&T commercial network service, not FirstNet priority access.',
    ],
  },
  'index-cards': {
    title: 'Index Cards in plain words',
    points: [
      'Start with the terms that explain why FirstNet matters: Band 14, priority, preemption, and the dedicated FirstNet core.',
      'Then learn the activation identifiers: IMEI is the device, ICCID is the SIM, and EID is for eSIM.',
      'Use the quiz after flipping cards so you practice recall instead of only reading definitions.',
    ],
  },
  sso: {
    title: 'SSO/self-service in plain words',
    points: [
      'Use FirstNet Central for bill pay, account overview, billing help, and chat with an expert.',
      'Use FirstNet Help for eSIM activation, certified device help, and NumberSync wearable help.',
      'Use FirstNet Assist for dedicated care, live chat text, device diagnostics, and uplift workflows.',
    ],
  },
  'mesa-breaker': {
    title: 'MESA Breaker in plain words',
    points: [
      'Move the owl left and right, then fire CORE shots to clear the MESA bricks.',
      'The game is practice and energy between study sections, not customer policy information.',
      'Clear all bricks to reset the board and start the next round.',
    ],
  },
  deescalation: {
    title: 'DoveTalk in plain words',
    points: [
      'Start by acknowledging the customer concern before explaining facts.',
      'Take ownership, then clarify the FirstNet topic: bill, plan, device, eligibility, or support path.',
      'Give a clear next step and check agreement so the customer ends calmer than they started.',
    ],
  },
  pavo: {
    title: 'Pavo Scripts in plain words',
    points: [
      'Each script section is built from existing app data instead of invented plan claims.',
      'The colored source badges show whether a line came from Billing, Eligibility, Index Cards, SSO, or DoveTalk.',
      'Use the text boxes to adjust tone, but verify facts before quoting prices or eligibility to a customer.',
    ],
  },
}

function matchesSearch(item, query) {
  return JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
}

function App() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('billing')
  const [navCompact, setNavCompact] = useState(false)
  const [eagleEyeEnabled, setEagleEyeEnabled] = useState(false)
  const [siteViews, setSiteViews] = useState(0)
  const navAnchorRef = useRef(null)
  const viewTrackedRef = useRef(false)
  const activeNavItem = navItems.find((item) => item.id === activeTab)

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
    {
      label: 'Site Views',
      value: siteViews,
      description: 'Total views recorded by the site tracker.',
    },
  ]

  useEffect(() => {
    if (viewTrackedRef.current) return

    viewTrackedRef.current = true
    let isActive = true

    fetch('/api/views', {
      method: 'POST',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to update site views')
        return response.json()
      })
      .then((data) => {
        if (isActive && typeof data.views === 'number') {
          setSiteViews(data.views)
        }
      })
      .catch(() => {
        if (isActive) setSiteViews(0)
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    function updateNavState() {
      if (!navAnchorRef.current) return

      setNavCompact(navAnchorRef.current.getBoundingClientRect().top < 0)
    }

    updateNavState()
    window.addEventListener('scroll', updateNavState, { passive: true })
    window.addEventListener('resize', updateNavState)

    return () => {
      window.removeEventListener('scroll', updateNavState)
      window.removeEventListener('resize', updateNavState)
    }
  }, [])

  return (
    <main className={`page theme-${activeNavItem.theme} ${eagleEyeEnabled ? 'eagle-eye-on' : ''}`}>
      <section className="hero">
        <div>
          <p className="eyebrow">FirstNet learning guide</p>
          <h1> Owl Facts</h1>
          <p style={{textAlign:'right',color:'gold'}}>powered by jmw</p>
          <p>
            A guided FirstNet study workspace for billing, eligibility, index cards,
            self-service options, scenarios, and quizzes.
          </p>
        </div>
        <div className="hero-media">
          <img src={owlHero} alt="Owl landing on an AT&T-style globe mark" />
        </div>
      </section>

      <DashBoard stats={stats} />

      {/* <OwlAssistant activeTab={activeTab} navItems={navItems} onNavigate={setActiveTab} /> */}

      <div ref={navAnchorRef} className="nav-scroll-anchor" aria-hidden="true" />
      <nav className={`study-nav ${navCompact ? 'is-compact' : ''}`} aria-label="Study sections">
        {navItems.map((item) => (
          <button
            className={`nav-tab nav-${item.theme} ${activeTab === item.id ? 'active' : ''}`}
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <EagleEye
        enabled={eagleEyeEnabled}
        onToggle={() => setEagleEyeEnabled((enabled) => !enabled)}
      />

      <section className="tab-shell">
        {activeTab === 'billing' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.billing} />}
            <section className="study-section" id="billing-eligibility">
              <div className="section-heading">
                <p className="eyebrow">Billing</p>
                <h2>Billing, Plan, and Payment Details</h2>
              </div>
              <BillingEligibilityGuide eagleEye={eagleEyeEnabled} guide={billingEligibilityGuide} />
            </section>

            <section className="study-section paired-practice" id="billing-eligibility-quiz">
              <div className="section-heading">
                <p className="eyebrow">Practice</p>
                <h2>Billing and Eligibility Quiz</h2>
              </div>
              <Quiz questions={billingEligibilityQuiz} />
            </section>
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.eligibility} />}
            <section className="study-section" id="notes">
              <div className="section-heading">
                <p className="eyebrow">Read</p>
                <h2>Eligibility, Plans, and Activation Notes</h2>
              </div>
              <Plans eagleEye={eagleEyeEnabled} plans={filteredPlans} />
            </section>

            <section className="study-section paired-practice" id="account-roadmap">
              <div className="section-heading">
                <p className="eyebrow">Scenario Roadmap</p>
                <h2>Subscriber Paid vs. Agency Paid Accounts</h2>
              </div>
              <AccountRoadmap eagleEye={eagleEyeEnabled} roadmap={accountRoadmap} />
            </section>
          </div>
        )}

        {activeTab === 'index-cards' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries['index-cards']} />}
            <section className="study-section search-dock">
              <Search query={query} onQueryChange={setQuery} />
            </section>

            <section className="study-section" id="flashcards">
              <div className="section-heading">
                <p className="eyebrow">Index Cards</p>
                <h2>Searchable FirstNet Index Cards</h2>
              </div>
              <FlashCardGrid eagleEye={eagleEyeEnabled} terms={filteredTerms} />
            </section>

            <section className="study-section paired-practice" id="quiz">
              <div className="section-heading">
                <p className="eyebrow">Practice</p>
                <h2>Index Card Quiz</h2>
              </div>
              <Quiz
                key={visibleQuestions.map((question) => question.prompt).join('|')}
                questions={visibleQuestions}
              />
            </section>
          </div>
        )}

        {activeTab === 'sso' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.sso} />}
            <section className="study-section" id="sso-options">
              <div className="section-heading">
                <p className="eyebrow">Self-Service</p>
                <h2>SSO Options Matching Game</h2>
              </div>
              <SelfServiceGame game={selfServiceGame} />
            </section>
          </div>
        )}

        {activeTab === 'mesa-breaker' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries['mesa-breaker']} />}
            <section className="study-section" id="mesa-breaker">
              <MesaBreaker />
            </section>
          </div>
        )}

        {activeTab === 'deescalation' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.deescalation} />}
            <section className="study-section" id="deescalation">
              <DeescalationGame />
            </section>
          </div>
        )}

        {activeTab === 'pavo' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.pavo} />}
            <section className="study-section" id="pavo-cristatus">
              <div className="section-heading">
                <p className="eyebrow">Script Builder</p>
                <h2>PavoCristatus Customer Script Studio</h2>
              </div>
              <PavoCristatus
                accountRoadmap={accountRoadmap}
                billingGuide={billingEligibilityGuide}
                selfServiceGame={selfServiceGame}
                studyNotes={studyNotes}
                terms={terms}
              />
            </section>
          </div>
        )}
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

function EagleEyeSummary({ summary }) {
  return (
    <aside className="eagle-eye-summary">
      <p className="eyebrow">Eagle Eye</p>
      <h2>{summary.title}</h2>
      <ul>
        {summary.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </aside>
  )
}

export default App
