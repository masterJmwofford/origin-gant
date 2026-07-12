const defaultPhrases = [
  'Prices and eligibility rules can change, so verify in FirstNet Central or with a FirstNet specialist before quoting to a customer.',
  'after eligible AutoPay and paperless billing discount',
  'discounts start within two bills',
  'taxes and fees are extra',
  'bill payment without logging in is not available at this time',
  'redirected to an AT&T account overview where the bill linked to the FirstNet account can be viewed',
  'FirstNet plans require a FirstNet Capable device',
  'provisioned with a FirstNet Trio SIM or eSIM card',
  'FirstNet individual plans are described for public safety professionals who pay for their own service',
  'FirstNet agency plans are described for public safety organizations that provide service to employees and personnel',
  'Subscriber Paid Users can qualify for FirstNet and Family when verified and on eligible plans',
  'FirstNet and Family is available only to verified FirstNet Subscriber Paid Users',
  'Family members do not get access to the FirstNet network; FirstNet is exclusive to public safety.',
  'Family members receive AT&T commercial network service with discounted pricing on eligible AT&T plans.',
  'can mix FirstNet and AT&T services up to 20 lines per account',
  'Each FirstNet user on the account is limited to one phone, watch, tablet, and hotspot',
  'the customer must visit a store to combine accounts',
  'No. FirstNet and Family is presented as a Subscriber Paid User offer, not as an agency-plan feature.',
  'Mobile hotspot is included.',
  'Unlimited mobile hotspot is included.',
  'Unlimited talk, text and high-speed data in 20 Latin American countries at no extra cost; coverage and data speeds vary.',
  'Includes 20GB of international data per month for over 210 destinations; after 20GB, international data speeds may be reduced to a maximum of 512 Kbps.',
  'Monthly access for one smartwatch and one tablet per line is included at no extra cost.',
  'Includes 50% off the monthly plan price of one tablet or wearable per Premium 2.0 phone line.',
  '100GB hotspot data per line per month.',
  '50GB hotspot data per line per month.',
  '3GB hotspot data per line per month.',
  'After 5GB, AT&T may temporarily slow data speeds if the network is busy.',
  'After 100GB, AT&T may temporarily slow data speeds if the network is busy.',
  'After 50GB, hotspot speeds are slowed to a maximum of 128 Kbps.',
  'After 3GB, hotspot speeds are slowed to a maximum of 128 Kbps.',
  'Pooled agency options include 2GB, 5GB, 50GB, 100GB, 500GB, and 1000GB plan groupings.',
  'Wireless Broadband agency options include Laptop, Core, Pro, and Ultra speed tiers.',
  'Wireless Broadband plans include 175GB of data per billing cycle and predictable bills month to month.',
  'If Wireless Broadband usage exceeds 175GB for three consecutive billing periods, AT&T will convert the billing account to a FirstNet Mobile Pooled rate plan for data-only devices.',
  'Agency unlimited, pooled data, or Wireless Broadband plan categories.',
  'Individual FirstNet Value, Extra, Premium, or Elite plan options.',
  'eligible support person is personally signing up and paying',
  'public safety agency or organization is providing service to employees or personnel',
  'family lines use AT&T commercial network service',
  'the agency Wireless Broadband page is the direct source for organizational failover/connectivity use cases',
  'First Priority provides always-on priority and preemption across AT&T 5G, AT&T 4G commercial spectrum, and public safety Band 14 where supported.',
  'Eligibility should be checked through official FirstNet workflows instead of guessed from a role name alone.',
  'Use FirstNet Central, then Manage Services & Billing, to reach the AT&T account overview and view/pay the bill linked to the FirstNet account.',
  'FirstNet says bill pay without logging in is not available; the customer must log in to FirstNet Central and go to Manage Services & Billing.',
  'FirstNet says a Spanish bill view is not available, but a Spanish sample can be found through FirstNet Central FAQ and Billing.',
  'Use FirstNet Assist quick self-help diagnostics to help diagnose and resolve device issues.',
  'Use FirstNet Assist for uplift workflows, including viewing active uplift incidents/events nearby and requesting priority uplift with one click for personnel providing critical support.',
  'Call 800.574.7000 to speak with a FirstNet representative.',
  'Acknowledge the customer concern, clarify the account type or plan, then give the next verified self-service path.',
]

const differenceSignals = [
  ' only ',
  ' not ',
  ' no ',
  ' cannot ',
  ' must ',
  ' require',
  ' instead ',
  ' rather than ',
  ' unlike ',
  ' compared ',
  ' separate ',
  ' extra ',
  ' included ',
  ' unlimited ',
  ' after ',
  ' per month ',
  ' per billing cycle ',
  ' at no extra cost ',
  ' one bill ',
  ' up to ',
  ' limited to ',
  ' pay for their own ',
  ' providing service ',
  ' commercial network ',
  ' firstnet network ',
  ' agency ',
  ' subscriber paid ',
]

const distinctivePatterns = [
  /\$[\d,.]+(?:\/mo\.)?(?:\s*per\s+\w+)?/gi,
  /\b\d+(?:GB|Mbps|Kbps)\b(?:\s+of\s+[^.;:!?]+)?/gi,
  /\b\d+%\s+off\b/gi,
  /\b\d+\+?\s+lines?\b(?:\s+per\s+account)?/gi,
  /\b\d+\s+Latin American countries\b/gi,
  /\bover\s+\d+\s+destinations\b/gi,
  /\bwithin\s+\w+\s+bills\b/gi,
  /\bFirstNet and Family\b/gi,
  /\bSubscriber Paid Users?\b/gi,
  /\bAgency Paid\b/gi,
  /\bAT&T commercial network service\b/gi,
  /\bFirstNet network\b/gi,
  /\bWireless Broadband\b/gi,
  /\bpooled data plans?\b/gi,
  /\bmobile hotspot\b/gi,
  /\binternational data\b/gi,
  /\bSpanish (?:bill view|sample bill)\b/gi,
  /\bwithout logging in\b/gi,
]

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9%$]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function getClauseScore(clause) {
  const normalized = ` ${clause.toLowerCase()} `

  return differenceSignals.reduce((score, signal) => {
    if (!normalized.includes(signal)) return score
    return score + (signal.length > 8 ? 3 : 1)
  }, 0)
}

function getBestDifferenceClause(text) {
  const clauses = text.match(/[^.;:!?]+[.;:!?]?/g) || []
  const ranked = clauses
    .map((clause) => ({
      clause: clause.trim(),
      score: getClauseScore(clause),
    }))
    .filter((item) => item.clause.length > 14)
    .sort((a, b) => b.score - a.score || b.clause.length - a.clause.length)

  if (ranked.length === 0 || ranked[0].score === 0) return ''

  return ranked[0].clause
}

function getUniquePatternMatches(text, compareWith) {
  const compareCorpus = normalize(compareWith.join(' '))
  const matches = []

  distinctivePatterns.forEach((pattern) => {
    Array.from(text.matchAll(pattern)).forEach((match) => {
      const value = match[0].trim()

      if (value.length < 3 || compareCorpus.includes(normalize(value))) return

      matches.push(value)
    })
  })

  return matches
}

function getComparedDifference(text, compareWith) {
  if (!compareWith || compareWith.length === 0) return []

  const compareCorpus = normalize(compareWith.join(' '))
  const directMatches = getUniquePatternMatches(text, compareWith)

  if (directMatches.length > 0) return directMatches

  const clauses = text.match(/[^.;:!?]+[.;:!?]?/g) || []
  const ranked = clauses
    .map((clause) => {
      const cleanClause = clause.trim()
      const normalizedClause = normalize(cleanClause)
      const words = normalizedClause.split(' ').filter((word) => word.length > 3)
      const repeatedWords = words.filter((word) => compareCorpus.includes(word)).length
      const newWordRatio = words.length === 0 ? 0 : (words.length - repeatedWords) / words.length

      return {
        clause: cleanClause,
        score: getClauseScore(cleanClause) + newWordRatio * 5,
      }
    })
    .filter((item) => item.clause.length > 14 && !compareCorpus.includes(normalize(item.clause)))
    .sort((a, b) => b.score - a.score || b.clause.length - a.clause.length)

  if (ranked.length === 0 || ranked[0].score < 2) return []

  return [ranked[0].clause]
}

export function getEagleHighlightMatches(text, phrases = defaultPhrases, compareWith = []) {
  const comparedMatches = getComparedDifference(text, compareWith)

  if (comparedMatches.length > 0) return comparedMatches

  const phraseMatches = phrases
    .filter((phrase) => text.toLowerCase().includes(phrase.toLowerCase()))
    .sort((a, b) => b.length - a.length)

  if (phraseMatches.length > 0) return phraseMatches

  const bestClause = getBestDifferenceClause(text)

  return bestClause ? [bestClause] : []
}

export function getEagleHighlightScore(text, compareWith = [], phrases = defaultPhrases) {
  if (typeof text !== 'string') return 0

  const matches = getEagleHighlightMatches(text, phrases, compareWith)

  if (matches.length === 0) return 0

  const primaryMatch = matches[0]
  const comparedWeight = compareWith.length > 0 && getComparedDifference(text, compareWith).length > 0 ? 100 : 0

  return comparedWeight + getClauseScore(primaryMatch) + primaryMatch.length / 10
}

