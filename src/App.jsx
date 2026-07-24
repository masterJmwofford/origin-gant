import { useCallback, useEffect, useRef, useState } from 'react'

import './App.css'
import AccountRoadmap from './components/AccountRoadmap'
import BillingEligibilityGuide from './components/BillingEligibilityGuide'
import DashBoard from './components/DashBoard.jsx'
import DeescalationGame from './components/DeescalationGame'
import DeviceUpgradeGame from './components/DeviceUpgradeGame'
import EagleEye from './components/EagleEye'
import EssentialQuestions from './components/EssentialQuestions'
import FlashCardGrid from './components/FlashCardGrid'
import HeatMap from './components/HeatMap'
import MesaBreaker from './components/MesaBreaker'
import ScriptStudio from './components/ScriptStudio'
import Plans from './components/Plans'
import Quiz from './components/Quiz'
import Roadmap from './components/Roadmap'
import Search from './components/Search'
import SelfServiceGame from './components/SelfServiceGame'
import Shipping from './components/Shipping'
import professionalHero from './assets/professional-hero.png'
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
    id: 'questions',
    label: 'QA Essentials',
    theme: 'indigo',
    description: 'Essential questions by customer need',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    theme: 'coral',
    description: 'Branching call paths by customer and account type',
  },
  {
    id: 'heatmap',
    label: 'HeatMap',
    theme: 'map',
    description: 'Coverage and travel feature learning map',
  },
  {
    id: 'shipping',
    label: 'Shipping',
    theme: 'steel',
    description: 'Equipment shipping, returns, and lost-device workflows',
  },
  {
    id: 'device-upgrades',
    label: 'D-Vice',
    theme: 'steel',
    description: 'FirstNet device upgrade learning card game',
  },
  {
    id: 'mesa-breaker',
    label: 'MESA Breaker',
    theme: 'green',
    description: 'CORE launcher brick-breaker game',
  },
  {
    id: 'deescalation',
    label: 'Scenario',
    theme: 'service',
    description: 'Call-center customer calming simulator',
  },
  {
    id: 'script-studio',
    label: 'Script Studio',
    theme: 'script',
    description: 'Customer script builder with source-colored sections',
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
  questions: {
    title: 'Call questions in plain words',
    points: [
      'Start by identifying the caller need and account path before explaining anything account-specific.',
      'IRU and CRU calls are treated as Subscriber Paid and Agency Paid paths in this guide, so reps verify before applying billing, device, or eligibility guidance.',
      'Use the category questions to gather the right identifiers: account type, plan, device model, IMEI, ICCID, EID, destination, or support path.',
    ],
  },
  roadmap: {
    title: 'Roadmap in plain words',
    points: [
      'Start every call by separating new vs. existing customer, then identify the account path.',
      'Subscriber Paid, Agency Paid, and FirstNet and Family/family-line calls branch into different verification and support paths.',
      'Each issue path still needs official verification before quoting eligibility, pricing, device, billing, coverage, or travel answers.',
    ],
  },
  heatmap: {
    title: 'HeatMap in plain words',
    points: [
      'Use this as a learning map, not as a live address-level coverage checker.',
      'All listed individual FirstNet plans include First Priority language, but coverage/travel benefits differ by plan.',
      '5G and International Day Pass both need verification before quoting: check the device, destination, location, and account details.',
    ],
  },
  shipping: {
    title: 'Shipping in plain words',
    points: [
      'Exact delivery and return dates must come from official tracking, return-label, order, or account tools.',
      'Returns generally require the correct return period, like-new condition, original components, packaging, and proof of purchase.',
      'Lost or stolen equipment starts with account protection: verify the caller, identify the device/line, then use official suspend, block, replacement, or recovery steps.',
    ],
  },
  'device-upgrades': {
    title: 'D-Vice in plain words',
    points: [
      'Do not quote an upgrade unless the device, offer price, and requirements belong together.',
      'The iPhone 17 Pro offer in this game requires the matching trade-in value, installment plan, and FirstNet Extra 2.0 or higher condition.',
      'Certified devices without a published offer card should be treated as verify-current-pricing before quoting.',
    ],
  },
  'mesa-breaker': {
    title: 'MESA Breaker in plain words',
    points: [
      'Move the launcher left and right, then fire CORE shots to clear the MESA bricks.',
      'The game is practice and energy between study sections, not customer policy information.',
      'Clear all bricks to reset the board and start the next round.',
    ],
  },
  deescalation: {
    title: 'Scenario in plain words',
    points: [
      'Start by acknowledging the customer concern before explaining facts.',
      'Take ownership, then clarify the FirstNet topic: bill, plan, device, eligibility, or support path.',
      'Give a clear next step and check agreement so the customer ends calmer than they started.',
    ],
  },
  'script-studio': {
    title: 'Script Studio in plain words',
    points: [
      'Each script section is built from existing app data instead of invented plan claims.',
      'The colored source badges show whether a line came from Billing, Eligibility, Index Cards, SSO, or Scenario.',
      'Use the text boxes to adjust tone, but verify facts before quoting prices or eligibility to a customer.',
    ],
  },
}

const tutorialSteps = [
  {
    tab: 'billing',
    spotlight: 'nav',
    title: 'Navigation: Billing',
    component: 'Billing tab',
    summary: 'The active nav button controls which training workspace is visible.',
    features: ['Billing opens the plan/payment guide.', 'The app keeps quizzes near the related study content.', 'The tab color updates the page theme.'],
    demo: 'Use Next to move from the Billing nav target into the Billing content area.',
  },
  {
    tab: 'billing',
    spotlight: 'content',
    title: 'Billing Guide',
    component: 'Billing, Plan, and Payment Details',
    summary: 'This component presents billing and plan guidance already stored in the app data.',
    features: ['Review plan and billing sections first.', 'Use Eagle Eye separately for plain-language summaries.', 'Use the paired quiz after reading the billing guide.'],
    demo: 'Open the visible guide sections, then scroll to the billing quiz underneath.',
  },
  {
    tab: 'eligibility',
    spotlight: 'nav',
    title: 'Navigation: Eligibility',
    component: 'Eligibility tab',
    summary: 'Eligibility groups account type, plan notes, activation notes, and the Subscriber Paid vs Agency Paid comparison.',
    features: ['Subscriber Paid and Agency Paid are separated.', 'FirstNet and Family is treated as its own path.', 'Activation notes stay with eligibility and plans.'],
    demo: 'Next opens the actual Eligibility workspace so you can review the notes.',
  },
  {
    tab: 'eligibility',
    spotlight: 'content',
    title: 'Eligibility Notes',
    component: 'Eligibility, Plans, and Activation Notes',
    summary: 'This section is for reading account and plan concepts before practicing with scenarios.',
    features: ['Expandable notes support quick review.', 'Account type language is kept visible.', 'The paired roadmap helps compare ownership and responsibility.'],
    demo: 'Read the notes, then use the Subscriber Paid vs Agency Paid activity below.',
  },
  {
    tab: 'index-cards',
    spotlight: 'content',
    title: 'Index Card Workflow',
    component: 'Search, flashcards, and quiz',
    summary: 'Index Cards combine filtering, flashcards, and recall testing.',
    features: ['Search narrows the card list.', 'Flashcards support term-by-term review.', 'The quiz uses the currently visible study set when search filters are active.'],
    demo: 'Try searching a term, flip cards, then answer quiz questions below the card grid.',
  },
  {
    tab: 'sso',
    spotlight: 'content',
    title: 'SSO Matching Activity',
    component: 'SSO Options matching game',
    summary: 'This game teaches which self-service path fits a customer need.',
    features: ['Scenarios describe the customer need.', 'Options represent support paths already used in the app.', 'Matching creates quick recall for live-call routing.'],
    demo: 'Read the customer prompt and match it to the correct self-service option.',
  },
  {
    tab: 'questions',
    spotlight: 'content',
    title: 'QA Essentials Categories',
    component: 'Essential customer questions',
    summary: 'QA Essentials gives call-path questions by customer need.',
    features: ['Category buttons change the question set.', 'Opening questions help identify account path.', 'Verification notes prevent account-specific guessing.'],
    demo: 'Click a need category such as Devices, Activations, or Coverage / Travel and use the displayed questions as a call guide.',
  },
  {
    tab: 'roadmap',
    spotlight: 'nav',
    title: 'Navigation: Roadmap',
    component: 'Roadmap tab',
    summary: 'Roadmap is the branching call path map for managers and agents.',
    features: ['The tab is visually emphasized as a key training area.', 'The section starts with call-in triage.', 'The tree separates customer status, account type, verification, and issue path.'],
    demo: 'Next focuses the Roadmap component itself.',
  },
  {
    tab: 'roadmap',
    spotlight: 'content',
    title: 'Roadmap Tree',
    component: 'Branching call path tree',
    summary: 'The tree shows how a call progresses from call-in to specific customer issue.',
    features: ['Click a node to open detailed questions and steps.', 'Use the four verification cards before account-specific guidance.', 'Coverage/travel appears as an issue path tied to account type.'],
    demo: 'Click any node in the tree to open the detailed modal for that point in the call.',
  },
  {
    tab: 'roadmap',
    spotlight: 'content',
    title: 'Roadmap Travel Mode',
    component: 'Progressive Coaching',
    summary: 'Travel mode turns the Roadmap into a step-by-step guided path.',
    features: ['Travel Path starts the guided journey.', 'Each choice personalizes the next branch.', 'Progress buttons let users revisit earlier decisions.'],
    demo: 'Click Travel Path, answer each progressive choice, and watch the call journey narrow.',
  },
  {
    tab: 'heatmap',
    spotlight: 'content',
    title: 'HeatMap Coverage Concepts',
    component: 'Coverage and travel guide',
    summary: 'HeatMap organizes coverage and travel learning concepts already present in the app.',
    features: ['Coverage and travel concepts are separated by buttons/lists.', 'International Day Pass is treated as verify-before-quote.', 'This is not presented as a live address-level coverage checker.'],
    demo: 'Switch between layers to compare coverage, travel, 5G, and plan-specific concepts.',
  },
  {
    tab: 'shipping',
    spotlight: 'content',
    title: 'Shipping Desk',
    component: 'Equipment logistics guide',
    summary: 'Shipping separates returns, outbound equipment, lost/stolen devices, and recovery steps.',
    features: ['Policy cards explain each workflow.', 'The estimator provides planning ranges only.', 'Find My Location captures coordinates without pretending to know a street address.'],
    demo: 'Enter a ZIP, city/state, or address to see a training estimate, then verify actual dates in official tools.',
  },
  {
    tab: 'device-upgrades',
    spotlight: 'content',
    title: 'D-Vice Academy',
    component: 'Device upgrade learning aid',
    summary: 'D-Vice teaches terminology and requirements before the card game.',
    features: ['Academy carousel explains device terminology.', 'Dealer briefing frames the upgrade scenario.', 'Cards train matching requirements to device offers.'],
    demo: 'Move through the academy carousel first, then play one requirement card to the dealer table.',
  },
  {
    tab: 'mesa-breaker',
    spotlight: 'content',
    title: 'MESA Breaker',
    component: 'Practice game',
    summary: 'MESA Breaker is a short engagement game separate from customer policy guidance.',
    features: ['Move the launcher.', 'Fire CORE shots.', 'Clear the MESA bricks to reset the round.'],
    demo: 'Use the game controls to clear the board when you need an energy break between study sections.',
  },
  {
    tab: 'deescalation',
    spotlight: 'content',
    title: 'Scenario Simulator',
    component: 'Customer interaction practice',
    summary: 'Scenario lets the user type a response and receive a customer reply after scanning.',
    features: ['Each round uses a different first-responder profile.', 'The customer reply reacts to the response content.', 'The simulator checks de-escalation skills and script checkpoints.'],
    demo: 'Type a response that acknowledges, verifies, answers the direct concern, and gives a next step.',
  },
  {
    tab: 'script-studio',
    spotlight: 'content',
    title: 'Script Studio',
    component: 'Editable customer script builder',
    summary: 'Script Studio organizes script sections for live customer interaction.',
    features: ['Script parts are separated into editable blocks.', 'Source colors show where each snippet came from.', 'The combined script can be refined for real-time calls.'],
    demo: 'Edit a section, then review the combined script panel for flow.',
  },
  {
    tab: 'billing',
    spotlight: 'eagle',
    title: 'Eagle Eye Toggle',
    component: 'Plain-language summary control',
    summary: 'Eagle Eye is the app-wide simplifier for high-value information.',
    features: ['Toggle it on to show plain-language highlights.', 'The summary changes by active tab.', 'It is useful when users need the gist quickly.'],
    demo: 'Toggle Eagle Eye while this tutorial is open to see how the current tab summary changes.',
  },
  {
    tab: 'billing',
    spotlight: 'sources',
    title: 'Source Area',
    component: 'Sources section',
    summary: 'The Sources area keeps verification links visible at the bottom of the application.',
    features: ['Use it to verify claims outside the training flow.', 'The app content should be treated as study guidance.', 'Account-specific answers still require official tools.'],
    demo: 'Close the tutorial and scroll to Sources when you need to verify the training material.',
  },
]

function matchesSearch(item, query) {
  return JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
}

function getTutorialTargetSelector(step) {
  return (
    {
      nav: '.study-nav .nav-tab.active',
      content: '.tab-panel .study-section:first-child',
      eagle: '.eagle-eye-toggle',
      sources: '.source-section',
    }[step.spotlight] ?? '.tab-shell'
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('billing')
  const [navCompact, setNavCompact] = useState(false)
  const [eagleEyeEnabled, setEagleEyeEnabled] = useState(false)
  const [siteViews, setSiteViews] = useState(0)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialTarget, setTutorialTarget] = useState(null)
  const [tutorialCardPlacement, setTutorialCardPlacement] = useState({ top: 18, left: 18 })
  const navAnchorRef = useRef(null)
  const viewTrackedRef = useRef(false)
  const activeNavItem = navItems.find((item) => item.id === activeTab)
  const currentTutorial = tutorialSteps[tutorialStep]

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

  const updateTutorialCoachMark = useCallback((step = currentTutorial) => {
    if (!tutorialOpen || !step) return

    const target = document.querySelector(getTutorialTargetSelector(step)) ?? document.querySelector('.tab-shell')

    if (!target) return

    const rect = target.getBoundingClientRect()
    const padding = 10
    const nextTarget = {
      top: Math.max(8, rect.top - padding),
      left: Math.max(8, rect.left - padding),
      width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
      height: Math.min(window.innerHeight - 16, rect.height + padding * 2),
    }
    const cardWidth = Math.min(440, window.innerWidth - 24)
    const belowTop = nextTarget.top + nextTarget.height + 14
    const aboveTop = nextTarget.top - 330
    const fitsBelow = belowTop + 300 < window.innerHeight
    const top = fitsBelow ? belowTop : Math.max(12, aboveTop)
    const left = Math.min(
      Math.max(12, nextTarget.left + nextTarget.width / 2 - cardWidth / 2),
      window.innerWidth - cardWidth - 12,
    )

    setTutorialTarget(nextTarget)
    setTutorialCardPlacement({ top, left })
  }, [currentTutorial, tutorialOpen])

  useEffect(() => {
    if (!tutorialOpen) return undefined

    const update = () => updateTutorialCoachMark()
    const timer = window.setTimeout(update, 120)

    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, { passive: true })

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [tutorialOpen, tutorialStep, activeTab, updateTutorialCoachMark])

  function showTutorialStep(nextStep) {
    const boundedStep = Math.min(Math.max(nextStep, 0), tutorialSteps.length - 1)
    const step = tutorialSteps[boundedStep]

    setTutorialStep(boundedStep)
    setActiveTab(step.tab)
    window.setTimeout(() => {
      document
        .querySelector(getTutorialTargetSelector(step))
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)

    window.setTimeout(() => updateTutorialCoachMark(step), 420)
  }

  function startTutorial() {
    setTutorialOpen(true)
    showTutorialStep(0)
  }

  function closeTutorial() {
    setTutorialOpen(false)
    setTutorialTarget(null)
  }

  function goToPreviousTutorialStep() {
    showTutorialStep(tutorialStep - 1)
  }

  function goToNextTutorialStep() {
    if (tutorialStep === tutorialSteps.length - 1) {
      closeTutorial()
      return
    }

    showTutorialStep(tutorialStep + 1)
  }

  return (
    <main
      className={`page theme-${activeNavItem.theme} ${eagleEyeEnabled ? 'eagle-eye-on' : ''} ${
        tutorialOpen ? 'tutorial-running' : ''
      } ${tutorialOpen ? `tutorial-spotlight-${currentTutorial.spotlight}` : ''}`}
    >
      <section className="hero">
        <div>
          <p className="eyebrow">FirstNet professional learning guide</p>
          <h1>Lyceum</h1>
          <p style={{ textAlign: 'right', color: 'gold' }}>powered by Jmwofford</p>
          <p>
            A guided FirstNet study workspace for billing, eligibility, index cards,
            self-service options, scenarios, and quizzes.
          </p>
        </div>
        <div className="hero-media">
          <img src={professionalHero} alt="Professional call center training team" />
        </div>
      </section>

      <button className="tutorial-launch" type="button" onClick={startTutorial}>
        Start tutorial
      </button>

      <DashBoard stats={stats} />

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
            <section className="study-section" id="account-roadmap">
              <div className="section-heading">
                <p className="eyebrow">Scenario Roadmap</p>
                <h2>Subscriber Paid vs. Agency Paid Accounts</h2>
              </div>
              <AccountRoadmap eagleEye={eagleEyeEnabled} roadmap={accountRoadmap} />
            </section>

            <section className="study-section paired-practice" id="notes">
              <div className="section-heading">
                <p className="eyebrow">Read</p>
                <h2>Eligibility, Plans, and Activation Notes</h2>
              </div>
              <Plans eagleEye={eagleEyeEnabled} plans={filteredPlans} />
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

        {activeTab === 'questions' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.questions} />}
            <section className="study-section" id="essential-questions">
              <EssentialQuestions />
            </section>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.roadmap} />}
            <section className="study-section" id="roadmap">
              <Roadmap />
            </section>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.heatmap} />}
            <section className="study-section" id="heatmap">
              <HeatMap />
            </section>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries.shipping} />}
            <section className="study-section" id="shipping">
              <Shipping />
            </section>
          </div>
        )}

        {activeTab === 'device-upgrades' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries['device-upgrades']} />}
            <section className="study-section" id="device-upgrades">
              <DeviceUpgradeGame />
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

        {activeTab === 'script-studio' && (
          <div className="tab-panel">
            {eagleEyeEnabled && <EagleEyeSummary summary={eagleEyeSummaries['script-studio']} />}
            <section className="study-section" id="customer-script-studio">
              <div className="section-heading">
                <p className="eyebrow">Script Builder</p>
                <h2>Customer Script Studio</h2>
              </div>
              <ScriptStudio
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

      {tutorialOpen && (
        <aside className="tutorial-overlay" role="dialog" aria-modal="false" aria-label="Application tutorial">
          <div className="tutorial-backdrop" />
          {tutorialTarget && (
            <div
              className="tutorial-coach-mark"
              aria-hidden="true"
              style={{
                top: `${tutorialTarget.top}px`,
                left: `${tutorialTarget.left}px`,
                width: `${tutorialTarget.width}px`,
                height: `${tutorialTarget.height}px`,
              }}
            />
          )}
          <section
            className="tutorial-card"
            style={{
              top: `${tutorialCardPlacement.top}px`,
              left: `${tutorialCardPlacement.left}px`,
            }}
          >
            <div className="tutorial-card-header">
              <div>
                <p className="eyebrow">
                  Tutorial {tutorialStep + 1} of {tutorialSteps.length}
                </p>
                <h2>{currentTutorial.title}</h2>
              </div>
              <button type="button" onClick={closeTutorial} aria-label="Close tutorial">
                ×
              </button>
            </div>

            <div className="tutorial-progress" aria-hidden="true">
              {tutorialSteps.map((step, index) => (
                <span className={index <= tutorialStep ? 'active' : ''} key={step.title} />
              ))}
            </div>

            <article className="tutorial-demo-card">
              <span>{currentTutorial.component}</span>
              <p>{currentTutorial.summary}</p>
              <ul>
                {currentTutorial.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <strong>{currentTutorial.demo}</strong>
              <em>Interact with the highlighted area, then continue the tour.</em>
            </article>

            <div className="tutorial-step-tabs" aria-label="Jump to tutorial step">
              {tutorialSteps.map((step, index) => (
                <button
                  className={index === tutorialStep ? 'active' : ''}
                  key={step.title}
                  type="button"
                  onClick={() => showTutorialStep(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="tutorial-actions">
              <button type="button" onClick={goToPreviousTutorialStep} disabled={tutorialStep === 0}>
                Previous
              </button>
              <button className="primary" type="button" onClick={goToNextTutorialStep}>
                {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </section>
        </aside>
      )}
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
