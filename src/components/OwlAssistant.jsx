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
]

function findRoute(message) {
  const normalized = message.toLowerCase()

  return routingRules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  )
}

export default function OwlAssistant({ activeTab, navItems, onNavigate }) {
  const [message, setMessage] = useState('')
  const [assistantReply, setAssistantReply] = useState(
    'Ask me where to study next. I can open Billing, Eligibility, Index Cards, or SSO Options.',
  )

  function submitMessage(event) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage) return

    const route = findRoute(trimmedMessage)

    if (!route) {
      setAssistantReply(
        'I can route you to Billing, Eligibility, Index Cards, or SSO Options. Try asking for one of those sections.',
      )
      setMessage('')
      return
    }

    onNavigate(route.tab)
    setAssistantReply(route.reply)
    setMessage('')
  }

  return (
    <aside className="owl-assistant">
    <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/bf5c3b5c-e63a-4b60-a332-3e658400fce7/dgp1otz-9852feb5-f4c6-4f08-9fc3-96e125d6e29f.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9iZjVjM2I1Yy1lNjNhLTRiNjAtYTMzMi0zZTY1ODQwMGZjZTcvZGdwMW90ei05ODUyZmViNS1mNGM2LTRmMDgtOWZjMy05NmUxMjVkNmUyOWYuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.YOMR_oY2ZnDgD2gLlTJ2fTZGcuz9qH9rn8AwIWVJing" alt="" className="owlAvi" />
      <div className="owl-assistant-copy">
        <p className="eyebrow">Owl AI Guide</p>
        <h2>Where should we fly next?</h2>
        <p>{assistantReply}</p>
      </div>

      <form className="owl-form" onSubmit={submitMessage}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Try: show me billing, SSO help, index cards..."
          aria-label="Ask the owl guide where to navigate"
        />
        <button type="submit">Go</button>
      </form>

      <div className="owl-shortcuts">
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
