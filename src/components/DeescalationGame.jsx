import { useMemo, useState } from 'react'
import customerFace from '../assets/customer-face.png'
import callCoach from '../assets/call-coach.png'

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

const scriptCheckpoints = [
  {
    id: 'greeting',
    label: 'Greeting',
    keywords: ['thank', 'thanks', 'calling', 'today', 'help', 'assist'],
    coach: 'Start with a greeting and a helpful reason for the conversation.',
  },
  {
    id: 'verification',
    label: 'Verification',
    keywords: ['verify', 'confirm', 'account', 'access', 'sign in', 'login', 'firstnet central'],
    coach: 'Verify the account path before discussing account-specific steps.',
  },
  {
    id: 'eligibility',
    label: 'Eligibility',
    keywords: ['eligible', 'eligibility', 'subscriber paid', 'agency paid', 'first responder', 'public safety', 'verify eligibility'],
    coach: 'Address eligibility or account type without guessing from job title alone.',
  },
  {
    id: 'accountInfo',
    label: 'Account Info',
    keywords: ['line', 'device', 'sim', 'esim', 'plan', 'family', 'bill', 'account type'],
    coach: 'Ask or state the account detail that determines the right recommendation.',
  },
  {
    id: 'billingSuggestions',
    label: 'Billing Suggestions',
    keywords: ['autopay', 'paperless', 'discount', 'taxes', 'fees', 'price', 'billing', 'bill', 'within two bills', 'plan'],
    coach: 'Give a billing or plan suggestion tied to the customer concern.',
  },
  {
    id: 'talkingPoints',
    label: 'Talking Points',
    keywords: ['priority', 'preemption', 'first priority', 'dedicated core', 'hotspot', 'commercial network', 'support', 'firstnet assist'],
    coach: 'Use a relevant value point such as priority, support, hotspot, or family-line boundaries.',
  },
  {
    id: 'close',
    label: 'Close',
    keywords: ['next step', 'summary', 'does that work', 'sound good', 'compare', 'review one more', 'before we end'],
    coach: 'Close with a summary, next step, and agreement check.',
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
    dummyInfo: {
      verification: 'Dummy verification: ZIP 80214, callback ending 4412, security word "Ladder".',
      account: 'Dummy account info: Subscriber Paid, one phone line, FirstNet Unlimited plan, AutoPay enrolled last bill cycle, paperless billing active.',
    },
    targetSkills: ['empathy', 'ownership', 'clarify', 'reassure'],
  },
  {
    name: 'Andre',
    role: 'ER nurse',
    concern:
      'Andre wants FirstNet and Family, but his spouse thinks every family line will get FirstNet priority access.',
    context:
      'Useful facts: FirstNet and Family is for verified Subscriber Paid Users; family lines use AT&T commercial network service, not the FirstNet network.',
    dummyInfo: {
      verification: 'Dummy verification: ZIP 60622, callback ending 1180, security word "Shift".',
      account: 'Dummy account info: Subscriber Paid user, one FirstNet line, two family lines being discussed for AT&T commercial network service.',
    },
    targetSkills: ['empathy', 'clarify', 'reassure', 'close'],
  },
  {
    name: 'Jules',
    role: 'Agency administrator',
    concern:
      'Jules is upset because they do not know whether a department account should use Subscriber Paid or Agency Paid setup.',
    context:
      'Useful facts: Subscriber Paid is individual-paid service; agency plans are for public safety organizations providing service to employees or personnel.',
    dummyInfo: {
      verification: 'Dummy verification: agency contact email admin@example.test, department code 7321, callback ending 9055.',
      account: 'Dummy account info: Public safety agency account discussion, 18 potential employee lines, deciding between individual-paid and agency-paid setup.',
    },
    targetSkills: ['empathy', 'ownership', 'clarify', 'reassure'],
  },
  {
    name: 'Priya',
    role: 'New FirstNet phone user',
    concern:
      'Priya is frustrated because her compatible phone needs eSIM activation and she does not know where to start.',
    context:
      'Useful facts: FirstNet Help has Activate eSIM resources, including device-specific activation tutorials.',
    dummyInfo: {
      verification: 'Dummy verification: ZIP 30309, callback ending 7724, security word "Badge".',
      account: 'Dummy account info: New FirstNet phone user, compatible device, eSIM activation not completed yet, needs activation steps.',
    },
    targetSkills: ['empathy', 'ownership', 'reassure', 'close'],
  },
  {
    name: 'Cole',
    role: 'Field supervisor',
    concern:
      'Cole is worried because personnel in the field need support and a device diagnostic path during an incident.',
    context:
      'Useful facts: FirstNet Assist provides dedicated care, live chat text, one-button voice contact, device diagnostics, and uplift workflows.',
    dummyInfo: {
      verification: 'Dummy verification: supervisor ID FS-204, callback ending 6630, region code North.',
      account: 'Dummy account info: Field supervisor, agency-supported team, multiple active devices, needs FirstNet Assist and device diagnostic guidance.',
    },
    targetSkills: ['empathy', 'clarify', 'reassure', 'close'],
  },
  {
    name: 'Sam',
    role: 'Volunteer responder',
    concern:
      'Sam says eligibility feels confusing and does not know whether to trust a job title alone.',
    context:
      'Useful facts: eligibility should be verified through official FirstNet workflows; examples include first responders and people who support first responders.',
    dummyInfo: {
      verification: 'Dummy verification: ZIP 85004, callback ending 2901, volunteer organization "County Search Team".',
      account: 'Dummy account info: Volunteer responder, eligibility not completed, needs official FirstNet eligibility verification before plan guidance.',
    },
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

function createStartingConversation(scenario) {
  return [
    {
      speaker: 'customer',
      tone: 'Escalated',
      text: scenario.concern,
    },
  ]
}

function scanResponse(response, scenario) {
  const normalized = response.toLowerCase()
  const matchedGroups = skillGroups.filter((group) =>
    group.keywords.some((keyword) => normalized.includes(keyword)),
  )
  const matchedCheckpoints = scriptCheckpoints.filter((checkpoint) =>
    checkpoint.keywords.some((keyword) => normalized.includes(keyword)),
  )
  const matchedEscalators = escalationWords.filter((word) => normalized.includes(word))
  const targetMatches = matchedGroups.filter((group) => scenario.targetSkills.includes(group.id))
  const checkpointMatches = new Set(matchedCheckpoints.map((checkpoint) => checkpoint.id))
  const requiredCheckpointCount = scriptCheckpoints.length
  const skillBonus = Math.min(2, targetMatches.length)
  const reduction = Math.max(
    0,
    Math.floor(checkpointMatches.size / 2) + skillBonus - matchedEscalators.length,
  )
  const didHitAllCheckpoints = checkpointMatches.size === requiredCheckpointCount

  return {
    matchedGroups,
    matchedCheckpoints,
    matchedEscalators,
    reduction,
    didHitAllCheckpoints,
  }
}

function getMissingCheckpoints(result) {
  return scriptCheckpoints.filter(
    (checkpoint) => !result.matchedCheckpoints.some((match) => match.id === checkpoint.id),
  )
}

function getRequestedDummyInfo(response) {
  const normalized = response.toLowerCase()
  const asksVerification = ['verify', 'verification', 'confirm', 'security', 'zip', 'callback'].some(
    (word) => normalized.includes(word),
  )
  const asksAccount = ['account', 'line', 'device', 'plan', 'bill', 'eligibility', 'subscriber paid', 'agency paid'].some(
    (word) => normalized.includes(word),
  )

  return {
    asksVerification,
    asksAccount,
  }
}

function buildAdvice(result, didResolve) {
  const matchedLabels = result.matchedGroups.map((group) => group.label)
  const missingCheckpoints = getMissingCheckpoints(result)
    .slice(0, 2)
    .map((checkpoint) => checkpoint.coach)

  if (didResolve) {
    return `ResolveLab coaching: Complete call flow. You used ${matchedLabels.join(', ') || 'calming language'} and covered every script checkpoint before closing.`
  }

  if (result.reduction > 0) {
    return `ResolveLab coaching: Good progress, but the customer is not fully resolved until every script checkpoint is covered. Next, add: ${missingCheckpoints.join(' ')}`
  }

  return `ResolveLab coaching: Try again with the full call flow. ${missingCheckpoints.join(' ')}`
}

function buildCustomerReply(scenario, result, didResolve, nextDisposition, requestedInfo) {
  const missingCheckpoints = getMissingCheckpoints(result)
  const missingLabels = missingCheckpoints.map((checkpoint) => checkpoint.label)
  const matchedLabels = result.matchedGroups.map((group) => group.label)
  const firstMissing = missingLabels.slice(0, 2).join(' and ')
  const details = [
    requestedInfo.asksVerification ? scenario.dummyInfo.verification : '',
    requestedInfo.asksAccount ? scenario.dummyInfo.account : '',
  ].filter(Boolean)
  const detailText = details.length > 0 ? ` ${details.join(' ')}` : ''

  if (didResolve) {
    return `Okay, that finally makes sense. You acknowledged the issue, verified the right account path, tied the eligibility and billing details to my situation, and gave me a clear next step. I feel comfortable moving forward.${detailText}`
  }

  if (result.matchedEscalators.length > 0) {
    return `I still feel brushed off. Words like "${result.matchedEscalators[0]}" make this sound like my concern is being dismissed. Can you slow down, verify what applies to my FirstNet account, and explain the next step clearly?${detailText}`
  }

  if (result.reduction === 0) {
    return `I am still frustrated because I do not hear a complete path yet. Please start by acknowledging the concern, then confirm the account or eligibility details before giving me a billing or plan answer.${detailText}`
  }

  if (nextDisposition.label === 'Tense') {
    return `That helps a little, especially the ${matchedLabels.join(' and ') || 'calmer tone'}, but I am not settled yet. I still need you to cover ${firstMissing || 'the missing account details'} so I know this answer applies to my situation.${detailText}`
  }

  if (nextDisposition.label === 'Concerned') {
    return `I am listening now. Before I agree, please connect this back to ${scenario.role.toLowerCase()} details and finish the part about ${firstMissing || 'the final next step'} in plain language.${detailText}`
  }

  return `I am closer to calm, but I need the last piece before we wrap up: ${firstMissing || 'a clear summary and agreement check'}.${detailText}`
}

export default function DeescalationGame() {
  const [roundState, setRoundState] = useState(() => {
    const scenarioIndex = pickScenarioIndex()

    return {
      scenarioIndex,
      conversation: createStartingConversation(customerScenarios[scenarioIndex]),
    }
  })
  const [calmLevel, setCalmLevel] = useState(0)
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [advicePopup, setAdvicePopup] = useState(null)
  const [round, setRound] = useState(1)
  const [wins, setWins] = useState(0)
  const [turns, setTurns] = useState(0)
  const { scenarioIndex, conversation } = roundState
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
    const requestedInfo = getRequestedDummyInfo(response)
    const nextLevel = Math.min(dispositionLevels.length - 1, calmLevel + result.reduction)
    const didResolve = nextLevel === dispositionLevels.length - 1 && result.didHitAllCheckpoints
    const displayedNextLevel = didResolve
      ? dispositionLevels.length - 1
      : Math.min(nextLevel, dispositionLevels.length - 2)
    const customerReply = buildCustomerReply(
      scenario,
      result,
      didResolve,
      dispositionLevels[displayedNextLevel],
      requestedInfo,
    )
    const advice = buildAdvice(result, didResolve)

    setCalmLevel(displayedNextLevel)
    setTurns((count) => count + 1)
    setRoundState((current) => ({
      ...current,
      conversation: [
        ...current.conversation,
        {
          speaker: 'agent',
          tone: 'Response',
          text: response.trim(),
        },
        {
          speaker: 'customer',
          tone: dispositionLevels[displayedNextLevel].label,
          text: customerReply,
        },
      ],
    }))
    setFeedback({
      ...result,
      didResolve,
      advice,
      message:
        result.reduction > 0
          ? 'Nice. That response lowered tension. Keep going until every script checkpoint is covered.'
          : 'Try the full flow: greeting, verification, eligibility, account info, billing suggestion, talking point, and close.',
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
    setRoundState((current) => {
      const nextIndex = pickScenarioIndex(current.scenarioIndex)

      return {
        scenarioIndex: nextIndex,
        conversation: createStartingConversation(customerScenarios[nextIndex]),
      }
    })
    setCalmLevel(0)
    setResponse('')
    setFeedback(null)
    setAdvicePopup(null)
    setTurns(0)
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
          <h2>ResolveLab</h2>
          <p>
            Type a response that validates the customer, takes ownership, clarifies the
            FirstNet issue, and gives a next step. Better language lowers the customer&apos;s
            visible tension.
          </p>
        </div>
        <div className="deescalation-score">
          <span>Round {round}</span>
          <span>Wins {wins}</span>
          <span>Turns {turns}</span>
        </div>
      </section>

      <section className="deescalation-board">
        <div className="coach-panel">
          <img className="coach-avatar" src={callCoach} alt="Professional call coach portrait" />
          <h3>Resolution Coach</h3>
          <p>Use calm language. Avoid blame, shortcuts, or “policy-only” replies.</p>
          <div className="skill-tags">
            {skillGroups.map((group) => (
              <span key={group.id}>{group.label}</span>
            ))}
          </div>
          <div className="script-call-flow">
            <strong>Script call flow</strong>
            {scriptCheckpoints.map((checkpoint) => (
              <span key={checkpoint.id}>{checkpoint.label}</span>
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
              <span>{disposition.label}</span>
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

          <article className="customer-context">
            <h4>Simulation note</h4>
            <p>Verification and account details in ResolveLab are fictional practice data only.</p>
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
        <article className="conversation-log" aria-label="Live ResolveLab conversation">
          <div className="conversation-log-header">
            <div>
              <p className="eyebrow">Live Interaction</p>
              <h3>Customer responds after every scan</h3>
            </div>
            <span>{disposition.label}</span>
          </div>
          <div className="conversation-thread">
            {conversation.map((message, index) => (
              <div className={`conversation-message ${message.speaker}`} key={`${message.speaker}-${index}`}>
                <strong>
                  {message.speaker === 'customer' ? `${scenario.name} · ${message.tone}` : 'You · Rep response'}
                </strong>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="target-skills">
          <strong>Best skills for this call:</strong>
          {targetLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="target-skills script-targets">
          <strong>Required script checkpoints:</strong>
          {scriptCheckpoints.map((checkpoint) => (
            <span key={checkpoint.id}>{checkpoint.label}</span>
          ))}
        </div>

        <form className="deescalation-form" onSubmit={submitResponse}>
          <textarea
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Example: Thanks for calling. I understand why this is frustrating, and I can help. First I want to verify the account and confirm whether this is Subscriber Paid, Agency Paid, or family service. Then I can review the bill, plan, device, or eligibility details, explain any discount/tax/fee timing, and summarize the next step before we end."
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
            <div className="checkpoint-results">
              {scriptCheckpoints.map((checkpoint) => {
                const isMatched = feedback.matchedCheckpoints.some(
                  (match) => match.id === checkpoint.id,
                )

                return (
                  <span className={isMatched ? 'hit' : 'miss'} key={checkpoint.id}>
                    {isMatched ? '✓' : '•'} {checkpoint.label}
                  </span>
                )
              })}
            </div>
            {feedback.matchedEscalators.length > 0 && (
              <p>Avoided next time: {feedback.matchedEscalators.join(', ')}</p>
            )}
            {!feedback.didResolve && (
              <ul>
                {scriptCheckpoints
                  .filter((checkpoint) =>
                    !feedback.matchedCheckpoints.some((match) => match.id === checkpoint.id),
                  )
                  .slice(0, 2)
                  .map((checkpoint) => (
                    <li key={checkpoint.id}>{checkpoint.coach}</li>
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
        <div className="coach-advice-popover" role="dialog" aria-live="polite" aria-label="ResolveLab coaching">
          <button className="coach-popover-close" type="button" onClick={closeAdvice} aria-label="Close advice">
            ×
          </button>
          <img className="coach-popover-avatar" src={callCoach} alt="Professional call coach" />
          <div>
            <p className="eyebrow">ResolveLab Assist</p>
            <h3>{advicePopup.didResolve ? 'Customer stabilized.' : 'Quick coaching note.'}</h3>
            <p>{advicePopup.advice}</p>
          </div>
        </div>
      )}
    </div>
  )
}
