import { useState } from 'react'

const upgradeRounds = [
  {
    id: 'iphone-17-pro',
    device: 'Apple iPhone 17 Pro',
    category: 'Certified smartphone',
    categoryNote:
      'The FirstNet phones page lists this device among certified phones/devices compatible with the FirstNet Evolved Packet Core.',
    offer: 'Get iPhone 17 Pro for $0.',
    pricingNote:
      'This is a published promotional offer, so the requirement card matters before quoting it.',
    correctRequirement:
      'Eligible trade-in of $290 or more, installment plan, and FirstNet Extra 2.0 plan or higher, minimum $68/mo.',
    wrongRequirements: [
      'Trade-in of $95 or more and any eligible plan.',
      'Verify current pricing first because no device-specific price is published.',
      'FirstNet Ready device and FirstNet SIM card only.',
    ],
    dealer:
      'Upgrade processed: iPhone 17 Pro, $0 offer, eligible trade-in $290+, installment plan, and FirstNet Extra 2.0 or higher are together.',
  },
  {
    id: 'galaxy-s26-ultra',
    device: 'Samsung Galaxy S26 Ultra',
    category: 'Certified smartphone',
    categoryNote:
      'The FirstNet phones page lists this device among certified phones/devices compatible with the FirstNet Evolved Packet Core.',
    offer: 'Get up to $1,100 off the Samsung Galaxy S26 Ultra.',
    pricingNote:
      'This is a published promotional offer, so pair it with the matching trade-in and plan requirement.',
    correctRequirement: 'Trade-in of $95 or more and an eligible plan. Terms and restrictions apply.',
    wrongRequirements: [
      'Trade-in of $290 or more, installment plan, and FirstNet Extra 2.0 plan or higher.',
      'Verify current pricing first because no device-specific price is published.',
      'FirstNet SIM card and possible software update only.',
    ],
    dealer:
      'Upgrade processed: Galaxy S26 Ultra, up to $1,100 off, trade-in $95+, and eligible plan are together.',
  },
  {
    id: 'pixel-10-pro-xl',
    device: 'Google Pixel 10 Pro XL',
    category: 'Certified smartphone',
    categoryNote:
      'The FirstNet phones page lists this device among certified phones/devices compatible with the FirstNet Evolved Packet Core.',
    offer: 'No device-specific price offer was published on the FirstNet phones page used for this game.',
    pricingNote:
      'When no price offer is published in the source, the correct play is to verify current pricing before quoting.',
    correctRequirement:
      'Verify current offer before quoting price. FirstNet benefits require a FirstNet Ready device and FirstNet SIM card.',
    wrongRequirements: [
      'Trade-in of $95 or more and an eligible plan.',
      'Trade-in of $290 or more and FirstNet Extra 2.0 plan or higher.',
      'Quote the customer $0 because it is a certified smartphone.',
    ],
    dealer:
      'Upgrade processed safely: Pixel 10 Pro XL is certified, but current pricing must be verified before quoting.',
  },
  {
    id: 'sonim-xp5-plus-5g',
    device: 'Sonim XP5+ 5G',
    category: 'Certified rugged / specialty device',
    categoryNote:
      'The FirstNet phones page lists this device among certified phones/devices compatible with the FirstNet Evolved Packet Core.',
    offer: 'No device-specific price offer was published on the FirstNet phones page used for this game.',
    pricingNote:
      'Rugged or specialty devices still need offer verification when the source does not publish a specific promo.',
    correctRequirement:
      'Verify current offer before quoting price. FirstNet Ready devices may need a FirstNet SIM card and sometimes a software update.',
    wrongRequirements: [
      'Trade-in of $95 or more and an eligible plan.',
      'Trade-in of $290 or more and FirstNet Extra 2.0 plan or higher.',
      'Quote up to $1,100 off because it is a certified device.',
    ],
    dealer:
      'Upgrade processed safely: Sonim XP5+ 5G is certified, but the quote should wait until current pricing is verified.',
  },
]

const learningSteps = [
  {
    title: 'Device category',
    detail:
      'First identify what kind of FirstNet device is on the table: certified smartphone, rugged device, or another FirstNet Ready device.',
  },
  {
    title: 'Pricing status',
    detail:
      'If the source publishes a promo, match it to its requirement. If no promo is published, do not invent a price.',
  },
  {
    title: 'Requirement',
    detail:
      'The upgrade only processes when the requirement card matches the device and offer: trade-in value, eligible plan, installment, SIM, or verification step.',
  },
]

const deviceTerminology = [
  {
    term: 'FirstNet Ready',
    category: 'Device status',
    plain:
      'A device designation for devices tested and approved to operate on FirstNet.',
    whyItMatters:
      'Use this before talking upgrade benefits, because FirstNet service depends on a compatible device path.',
  },
  {
    term: 'FirstNet Capable',
    category: 'Device status',
    plain:
      'The app study data uses this for a device that can be provisioned for FirstNet service.',
    whyItMatters:
      'Plans and activation should be paired with a capable device and a FirstNet SIM or eSIM.',
  },
  {
    term: 'Certified device',
    category: 'Device status',
    plain:
      'A device listed by FirstNet as certified or compatible with the FirstNet Evolved Packet Core.',
    whyItMatters:
      'Certification helps you know the device belongs in the FirstNet device conversation.',
  },
  {
    term: 'FirstNet Trio SIM',
    category: 'Activation',
    plain:
      'A physical SIM option used for FirstNet activation.',
    whyItMatters:
      'A device may be right, but the line still needs the right SIM path to activate correctly.',
  },
  {
    term: 'eSIM',
    category: 'Activation',
    plain:
      'A digital SIM supported by FirstNet on compatible devices, allowing activation without a removable physical SIM.',
    whyItMatters:
      'Some upgrades need an eSIM activation path instead of a physical SIM swap.',
  },
  {
    term: 'IMEI',
    category: 'Identifier',
    plain:
      'The device identifier used to identify the phone or connected device.',
    whyItMatters:
      'Use it when checking device compatibility, activation, or upgrade details.',
  },
  {
    term: 'ICCID',
    category: 'Identifier',
    plain:
      'The identifier for a physical SIM card.',
    whyItMatters:
      'It helps connect the correct physical SIM to the correct line during activation.',
  },
  {
    term: 'EID',
    category: 'Identifier',
    plain:
      'The identifier used for eSIM-capable devices.',
    whyItMatters:
      'It matters when the upgrade or activation uses digital SIM service.',
  },
  {
    term: 'HPUE',
    category: 'Capability',
    plain:
      'High-power user equipment can transmit at higher power on Band 14 than standard LTE devices.',
    whyItMatters:
      'It is a device capability conversation, not a generic discount or plan requirement.',
  },
  {
    term: 'Wireless Broadband',
    category: 'Device type',
    plain:
      'A FirstNet data option for routers, modems, hotspots, and other data-only connectivity needs.',
    whyItMatters:
      'Not every device conversation is a phone upgrade; some are data-only device needs.',
  },
  {
    term: 'Software update',
    category: 'Readiness',
    plain:
      'Some FirstNet Ready devices may need a software update.',
    whyItMatters:
      'A device can be eligible but still need an update before the experience is complete.',
  },
  {
    term: 'Trade-in',
    category: 'Pricing',
    plain:
      'A device promotion may depend on the customer trading in an eligible device at a required value.',
    whyItMatters:
      'Trade-in value is often the difference between quoting an offer correctly and quoting it too broadly.',
  },
  {
    term: 'Installment plan',
    category: 'Pricing',
    plain:
      'Some device offers require the new device to be purchased on an installment plan.',
    whyItMatters:
      'If the offer requires installments, do not separate the promo from that condition.',
  },
  {
    term: 'Verify current pricing',
    category: 'Pricing',
    plain:
      'When the source does not publish a device-specific offer, confirm current pricing before quoting.',
    whyItMatters:
      'This is the safe move that prevents invented prices.',
  },
]

const terminologyGroups = [
  {
    title: '1. Confirm the device',
    categories: ['Device status'],
  },
  {
    title: '2. Know activation and IDs',
    categories: ['Activation', 'Identifier'],
  },
  {
    title: '3. Recognize device types',
    categories: ['Capability', 'Device type', 'Readiness'],
  },
  {
    title: '4. Match pricing rules',
    categories: ['Pricing'],
  },
]

function shuffleCards(cards) {
  return [...cards].sort(() => Math.random() - 0.5)
}

function createRound(roundIndex = 0) {
  const round = upgradeRounds[roundIndex]
  const correctCard = {
    id: `${round.id}-correct`,
    isCorrect: true,
    title: 'Correct requirement',
    body: round.correctRequirement,
  }
  const wrongCards = shuffleCards(
    round.wrongRequirements.map((requirement, index) => ({
      id: `${round.id}-wrong-${index}`,
      isCorrect: false,
      title: 'Requirement card',
      body: requirement,
    })),
  ).slice(0, 2)
  const hand = shuffleCards([correctCard, ...wrongCards])

  return {
    round,
    hand,
    selectedCardId: null,
    processed: false,
  }
}

export default function DeviceUpgradeGame() {
  const [roundIndex, setRoundIndex] = useState(0)
  const [game, setGame] = useState(() => createRound(0))
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState(
    'Read the device and offer. Pick one requirement card. It will reveal and check itself.',
  )

  function playCard(cardId) {
    if (game.processed) return

    const playedCard = game.hand.find((card) => card.id === cardId)

    setGame((current) => ({
      ...current,
      selectedCardId: cardId,
      processed: playedCard?.isCorrect || false,
    }))
    setAttempts((count) => count + 1)

    if (!playedCard?.isCorrect) {
      setMessage(
        'Not a match. That requirement does not fit the device and offer. Pick another card.',
      )
      return
    }

    setScore((count) => count + 100)
    setMessage(game.round.dealer)
  }

  function nextRound() {
    const nextIndex = (roundIndex + 1) % upgradeRounds.length
    setRoundIndex(nextIndex)
    setGame(createRound(nextIndex))
    setMessage('New device. Read the table, then pick the matching requirement.')
  }

  function resetGame() {
    setRoundIndex(0)
    setGame(createRound(0))
    setScore(0)
    setAttempts(0)
    setMessage('Fresh table. Pick the requirement card that allows the upgrade to process.')
  }

  return (
    <div className="device-upgrade-game">
      <section className="upgrade-game-hero">
        <div>
          <p className="eyebrow">Device upgrade learning game</p>
          <h2>D-Vice</h2>
          <p>
            Learn the device language, read the device and offer, then pick the one
            requirement card that lets the upgrade process.
          </p>
        </div>
        <div className="upgrade-scoreboard" aria-label="Upgrade game score">
          <span>Device {roundIndex + 1}/{upgradeRounds.length}</span>
          <span>{score} pts</span>
          <span>{attempts} tries</span>
        </div>
      </section>

      <section className="device-terminology-casino" aria-label="FirstNet device terminology">
        <div className="terminology-marquee">
          <p className="eyebrow">D-Vice Academy</p>
          <h3>Learn the device language before you play.</h3>
          <p>
            Upgrade conversations are easier when you separate the device, activation path,
            identifiers, capabilities, and pricing requirements.
          </p>
        </div>
        <div className="terminology-chip-grid">
          {terminologyGroups.map((group) => (
            <article className="terminology-chip-card terminology-group-card" key={group.title}>
              <h4>{group.title}</h4>
              {deviceTerminology
                .filter((item) => group.categories.includes(item.category))
                .map((item) => (
                  <div className="terminology-mini-row" key={item.term}>
                    <span>{item.term}</span>
                    <p>{item.plain}</p>
                    <small>{item.whyItMatters}</small>
                  </div>
                ))}
            </article>
          ))}
        </div>
      </section>

      <section className="upgrade-explainer" aria-label="How FirstNet device upgrades work">
        <div className="dealer-avatar" aria-hidden="true">
          <span className="dealer-hat" />
          <span className="dealer-face">
            <i />
          </span>
          <span className="dealer-bowtie" />
        </div>
        <div className="dealer-script">
          <p className="eyebrow">Dealer briefing</p>
          <h3>Read the table from left to right.</h3>
          <p>
            A device category tells you what kind of FirstNet device you are handling.
            Pricing tells you whether a published offer exists. The requirement card tells
            you what must be true before you quote or process the upgrade.
          </p>
        </div>
        <div className="upgrade-rule-cards">
          {learningSteps.map((step) => (
            <article key={step.title}>
              <span>{step.title.charAt(0)}</span>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="upgrade-learning-board" aria-label="Device category and pricing explanation">
        <article>
          <span>Category</span>
          <h3>{game.round.category}</h3>
          <p>{game.round.categoryNote}</p>
        </article>
        <article>
          <span>Pricing / Offer</span>
          <h3>{game.round.offer}</h3>
          <p>{game.round.pricingNote}</p>
        </article>
        <article>
          <span>Goal</span>
          <h3>Play one requirement</h3>
          <p>
            Pick the card from your hand that matches both the device category and the pricing
            situation shown by the dealer.
          </p>
        </article>
      </section>

      <section className="upgrade-table" aria-label="Dealer and player upgrade cards">
        <div className="dealer-table-zone">
          <div className="table-zone-heading">
            <p className="eyebrow">Dealer cards</p>
            <h3>{game.round.device}</h3>
          </div>
          <div className="dealer-card-row">
            <article className="upgrade-card device table-card">
              <span className="card-corner top">
                <b>D</b>
                <em>FN</em>
              </span>
              <span className="card-corner bottom">
                <b>D</b>
                <em>FN</em>
              </span>
              <span className="card-suit" aria-hidden="true">D</span>
              <span className="card-label">Device</span>
              <strong>{game.round.device}</strong>
              <p>{game.round.category}</p>
            </article>

            <article className="upgrade-card offer table-card">
              <span className="card-corner top">
                <b>$</b>
                <em>$</em>
              </span>
              <span className="card-corner bottom">
                <b>$</b>
                <em>$</em>
              </span>
              <span className="card-suit" aria-hidden="true">$</span>
              <span className="card-label">Price / Offer</span>
              <strong>{game.round.offer}</strong>
              <p>{game.round.pricingNote}</p>
            </article>
          </div>
        </div>

        <div className="player-hand-zone">
          <div className="table-zone-heading">
            <p className="eyebrow">Your hand</p>
            <h3>Play one requirement card</h3>
          </div>
          <div className="player-card-row">
            {game.hand.map((card) => (
              <button
                className={`upgrade-card requirement player-card ${game.selectedCardId === card.id ? 'held thrown-card' : ''}`}
                key={card.id}
                type="button"
                onClick={() => playCard(card.id)}
                disabled={game.processed}
              >
                <span className="card-corner top">
                  <b>R</b>
                  <em>REQ</em>
                </span>
                <span className="card-corner bottom">
                  <b>R</b>
                  <em>REQ</em>
                </span>
                <span className="card-suit" aria-hidden="true">R</span>
                <span className="card-label">{game.selectedCardId === card.id ? 'Played' : 'Mystery requirement'}</span>
                <strong>{game.selectedCardId === card.id ? card.title : 'Face-down requirement'}</strong>
                <p>
                  {game.selectedCardId === card.id
                    ? card.body
                    : 'Play this card to reveal whether its requirement matches the dealer cards.'}
                </p>
                <small>{game.selectedCardId === card.id ? 'Dealt to table' : 'Tap to throw'}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="upgrade-controls" aria-live="polite">
        <div className={`dealer-message ${game.processed ? 'approved' : ''}`}>
          <strong>{game.processed ? 'Upgrade processed.' : 'Dealer response'}</strong>
          <p>{message}</p>
        </div>
        <div className="upgrade-actions">
          <button className="primary" type="button" onClick={nextRound}>
            Deal next
          </button>
          <button type="button" onClick={resetGame}>
            Reset table
          </button>
        </div>
      </section>
    </div>
  )
}
