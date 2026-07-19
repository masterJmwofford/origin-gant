import { useState } from 'react'

const routingRules = [
  {
    tab: 'billing',
    keywords: ['bill', 'billing', 'payment', 'pay', 'price', 'pricing', 'plan', 'plans'],
    reply:
      'I opened Billing. Start with the plan matrix, then take the billing quiz right below it.',
  },
  {
    tab: 'eligibility',
    keywords: ['eligible', 'eligibility', 'agency', 'subscriber', 'paid', 'roadmap', 'scenario'],
    reply:
      'I opened Eligibility. The roadmap compares Subscriber Paid and Agency Paid paths, then lets you practice scenarios.',
  },
  {
    tab: 'index-cards',
    keywords: ['index', 'card', 'cards', 'flashcard', 'term', 'terms', 'quiz', 'study'],
    reply:
      'I opened Index Cards. Use the search box to narrow the cards, then try the quiz beside the same topic set.',
  },
  {
    tab: 'sso',
    keywords: ['sso', 'self', 'service', 'assist', 'central', 'esim', 'support', 'chat'],
    reply:
      'I opened SSO Options. Match each customer scenario to the best FirstNet self-service path.',
  },
  {
    tab: 'mesa-breaker',
    keywords: ['mesa', 'breaker', 'brick', 'core', 'laser', 'game'],
    reply:
      'I opened MESA Breaker. Pilot the launcher and fire CORE shots to clear every MESA brick.',
  },
  {
    tab: 'deescalation',
    keywords: ['resolvelab', 'resolve', 'deescalation', 'de-escalation', 'calm', 'angry', 'customer', 'call', 'center'],
    reply:
      'I opened Scenario. Help the customer stabilize with empathy, ownership, and a clear next step.',
  },
]

function findRoute(message) {
  const normalized = message.toLowerCase()

  return routingRules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  )
}

export default function SupportAssistant({ activeTab, navItems, onNavigate }) {
  const [message, setMessage] = useState('')
  const [assistantReply, setAssistantReply] = useState(
    'Ask me where to study next. I can open Billing, Eligibility, Index Cards, SSO Options, MESA Breaker, or Scenario.',
  )

  function submitMessage(event) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage) return

    const route = findRoute(trimmedMessage)

    if (!route) {
      setAssistantReply(
        'I can route you to Billing, Eligibility, Index Cards, SSO Options, MESA Breaker, or Scenario. Try asking for one of those sections.',
      )
      setMessage('')
      return
    }

    onNavigate(route.tab)
    setAssistantReply(route.reply)
    setMessage('')
  }

  return (
    <aside className="support-assistant">
      <div className="support-assistant-mark" aria-hidden="true">
        <span />
      </div>
      <div className="support-assistant-copy">
        <p className="eyebrow">Support Guide</p>
        <h2>Where should we go next?</h2>
        <p>{assistantReply}</p>
      </div>

      <form className="support-form" onSubmit={submitMessage}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Try: show me billing, Scenario, MESA breaker..."
          aria-label="Ask the support guide where to navigate"
        />
        <button type="submit">Go</button>
      </form>

      <div className="support-shortcuts">
        {navItems.map((item) => (
          <button
            className={activeTab === item.id ? 'active' : ''}
            key={item.id}
            type="button"
            onClick={() => {
              onNavigate(item.id)
              setAssistantReply(`I opened ${item.label}. ${item.description}.`)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}
