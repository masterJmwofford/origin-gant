import { useMemo, useState } from 'react'
import customerFace from '../assets/customer-face.png'
import doveCoach from '../assets/dove-coach.png'

const dispositionLevels = [
  {
    label: 'Escalated',
    className: 'level-escalated',
    description: 'Voice raised, frustrated, needs acknowledgement before facts.',
  },
  {
    label: 'Tense',
    className: 'level-tense',
    description: 'Still upset, but listening for ownership and a path forward.',
  },
  {
    label: 'Concerned',
    className: 'level-concerned',
    description: 'Open to details, needs clarity and reassurance.',
  },
  {
    label: 'Calm',
    className: 'level-calm',
    description: 'Ready for next steps and a concise close.',
  },
]

const skillGroups = [
  {
    id: 'empathy',
    label: 'Empathy',
    keywords: ['understand', 'frustrating', 'concern', 'hear you', 'i hear', 'sorry', 'apologize'],
    coach: 'Name the feeling or impact so the customer knows you heard the issue.',
  },
  {
    id: 'ownership',
    label: 'Ownership',
    keywords: ['i can help', 'let me help', 'we can', 'i will', 'i’ll', 'i can check', 'take a look'],
    coach: 'Take ownership instead of sending the customer in circles.',
  },
  {
    id: 'clarify',
    label: 'Clarify',
    keywords: ['confirm', 'check', 'verify', 'account', 'line', 'device', 'plan', 'bill', 'eligibility'],
    coach: 'Ask or state what you will verify before giving a solution.',
  },
  {
    id: 'reassure',
    label: 'Reassure',
    keywords: ['next step', 'resolve', 'fix', 'review', 'explain', 'walk through', 'make sure'],
    coach: 'Give a clear next step that lowers uncertainty.',
  },
  {
    id: 'close',
    label: 'Agreement',
    keywords: ['does that work', 'sound good', 'today', 'before we end', 'anything else', 'summary'],
    coach: 'Close with agreement, a summary, or a check that the customer is comfortable.',
  },
]

const escalationWords = ['calm down', 'policy', 'wrong', 'obviously', 'just', 'you need to', 'not my fault']

const customerScenarios = [
  {
    name: 'Mara',
    role: 'Subscriber Paid firefighter',
    concern:
      'Mara says her FirstNet bill looks higher than expected and she is angry because she thought AutoPay and paperless billing were already included.',
    context:
      'Useful facts: published FirstNet individual prices assume eligible AutoPay and paperless billing discount; FirstNet says those discounts start within two bills, and taxes/fees are extra.',
    targetSkills: ['empathy', 'ownership', 'clarify', 'reassure'],
  },
  {
    name: 'Andre',
    role: 'ER nurse',
    concern:
      'Andre wants FirstNet and Family, but his spouse thinks every family line will get FirstNet priority access.',
    context:
      'Useful facts: FirstNet and Family is for verified Subscriber Paid Users; family lines use AT&T commercial network service, not the FirstNet network.',
    targetSkills: ['empathy', 'clarify', 'reassure', 'close'],
  },
  {
    name: 'Jules',
    role: 'Agency administrator',
    concern:
      'Jules is upset because they do not know whether a department account should use Subscriber Paid or Agency Paid setup.',
    context:
      'Useful facts: Subscriber Paid is individual-paid service; agency plans are for public safety organizations providing service to employees or personnel.',
    targetSkills: ['empathy', 'ownership', 'clarify', 'reassure'],
  },
  {
    name: 'Priya',
    role: 'New FirstNet phone user',
    concern:
      'Priya is frustrated because her compatible phone needs eSIM activation and she does not know where to start.',
    context:
      'Useful facts: FirstNet Help has Activate eSIM resources, including device-specific activation tutorials.',
    targetSkills: ['empathy', 'ownership', 'reassure', 'close'],
  },
  {
    name: 'Cole',
    role: 'Field supervisor',
    concern:
      'Cole is worried because personnel in the field need support and a device diagnostic path during an incident.',
    context:
      'Useful facts: FirstNet Assist provides dedicated care, live chat text, one-button voice contact, device diagnostics, and uplift workflows.',
    targetSkills: ['empathy', 'clarify', 'reassure', 'close'],
  },
  {
    name: 'Sam',
    role: 'Volunteer responder',
    concern:
      'Sam says eligibility feels confusing and does not know whether to trust a job title alone.',
    context:
      'Useful facts: eligibility should be verified through official FirstNet workflows; examples include first responders and people who support first responders.',
    targetSkills: ['empathy', 'ownership', 'clarify', 'reassure'],
  },
]

function pickScenarioIndex(currentIndex = -1) {
  if (customerScenarios.length <= 1) return 0

  let nextIndex = Math.floor(Math.random() * customerScenarios.length)

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * customerScenarios.length)
  }

  return nextIndex
}

function scanResponse(response, scenario) {
  const normalized = response.toLowerCase()
  const matchedGroups = skillGroups.filter((group) =>
    group.keywords.some((keyword) => normalized.includes(keyword)),
  )
  const matchedEscalators = escalationWords.filter((word) => normalized.includes(word))
  const targetMatches = matchedGroups.filter((group) => scenario.targetSkills.includes(group.id))
  const uniqueMatches = new Set(matchedGroups.map((group) => group.id))
  const reduction = Math.max(0, targetMatches.length + Math.max(0, uniqueMatches.size - 2) - matchedEscalators.length)

  return {
    matchedGroups,
    matchedEscalators,
    reduction,
  }
}

function buildAdvice(result, didResolve) {
  const matchedLabels = result.matchedGroups.map((group) => group.label)
  const missingCoaching = skillGroups
    .filter((group) => !result.matchedGroups.some((match) => match.id === group.id))
    .slice(0, 2)
    .map((group) => group.coach)

  if (didResolve) {
    return `DoveTalk advice: Great recovery. You used ${matchedLabels.join(', ') || 'calming language'} and brought the customer to a calm close.`
  }

  if (result.reduction > 0) {
    return `DoveTalk advice: Good progress. Matched ${matchedLabels.join(', ')}. Next, add: ${missingCoaching.join(' ')}`
  }

  return `DoveTalk advice: Try again with a warmer opening. ${missingCoaching.join(' ')}`
}

export default function DeescalationGame() {
  const [scenarioIndex, setScenarioIndex] = useState(() => pickScenarioIndex())
  const [calmLevel, setCalmLevel] = useState(0)
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [advicePopup, setAdvicePopup] = useState(null)
  const [round, setRound] = useState(1)
  const [wins, setWins] = useState(0)
  const scenario = customerScenarios[scenarioIndex]
  const disposition = dispositionLevels[calmLevel]
  const resolved = calmLevel === dispositionLevels.length - 1
  const targetLabels = useMemo(
    () =>
      scenario.targetSkills.map(
        (skillId) => skillGroups.find((group) => group.id === skillId)?.label,
      ),
    [scenario.targetSkills],
  )

  function submitResponse(event) {
    event.preventDefault()

    if (!response.trim() || resolved) return

    const result = scanResponse(response, scenario)
    const nextLevel = Math.min(dispositionLevels.length - 1, calmLevel + result.reduction)
    const didResolve = nextLevel === dispositionLevels.length - 1
    const advice = buildAdvice(result, didResolve)

    setCalmLevel(nextLevel)
    setFeedback({
      ...result,
      didResolve,
      advice,
      message:
        result.reduction > 0
          ? 'Nice. That response used language that lowers tension.'
          : 'Try adding empathy, ownership, a clarifying check, and a clear next step.',
    })

    if (didResolve) {
      setWins((count) => count + 1)
    }

    setAdvicePopup({
      advice,
      didResolve,
    })
    setResponse('')
  }

  function nextCustomer() {
    setScenarioIndex((index) => pickScenarioIndex(index))
    setCalmLevel(0)
    setResponse('')
    setFeedback(null)
    setAdvicePopup(null)
    setRound((count) => count + 1)
  }

  function closeAdvice() {
    setAdvicePopup(null)
  }

  return (
    <div className="deescalation-game">
      <section className="deescalation-brief">
        <div>
          <p className="eyebrow">Call Center Practice</p>
          <h2>DoveTalk Lab</h2>
          <p>
            Type a response that validates the customer, takes ownership, clarifies the
            FirstNet issue, and gives a next step. Better language lowers the customer&apos;s
            visible tension.
          </p>
        </div>
        <div className="deescalation-score">
          <span>Round {round}</span>
          <span>Wins {wins}</span>
          <span>{disposition.label}</span>
        </div>
      </section>

      <section className="deescalation-board">
        <div className="dove-panel">
          <img className="dove-avatar" src={doveCoach} alt="Dove coach avatar" />
          <h3>Coach cue</h3>
          <p>Use calm language. Avoid blame, shortcuts, or “policy-only” replies.</p>
          <div className="skill-tags">
            {skillGroups.map((group) => (
              <span key={group.id}>{group.label}</span>
            ))}
          </div>
        </div>

        <div className={`customer-panel ${disposition.className}`}>
          <div className="customer-header">
            <img className="customer-face" src={customerFace} alt={`${scenario.name} customer portrait`} />
            <div>
              <p className="eyebrow">Customer</p>
              <h3>{scenario.name}</h3>
              <p>{scenario.role}</p>
            </div>
          </div>

          <article className="customer-concern">
            <h4>Concern</h4>
            <p>{scenario.concern}</p>
          </article>

          <article className="customer-context">
            <h4>Fact anchor</h4>
            <p>{scenario.context}</p>
          </article>

          <div className="calm-meter" aria-label={`Customer disposition: ${disposition.label}`}>
            {dispositionLevels.map((level, index) => (
              <span
                className={index <= calmLevel ? 'filled' : ''}
                key={level.label}
                title={level.label}
              />
            ))}
          </div>
          <p className="disposition-copy">{disposition.description}</p>
        </div>
      </section>

      <section className="response-panel">
        <div className="target-skills">
          <strong>Best skills for this call:</strong>
          {targetLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <form className="deescalation-form" onSubmit={submitResponse}>
          <textarea
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Example: I understand why that bill is frustrating. I can help review the account, confirm the discount timing, and walk through the next step with you."
            aria-label="Type your de-escalation response"
          />
          <button type="submit" disabled={resolved}>
            Scan response
          </button>
        </form>

        {feedback && (
          <div className={`deescalation-feedback ${feedback.didResolve ? 'won' : ''}`}>
            <strong>{feedback.didResolve ? 'Issue resolved.' : feedback.message}</strong>
            <p>{feedback.advice}</p>
            <p>
              Matched:{' '}
              {feedback.matchedGroups.length > 0
                ? feedback.matchedGroups.map((group) => group.label).join(', ')
                : 'No ideal de-escalation keywords yet'}
            </p>
            {feedback.matchedEscalators.length > 0 && (
              <p>Avoided next time: {feedback.matchedEscalators.join(', ')}</p>
            )}
            {!feedback.didResolve && (
              <ul>
                {skillGroups
                  .filter((group) => !feedback.matchedGroups.some((match) => match.id === group.id))
                  .slice(0, 2)
                  .map((group) => (
                    <li key={group.id}>{group.coach}</li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {resolved && (
          <button className="primary next-customer" type="button" onClick={nextCustomer}>
            Start next customer
          </button>
        )}
      </section>

      {advicePopup && (
        <div className="dove-advice-popover" role="dialog" aria-live="polite" aria-label="DoveTalk advice">
          <button className="dove-popover-close" type="button" onClick={closeAdvice} aria-label="Close advice">
            ×
          </button>
          <img className="dove-popover-avatar" src={doveCoach} alt="Dove coach swooping in" />
          <div>
            <p className="eyebrow">DoveTalk Assist</p>
            <h3>{advicePopup.didResolve ? 'Calm landing.' : 'Quick coaching swoop.'}</h3>
            <p>{advicePopup.advice}</p>
          </div>
        </div>
      )}
    </div>
  )
}
