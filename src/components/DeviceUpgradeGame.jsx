import { useState } from 'react'

const dealerAvatarImage =
  'https://static.vecteezy.com/system/resources/thumbnails/024/485/231/small_2x/woman-croupier-near-card-table-in-casino-offers-to-play-black-jack-or-preference-in-las-vegas-png.png'

const deviceSourceNote =
  'Scenario source: FirstNet public device pages list compatible/certified phones and devices. Current public offers can change, so any device without a specific offer in this game should be treated as verify-before-quote.'

const categoryNotes = {
  apple:
    'The official FirstNet phones page lists this Apple model under certified phones and devices compatible with the FirstNet Evolved Packet Core.',
  google:
    'The official FirstNet phones page lists this Google Pixel model under certified phones and devices compatible with the FirstNet Evolved Packet Core.',
  samsung:
    'The official FirstNet phones page lists this Samsung model under certified phones and devices compatible with the FirstNet Evolved Packet Core.',
  motorola:
    'The official FirstNet phones page lists this Motorola model under certified phones and devices compatible with the FirstNet Evolved Packet Core.',
  rugged:
    'The official FirstNet phones page lists this rugged or specialty model under certified phones and devices compatible with the FirstNet Evolved Packet Core.',
  enterprise:
    'The official FirstNet phones page lists this enterprise or mobile-computer model under certified phones and devices compatible with the FirstNet Evolved Packet Core.',
  tablet:
    'The official FirstNet devices page lists tablets and laptops as FirstNet device catalog categories.',
  wearable:
    'The official FirstNet devices page lists watches as a FirstNet device catalog category.',
  connected:
    'The official FirstNet devices page lists connected devices such as routers, modems, and mobile connectivity equipment.',
}

const offerTypes = {
  verify: {
    offer: 'No specific public promo is stored for this D-Vice card.',
    pricingNote:
      'Because this game has no current device-specific promo for this model, the correct play is to verify current pricing before quoting.',
    correctRequirement:
      'Verify current offer before quoting price. Confirm account type, eligible plan, device compatibility, and SIM or eSIM path.',
  },
  iphone17Pro: {
    offer: 'Get iPhone 17 Pro for $0.',
    pricingNote:
      'The FirstNet individual offers page lists this as a published promotional offer, so the requirement card matters before quoting it.',
    correctRequirement:
      'Trade-in of $290 or more, installment plan, and FirstNet Extra 2.0 plan or higher, minimum $68/mo.',
  },
  s26Ultra: {
    offer: 'Get up to $1,100 off the Samsung Galaxy S26 Ultra.',
    pricingNote:
      'The FirstNet individual offers page lists this as a published promotional offer, so pair it with the matching trade-in and plan requirement.',
    correctRequirement: 'Trade-in of $95 or more in any condition and an eligible plan. Terms and restrictions apply.',
  },
  pixel10ProXl: {
    offer: 'Get the Google Pixel 10 Pro XL FREE.',
    pricingNote:
      'The FirstNet individual offers page lists this as a published promotional offer with eligible trade-in and eligible plan requirements.',
    correctRequirement:
      'Eligible smartphone trade-in and eligible plan are required. Verify current offer details before quoting.',
  },
  cradlepointR980: {
    offer: 'Receive up to $400 in bill credits with activation of Cradlepoint R980.',
    pricingNote:
      'The FirstNet agency plans page lists this as an agency/connected-device offer tied to activation on eligible FirstNet plans.',
    correctRequirement:
      'Activation of Cradlepoint R980 on eligible FirstNet plans. Verify agency account context and current offer details.',
  },
}

const sharedWrongRequirements = [
  'Quote the promo because every certified FirstNet device gets the same discount.',
  'Use only the device brand name to decide compatibility and pricing.',
  'Skip account type and SIM/eSIM verification because the model appears on the device list.',
  'Apply a smartphone trade-in offer to a rugged, wearable, tablet, router, or mobile-computer device.',
]

function makeDeviceRound({
  id,
  device,
  brand,
  category,
  categoryNote,
  offerType = 'verify',
  imageUrl = '',
  wrongRequirements = [],
}) {
  const offer = offerTypes[offerType]

  return {
    id,
    device,
    imageUrl,
    category,
    categoryNote: categoryNote ?? categoryNotes[brand],
    offer: offer.offer,
    pricingNote: offer.pricingNote,
    correctRequirement: offer.correctRequirement,
    wrongRequirements: [...wrongRequirements, ...sharedWrongRequirements].slice(0, 4),
    dealer:
      offerType === 'verify'
        ? `Upgrade handled safely: ${device} is listed in the device catalog, but current pricing must be verified before quoting.`
        : `Upgrade processed: ${device} matched the published offer and its required conditions.`,
  }
}

const upgradeRounds = [
  {
    id: 'iphone-17-pro',
    device: 'Apple iPhone 17 Pro',
    imageUrl:
      'https://www.firstnet.com/content/dam/firstnet/images/image-and-text/image-text-iphone-17-pro-max-pdp.jpg',
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
    imageUrl:
      'https://www.firstnet.com/content/dam/firstnet/images/image-and-text/6054400-s26ultra-pen-image-text.jpg',
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
  makeDeviceRound({
    id: 'pixel-10-pro-xl',
    device: 'Google Pixel 10 Pro XL',
    imageUrl:
      'https://www.firstnet.com/content/dam/firstnet/images/image-and-text/image-text-firstnet-google-pixel-10-pro-xl-mt5.jpg',
    brand: 'google',
    category: 'Certified smartphone',
    offerType: 'pixel10ProXl',
    wrongRequirements: [
      'Trade-in of $95 or more and an eligible plan.',
      'Trade-in of $290 or more and FirstNet Extra 2.0 plan or higher.',
      'Quote the customer $0 because it is a certified smartphone.',
    ],
  }),
  makeDeviceRound({
    id: 'sonim-xp5-plus-5g',
    device: 'Sonim XP5+ 5G',
    imageUrl:
      'https://www.firstnet.com/content/dam/firstnet/images/image-and-text/6406251-FN-SonimOmega-knobs-image-text.jpg',
    brand: 'rugged',
    category: 'Certified rugged / specialty device',
    wrongRequirements: [
      'Trade-in of $95 or more and an eligible plan.',
      'Trade-in of $290 or more and FirstNet Extra 2.0 plan or higher.',
      'Quote up to $1,100 off because it is a certified device.',
    ],
  }),
  ...[
    'Apple iPhone 17',
    'Apple iPhone 17e',
    'Apple iPhone Air',
    'Apple iPhone 17 Pro Max',
    'Apple iPhone 16',
    'Apple iPhone 16e',
    'Apple iPhone 16 Plus',
    'Apple iPhone 15',
    'Apple iPhone 15 Plus',
    'Apple iPhone 15 Pro',
    'Apple iPhone 15 Pro Max',
    'Apple iPhone 14',
    'Apple iPhone 14 Plus',
    'Apple iPhone 14 Pro',
    'Apple iPhone 14 Pro Max',
    'Apple iPhone SE 3rd Gen (2022)',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'apple',
      category: 'Certified Apple smartphone',
    }),
  ),
  ...[
    'Google Pixel 10',
    'Google Pixel 10a',
    'Google Pixel 10 Pro',
    'Google Pixel Fold',
    'Google Pixel 9',
    'Google Pixel 9a',
    'Google Pixel 9 Pro',
    'Google Pixel 9 Pro XL',
    'Google Pixel 8a',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'google',
      category: 'Certified Google smartphone',
    }),
  ),
  ...[
    'Samsung Galaxy A17 5G',
    'Samsung Galaxy A16 5G',
    'Samsung Galaxy A15 5G',
    'Samsung Galaxy A37 5G',
    'Samsung Galaxy A36 5G',
    'Samsung Galaxy A35 5G',
    'Samsung Galaxy S26+',
    'Samsung Galaxy S26',
    'Samsung Galaxy S25 FE',
    'Samsung Galaxy S25',
    'Samsung Galaxy S25+',
    'Samsung Galaxy S25 Edge',
    'Samsung Galaxy S25 Ultra',
    'Samsung Galaxy S24 FE',
    'Samsung Galaxy S24 Ultra',
    'Samsung Galaxy S24 and S24+',
    'Samsung Galaxy Z Flip7',
    'Samsung Galaxy Z Flip6',
    'Samsung Galaxy Z Flip5',
    'Samsung Galaxy Z Fold7',
    'Samsung Galaxy Z Fold6',
    'Samsung Galaxy Z Fold5',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'samsung',
      category: 'Certified Samsung smartphone',
    }),
  ),
  ...[
    'motorola razr+ 2026',
    'motorola razr+ 2025',
    'motorola razr+ 2024',
    'motorola razr ultra 2025',
    'moto g stylus 2025',
    'moto g stylus 5G - 2024',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'motorola',
      category: 'Certified Motorola smartphone',
    }),
  ),
  ...[
    'Crosscall CORE-P6',
    'Siyata SD7',
    'Sonim XP3plus 5G',
    'Sonim XP5+ 5G (with knobs)',
    'Sonim XP5+ 5G (without knobs)',
    'Sonim XP5plus',
    'Sonim XP Pro Thermal',
    'Sonim XP Pro',
    'Samsung Galaxy XCover7 Pro Enterprise Edition',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'rugged',
      category: 'Certified rugged / specialty device',
    }),
  ),
  ...[
    'Zebra EC55',
    'Zebra MC2700',
    'Zebra TC58 Mobile Computer',
    'Zebra TC57',
    'Zebra TC57x',
    'Zebra TC26',
    'Zebra TC77',
    'Zebra TC78 Mobile Computer',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'enterprise',
      category: 'Certified enterprise / mobile-computer device',
    }),
  ),
  ...[
    'Apple iPad Pro 13-inch (M5) 2025',
    'Apple iPad Air 11-inch (M4) 2026',
    'Samsung Galaxy Tab A11+',
    'Samsung Galaxy Tab Active5 Pro',
    'Dell Latitude 7520',
    'Zebra ET85 Rugged 2-in-1 Tablet',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'tablet',
      category: 'Tablet / laptop device',
    }),
  ),
  ...[
    'Apple Watch Series 11',
    'Samsung Galaxy Watch8 Classic',
    'Google Pixel Watch 4',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'wearable',
      category: 'Wearable device',
    }),
  ),
  makeDeviceRound({
    id: 'cradlepoint-r980',
    device: 'Cradlepoint R980 Vehicle and IoT Router',
    brand: 'connected',
    category: 'Connected router / IoT device',
    offerType: 'cradlepointR980',
    wrongRequirements: [
      'Trade-in of $290 or more and FirstNet Extra 2.0 plan or higher.',
      'Eligible smartphone trade-in and eligible plan are required.',
      'Treat it like a wearable NumberSync setup.',
    ],
  }),
  ...[
    'Sonim MegaConnect',
    'Cradlepoint E300 Branch Router',
    'Inseego Wavemaker FX4200',
  ].map((device) =>
    makeDeviceRound({
      id: device.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      device,
      brand: 'connected',
      category: 'Connected device',
    }),
  ),
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
    verify: 'Confirm the exact device model before discussing activation, SIM, or upgrade next steps.',
    customerPhrase:
      'First I want to make sure the device itself is ready for the FirstNet experience before we talk about the offer.',
  },
  {
    term: 'FirstNet Capable',
    category: 'Device status',
    plain:
      'The app study data uses this for a device that can be provisioned for FirstNet service.',
    whyItMatters:
      'Plans and activation should be paired with a capable device and a FirstNet SIM or eSIM.',
    verify: 'Confirm the device can be provisioned with FirstNet service and the right SIM path.',
    customerPhrase:
      'The phone and the line both have to be set up for FirstNet, so I am checking the device path and the SIM path together.',
  },
  {
    term: 'Certified device',
    category: 'Device status',
    plain:
      'A device listed by FirstNet as certified or compatible with the FirstNet Evolved Packet Core.',
    whyItMatters:
      'Certification helps you know the device belongs in the FirstNet device conversation.',
    verify: 'Use the official certified-device guidance or product page before presenting it as compatible.',
    customerPhrase:
      'I am checking whether this model is listed for FirstNet instead of assuming from the brand name alone.',
  },
  {
    term: 'FirstNet Trio SIM',
    category: 'Activation',
    plain:
      'A physical SIM option used for FirstNet activation.',
    whyItMatters:
      'A device may be right, but the line still needs the right SIM path to activate correctly.',
    verify: 'Confirm whether the customer needs a physical SIM, a replacement SIM, or an eSIM path.',
    customerPhrase:
      'If your phone uses a physical SIM, we need the correct FirstNet SIM associated with the line.',
  },
  {
    term: 'eSIM',
    category: 'Activation',
    plain:
      'A digital SIM supported by FirstNet on compatible devices, allowing activation without a removable physical SIM.',
    whyItMatters:
      'Some upgrades need an eSIM activation path instead of a physical SIM swap.',
    verify: 'Confirm the device supports eSIM and that the customer is using the official activation path.',
    customerPhrase:
      'For eSIM, we do not swap a plastic card; we activate the digital SIM that belongs to the device.',
  },
  {
    term: 'IMEI',
    category: 'Identifier',
    plain:
      'The device identifier used to identify the phone or connected device.',
    whyItMatters:
      'Use it when checking device compatibility, activation, or upgrade details.',
    verify: 'Ask for or locate the IMEI when the question is about the device itself.',
    customerPhrase:
      'The IMEI identifies the device, so it helps me check the phone rather than guessing from the model name.',
  },
  {
    term: 'ICCID',
    category: 'Identifier',
    plain:
      'The identifier for a physical SIM card.',
    whyItMatters:
      'It helps connect the correct physical SIM to the correct line during activation.',
    verify: 'Use ICCID when the support issue is about a physical SIM card.',
    customerPhrase:
      'The ICCID identifies the SIM card, so it helps make sure the right card is tied to the right line.',
  },
  {
    term: 'EID',
    category: 'Identifier',
    plain:
      'The identifier used for eSIM-capable devices.',
    whyItMatters:
      'It matters when the upgrade or activation uses digital SIM service.',
    verify: 'Use EID when the support issue is about eSIM setup or digital SIM activation.',
    customerPhrase:
      'The EID helps identify the digital SIM capability on the device.',
  },
  {
    term: 'HPUE',
    category: 'Capability',
    plain:
      'High-power user equipment can transmit at higher power on Band 14 than standard LTE devices.',
    whyItMatters:
      'It is a device capability conversation, not a generic discount or plan requirement.',
    verify: 'Confirm that the conversation is about a device capability, not simply a smartphone promo.',
    customerPhrase:
      'That feature is about device capability and coverage behavior, not just the monthly plan price.',
  },
  {
    term: 'Wireless Broadband',
    category: 'Device type',
    plain:
      'A FirstNet data option for routers, modems, hotspots, and other data-only connectivity needs.',
    whyItMatters:
      'Not every device conversation is a phone upgrade; some are data-only device needs.',
    verify: 'Confirm whether the customer needs smartphone service or data-only connectivity.',
    customerPhrase:
      'This sounds like a data-device need, so I want to separate it from a regular phone upgrade.',
  },
  {
    term: 'Software update',
    category: 'Readiness',
    plain:
      'Some FirstNet Ready devices may need a software update.',
    whyItMatters:
      'A device can be eligible but still need an update before the experience is complete.',
    verify: 'If activation or features are not behaving as expected, check whether a software update is needed.',
    customerPhrase:
      'The device may be compatible, but we should also make sure the software is current.',
  },
  {
    term: 'Trade-in',
    category: 'Pricing',
    plain:
      'A device promotion may depend on the customer trading in an eligible device at a required value.',
    whyItMatters:
      'Trade-in value is often the difference between quoting an offer correctly and quoting it too broadly.',
    verify: 'Confirm the required trade-in value for the specific offer before quoting the promotional amount.',
    customerPhrase:
      'That offer depends on the trade-in meeting the required value, so I want to verify that condition first.',
  },
  {
    term: 'Installment plan',
    category: 'Pricing',
    plain:
      'Some device offers require the new device to be purchased on an installment plan.',
    whyItMatters:
      'If the offer requires installments, do not separate the promo from that condition.',
    verify: 'Confirm whether the offer requires installments before presenting the monthly credit or discount.',
    customerPhrase:
      'The promotion may be tied to how the device is purchased, so I need to check the installment requirement.',
  },
  {
    term: 'Verify current pricing',
    category: 'Pricing',
    plain:
      'When the source does not publish a device-specific offer, confirm current pricing before quoting.',
    whyItMatters:
      'This is the safe move that prevents invented prices.',
    verify: 'If no specific promo is shown for that device, do not quote a dollar amount until current pricing is checked.',
    customerPhrase:
      'I do not want to guess on pricing. Let me verify the current offer before I quote it.',
  },
  {
    term: 'BYOD',
    category: 'Customer scenario',
    plain:
      'Bring Your Own Device means the customer wants to use an existing device instead of buying a new one.',
    whyItMatters:
      'BYOD changes the support path: focus on compatibility, SIM/eSIM, and activation instead of a device promo.',
    verify: 'Confirm the exact model, IMEI, SIM/eSIM path, and whether the device is eligible for FirstNet service.',
    customerPhrase:
      'Since you want to use your current device, I am checking compatibility and activation first.',
  },
  {
    term: 'Device upgrade',
    category: 'Customer scenario',
    plain:
      'A device upgrade means the customer is replacing the device on an existing or eligible line.',
    whyItMatters:
      'Support should separate the device purchase, the plan requirement, and the activation/SIM steps.',
    verify: 'Confirm line/account context, device offer, trade-in requirement, plan requirement, and activation path.',
    customerPhrase:
      'For the upgrade, I am going to match the device, the offer, the plan requirement, and the activation step.',
  },
  {
    term: 'Rugged device',
    category: 'Device type',
    plain:
      'A rugged or specialty device is built for field use and may not follow the same promo pattern as flagship smartphones.',
    whyItMatters:
      'Do not assume smartphone promotional rules apply to rugged or specialty devices.',
    verify: 'Confirm the device page, current price, SIM needs, and whether any software update is required.',
    customerPhrase:
      'This is a specialty device, so I am going to verify the current offer instead of applying a phone promo by assumption.',
  },
  {
    term: 'FirstNet Assist',
    category: 'Support path',
    plain:
      'A FirstNet app that helps users access support resources, service information, and assistance from a mobile device.',
    whyItMatters:
      'It can be a support path for care, device diagnostics, and field-user help.',
    verify: 'Use it when the customer needs mobile support, diagnostics, or care access rather than a sales quote.',
    customerPhrase:
      'For troubleshooting, FirstNet Assist may be the better path because it is built for support and device help.',
  },
  {
    term: 'Device diagnostics',
    category: 'Support path',
    plain:
      'A troubleshooting path used when a customer says the device is not working correctly.',
    whyItMatters:
      'It keeps support focused on the device issue before jumping to replacement or plan changes.',
    verify: 'Ask what is failing: activation, signal, SIM/eSIM, calls/texts, data, app support, or physical device behavior.',
    customerPhrase:
      'Before we talk replacement, let us narrow down whether this is activation, SIM, network, or device behavior.',
  },
  {
    term: 'NumberSync wearables',
    category: 'Support path',
    plain:
      'A support topic for calls and texts from a supported wearable.',
    whyItMatters:
      'Wearables are not the same as phone upgrades; they need their own supported setup path.',
    verify: 'Confirm supported wearable, line relationship, and the official NumberSync path.',
    customerPhrase:
      'Because this is a wearable, I want to check the NumberSync setup instead of treating it like a phone line.',
  },
  {
    term: 'Account type',
    category: 'Support process',
    plain:
      'Device conversations can differ depending on Subscriber Paid, Agency Paid, or family/commercial-line context.',
    whyItMatters:
      'The account type can change who manages the line, what can be discussed, and which offers or support paths apply.',
    verify: 'Confirm whether the line is Subscriber Paid, Agency Paid, or a family/commercial line before giving account-specific guidance.',
    customerPhrase:
      'I want to confirm the account type first so I do not apply the wrong device or billing path.',
  },
  {
    term: 'Plan requirement',
    category: 'Support process',
    plain:
      'Some device offers require a specific eligible plan level.',
    whyItMatters:
      'The device may qualify, but the offer can still fail if the plan requirement is not met.',
    verify: 'Check the offer language for plan-level requirements before saying the customer qualifies.',
    customerPhrase:
      'The device is only one part of the offer; I also need to confirm the plan requirement.',
  },
  {
    term: 'Safe quote',
    category: 'Support process',
    plain:
      'A safe quote is a customer explanation that includes the condition attached to the price or discount.',
    whyItMatters:
      'It prevents overpromising by tying the offer to trade-in, plan, installment, and verification steps.',
    verify: 'Before quoting, match device, offer, requirement, account type, and activation path.',
    customerPhrase:
      'Based on what I can verify, here is the offer and the conditions that must be met for it to apply.',
  },
]

const terminologyGroups = [
  {
    title: '1. Confirm the device',
    categories: ['Device status'],
    supportGoal:
      'Start every device conversation by identifying what the customer has or wants. Do not assume compatibility from brand name alone.',
  },
  {
    title: '2. Know activation and IDs',
    categories: ['Activation', 'Identifier'],
    supportGoal:
      'Use the right identifier for the right problem: IMEI for device, ICCID for physical SIM, and EID for eSIM.',
  },
  {
    title: '3. Recognize device types',
    categories: ['Capability', 'Device type', 'Readiness'],
    supportGoal:
      'Separate smartphone, rugged, data-only, capability, and readiness conversations so the support path stays accurate.',
  },
  {
    title: '4. Match pricing rules',
    categories: ['Pricing'],
    supportGoal:
      'Never quote a device price without matching it to the published promo and its requirements.',
  },
  {
    title: '5. Handle customer scenarios',
    categories: ['Customer scenario'],
    supportGoal:
      'Listen for whether the customer is bringing a device, upgrading a device, or asking about a specialty device.',
  },
  {
    title: '6. Route support correctly',
    categories: ['Support path'],
    supportGoal:
      'Use support paths when the issue is troubleshooting, wearable setup, diagnostics, or care access rather than pricing.',
  },
  {
    title: '7. Give the safe answer',
    categories: ['Support process'],
    supportGoal:
      'Close the loop by confirming account type, plan requirement, and the conditions attached to the offer.',
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
  const [academySlide, setAcademySlide] = useState(0)
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

  function previousAcademySlide() {
    setAcademySlide((index) => (index === 0 ? terminologyGroups.length - 1 : index - 1))
  }

  function nextAcademySlide() {
    setAcademySlide((index) => (index + 1) % terminologyGroups.length)
  }

  const activeAcademyGroup = terminologyGroups[academySlide]
  const activeAcademyTerms = deviceTerminology.filter((item) =>
    activeAcademyGroup.categories.includes(item.category),
  )
  const selectedRequirementCard = game.hand.find((card) => card.id === game.selectedCardId)

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
          <p className="device-source-note">{deviceSourceNote}</p>
        </div>
        <div className="academy-carousel">
          <div className="academy-carousel-toolbar">
            <button type="button" onClick={previousAcademySlide} aria-label="Previous academy section">
              ‹
            </button>
            <div>
              <span>Section {academySlide + 1} of {terminologyGroups.length}</span>
              <strong>{activeAcademyGroup.title}</strong>
            </div>
            <button type="button" onClick={nextAcademySlide} aria-label="Next academy section">
              ›
            </button>
          </div>

          <article className="academy-slide">
            <div className="academy-support-goal">
              <strong>Support goal</strong>
              <p>{activeAcademyGroup.supportGoal}</p>
            </div>
            {activeAcademyTerms.map((item) => (
              <div className="academy-term-card" key={item.term}>
                <span>{item.category}</span>
                <h4>{item.term}</h4>
                <p>{item.plain}</p>
                <dl>
                  <div>
                    <dt>Why it matters</dt>
                    <dd>{item.whyItMatters}</dd>
                  </div>
                  <div>
                    <dt>Verify</dt>
                    <dd>{item.verify}</dd>
                  </div>
                  <div>
                    <dt>Customer phrase</dt>
                    <dd>{item.customerPhrase}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </article>

          <div className="academy-dots" aria-label="Academy sections">
            {terminologyGroups.map((group, index) => (
              <button
                className={academySlide === index ? 'active' : ''}
                key={group.title}
                type="button"
                onClick={() => setAcademySlide(index)}
                aria-label={`Open ${group.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="upgrade-explainer" aria-label="How FirstNet device upgrades work">
        <div className="dealer-avatar">
          <img src={dealerAvatarImage} alt="Croupier dealing cards at a casino table" />
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
              {game.round.imageUrl ? (
                <img className="device-card-image" src={game.round.imageUrl} alt={game.round.device} />
              ) : (
                <span className="device-card-placeholder" aria-label={`${game.round.device} device card`}>
                  {game.round.device
                    .split(' ')
                    .slice(0, 2)
                    .map((word) => word.charAt(0))
                    .join('')}
                </span>
              )}
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

            {selectedRequirementCard && (
              <article className="upgrade-card requirement table-card played-requirement-card">
                <span className="card-corner top">
                  <b>R</b>
                  <em>REQ</em>
                </span>
                <span className="card-corner bottom">
                  <b>R</b>
                  <em>REQ</em>
                </span>
                <span className="card-suit" aria-hidden="true">R</span>
                <span className="card-label">
                  {selectedRequirementCard.isCorrect ? 'Correct match' : 'Not a match'}
                </span>
                <strong>Played requirement</strong>
                <p>{selectedRequirementCard.body}</p>
              </article>
            )}
          </div>
        </div>

        <div className="player-hand-zone">
          <div className="table-zone-heading">
            <p className="eyebrow">Your hand</p>
            <h3>Choose one visible requirement</h3>
          </div>
          <div className="player-card-row">
            {game.hand.map((card) => (
              <button
                className={`upgrade-card requirement player-card ${game.selectedCardId === card.id ? 'played-from-hand' : ''}`}
                key={card.id}
                type="button"
                onClick={() => playCard(card.id)}
                disabled={game.processed || game.selectedCardId === card.id}
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
                <span className="card-label">
                  {game.selectedCardId === card.id
                    ? card.isCorrect
                      ? 'Correct match'
                      : 'Not a match'
                    : 'Requirement option'}
                </span>
                <strong>Requirement</strong>
                <p>{card.body}</p>
                <small>{game.selectedCardId === card.id ? 'Moved to dealer row' : 'Tap to play'}</small>
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
