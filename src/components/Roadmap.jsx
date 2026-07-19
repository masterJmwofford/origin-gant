import { useMemo, useState } from 'react'

const verificationSteps = [
  'Confirm caller role and account authority before account-specific discussion.',
  'Identify account type: Subscriber Paid, Agency Paid, FirstNet and Family, family/commercial line, or prospect/new customer.',
  'Confirm the line, phone number, device, service, destination, or bill item involved.',
  'Use official account, eligibility, coverage, destination, device, and billing tools before quoting or changing anything.',
]

const issueBranches = [
  {
    id: 'billing',
    label: 'Billing / Payment',
    summary: 'Bill pay, bill explanation, pricing expectation, discount timing, taxes/fees, or Spanish sample bill help.',
    questions: [
      'Can the customer sign in to FirstNet Central?',
      'Are they trying to pay, view, understand, or dispute/explain a bill item?',
      'Have they gone to Manage Services & Billing from FirstNet Central?',
      'Are AutoPay and paperless billing expected on this account, and has the two-bill timing been considered?',
    ],
    steps: [
      'Use FirstNet Central for bill access and Manage Services & Billing.',
      'Explain that listed individual prices assume eligible AutoPay and paperless billing discounts where applicable.',
      'Remind agents that taxes and fees are extra.',
      'Use Quick Help & Tutorials or expert chat/care when the customer needs bill interpretation.',
    ],
  },
  {
    id: 'eligibility',
    label: 'Eligibility / Signup',
    summary: 'New customer qualification, role verification, Subscriber Paid signup, agency workflow, or essential-services question.',
    questions: [
      'Is this an individual user, agency/organization, or essential-services organization?',
      'Is the caller trying to verify a new account or adjust an existing account?',
      'Is FirstNet and Family part of the request?',
      'Has the caller used FirstNet Verify or an official agency sign-up/specialist workflow?',
    ],
    steps: [
      'Do not infer eligibility from job title alone.',
      'Point individual users toward official eligibility verification.',
      'Point agency-managed service toward agency sign-up or specialist workflows.',
      'Verify Subscriber Paid status before discussing FirstNet and Family.',
    ],
  },
  {
    id: 'devices',
    label: 'Devices / Upgrade',
    summary: 'Phone, rugged device, hotspot, router, modem, BYOD, trade-in, promo, or compatibility question.',
    questions: [
      'What exact device model is involved?',
      'Is this BYOD, upgrade, replacement, rugged/specialty device, hotspot, router, or modem?',
      'What is the IMEI if compatibility, activation, or upgrade details are involved?',
      'Is there a published device offer, and what are the trade-in, installment, plan, SIM, or verification requirements?',
    ],
    steps: [
      'Separate device category from account type and offer requirement.',
      'Confirm FirstNet Ready/Capable or certified-device path before setting expectations.',
      'Do not apply smartphone promo assumptions to rugged or specialty devices.',
      'Match device, offer, plan requirement, trade-in, and activation path before quoting.',
    ],
  },
  {
    id: 'activation',
    label: 'Activation / SIM',
    summary: 'New line, replacement device, physical SIM, eSIM, BYOD activation, or device setup path.',
    questions: [
      'Is this a new line, replacement device, BYOD activation, eSIM, or physical SIM activation?',
      'Is the device compatible or FirstNet Ready/Capable?',
      'Do we need IMEI for device, ICCID for physical SIM, or EID for eSIM?',
      'Has the device received any required software update?',
    ],
    steps: [
      'Confirm account type before activation guidance.',
      'Use the correct identifier: IMEI, ICCID, or EID.',
      'Use official FirstNet Help activation resources for exact device setup.',
      'Confirm SIM/eSIM provisioning path before troubleshooting other issues.',
    ],
  },
  {
    id: 'account-access',
    label: 'Account Access / SSO',
    summary: 'FirstNet Central, FirstNet Assist, chat with expert, self-service route, or account navigation issue.',
    questions: [
      'Can the customer sign in to FirstNet Central?',
      'Is the issue access, navigation, bill pay, bill explanation, chat, diagnostics, or device support?',
      'Would FirstNet Help or FirstNet Assist be a better support path?',
      'Is the caller authorized for the account or just using the device?',
    ],
    steps: [
      'Use FirstNet Central for account, services, billing, and expert chat paths.',
      'Use FirstNet Help for eSIM activation and device-specific support resources.',
      'Use FirstNet Assist for care, diagnostics, and device support workflows.',
      'Do not discuss account-specific details until authorization is verified.',
    ],
  },
  {
    id: 'coverage-travel',
    label: 'Coverage / Travel',
    summary: 'Coverage and travel issue only: domestic coverage, 5G, Latin America, Elite international data, International Day Pass, or destination question.',
    questions: [
      'What exact location or destination is involved?',
      'What plan, device, and account type does the customer have?',
      'Is the question about 5G, talk/text, high-speed data, hotspot, roaming, or speed after threshold?',
      'Is the customer asking about a coverage/travel issue such as Premium/Elite Latin America, Elite global data, or International Day Pass?',
    ],
    steps: [
      'Use official coverage and destination tools before quoting.',
      'Confirm 5G device compatibility and location availability.',
      'Verify exact destinations for Latin America, Elite international data, or International Day Pass as coverage/travel support issues.',
      'Remind agents that coverage and data speeds vary.',
    ],
  },
]

const issueProfiles = {
  newSubscriber: {
    prefix: 'New Subscriber Paid',
    accountCheck: 'Confirm the caller is using the official individual eligibility path before discussing individual plan setup.',
    billing: [
      'Which individual plan price is the caller comparing: Value, Extra, Premium, or Elite?',
      'Does the caller understand listed prices assume eligible AutoPay and paperless billing where applicable?',
      'Are taxes and fees part of the price expectation conversation?',
      'Will FirstNet and Family be added after the FirstNet account is active?',
    ],
    billingSteps: [
      'Keep billing guidance educational until the account exists and eligibility is verified.',
      'Explain published individual plan price assumptions without promising final charges.',
      'If family lines are part of the sale, confirm active FirstNet account requirements before discussing combined billing.',
      'Direct account-specific billing setup to official FirstNet Central or specialist workflows.',
    ],
    eligibility: [
      'What public safety or support role is the caller using for eligibility verification?',
      'Is the caller applying as an individual who will personally pay for service?',
      'Does the caller need FirstNet Verify before choosing a plan?',
      'Are they asking about family lines before the FirstNet account is active?',
    ],
    eligibilitySteps: [
      'Do not approve eligibility from the call conversation alone.',
      'Send the caller through official eligibility verification.',
      'After verification, separate plan selection from device activation.',
      'Only discuss FirstNet and Family after confirming Subscriber Paid context.',
    ],
  },
  existingSubscriber: {
    prefix: 'Existing Subscriber Paid',
    accountCheck: 'Confirm the caller is the verified FirstNet Subscriber Paid user or otherwise authorized before discussing account details.',
    billing: [
      'Which line and bill cycle is the caller asking about?',
      'Is the question about plan price, discount timing, taxes/fees, family lines, or bill access?',
      'Can the caller sign in to FirstNet Central and reach Manage Services & Billing?',
      'Did an AutoPay/paperless discount expectation start within the current or prior two bills?',
    ],
    billingSteps: [
      'Verify the account before discussing line-specific billing.',
      'Use FirstNet Central, then Manage Services & Billing, for bill access.',
      'Compare the caller’s plan against Value, Extra, Premium, or Elite features only after confirming the plan.',
      'Use Quick Help & Tutorials, expert chat, or care for bill interpretation.',
    ],
    eligibility: [
      'Is the caller already verified and asking about keeping eligibility current?',
      'Is the caller trying to add family lines or another FirstNet user?',
      'Is a role, employer, or account ownership change involved?',
      'Does the question require official eligibility re-verification?',
    ],
    eligibilitySteps: [
      'Do not assume existing service answers a new eligibility question.',
      'Keep Subscriber Paid and family-line rules separate.',
      'Verify FirstNet and Family eligibility before adding family context.',
      'Route uncertain eligibility questions to official verification paths.',
    ],
  },
  newAgency: {
    prefix: 'New Agency Paid',
    accountCheck: 'Confirm the caller is asking for organization-managed service and route setup through agency or specialist workflows.',
    billing: [
      'Is the organization comparing unlimited, pooled data, Data Only, or Wireless Broadband plan categories?',
      'Who is authorized to discuss agency billing setup?',
      'Is the use case smartphones, data-only devices, routers, modems, hotspots, or Wireless Broadband?',
      'Is the organization asking about predictable bills, pooled data, or 175GB Wireless Broadband behavior?',
    ],
    billingSteps: [
      'Do not use individual Subscriber Paid price assumptions for agency plans.',
      'Identify the agency plan category before discussing billing expectations.',
      'For Wireless Broadband, include the 175GB per billing cycle concept from the app data.',
      'Route agency setup and pricing confirmation to official agency/specialist workflows.',
    ],
    eligibility: [
      'What type of organization is applying: public safety agency, utility, transportation, healthcare, or other essential-services organization?',
      'Is the caller authorized to begin an agency account discussion?',
      'Is service for employees/personnel or for an individual who will pay personally?',
      'Does the organization need agency sign-up or specialist help?',
    ],
    eligibilitySteps: [
      'Do not infer agency eligibility from a department name alone.',
      'Separate agency-managed service from individual Subscriber Paid service.',
      'Route the organization through official agency sign-up or specialist paths.',
      'Document whether the request is for users, devices, pooled data, or Wireless Broadband.',
    ],
  },
  existingAgency: {
    prefix: 'Existing Agency Paid',
    accountCheck: 'Confirm whether the caller is an agency admin/contact or an end user before giving account-specific help.',
    billing: [
      'Is the caller authorized for agency billing or only reporting a device/user issue?',
      'Which agency plan category is involved: unlimited, pooled, Data Only, or Wireless Broadband?',
      'Is this about one line, a device group, pooled usage, or Wireless Broadband usage?',
      'Does the issue require admin action, specialist support, or end-user troubleshooting?',
    ],
    billingSteps: [
      'Verify agency authority before discussing billing details or changes.',
      'Separate end-user support from agency account management.',
      'Use the agency plan category to decide which facts apply.',
      'Route billing changes through official agency admin or specialist workflows.',
    ],
    eligibility: [
      'Is the caller asking whether a new group, role, or organization qualifies under an existing agency setup?',
      'Is this an employee/personnel addition or a separate individual Subscriber Paid request?',
      'Does an agency admin need to approve the line or device?',
      'Does the question involve essential-services examples such as utilities, transportation, or healthcare?',
    ],
    eligibilitySteps: [
      'Keep existing agency service separate from new individual eligibility.',
      'Do not approve new roles or groups without official workflow confirmation.',
      'Confirm admin authority before account changes.',
      'Use specialist or agency workflows for uncertain eligibility changes.',
    ],
  },
  family: {
    prefix: 'FirstNet and Family',
    accountCheck: 'Confirm whether the caller is the verified FirstNet user or a family/commercial-line user.',
    billing: [
      'Is the caller asking about the FirstNet line, a family AT&T commercial line, or combined billing?',
      'Is the verified Subscriber Paid FirstNet account already active?',
      'Are family members currently on a separate AT&T account?',
      'Is the question about one bill, one point of purchase, or the 20-line account structure?',
    ],
    billingSteps: [
      'Verify the FirstNet user before discussing FirstNet account details.',
      'Clarify that family lines use AT&T commercial network service.',
      'If family members are already on another AT&T account, use the app guidance that they must visit a store to combine accounts.',
      'Keep family commercial-line issues separate from FirstNet network-access questions.',
    ],
    eligibility: [
      'Is the FirstNet user verified as Subscriber Paid?',
      'Is the family member asking for FirstNet access or AT&T commercial family service?',
      'Is another first responder in the household asking about their own FirstNet line?',
      'Is the caller trying to add family before the FirstNet account is active?',
    ],
    eligibilitySteps: [
      'FirstNet and Family is only for verified Subscriber Paid users in the app data.',
      'Do not describe family lines as receiving FirstNet network access.',
      'Confirm active FirstNet account before family setup.',
      'Separate another first responder’s FirstNet eligibility from ordinary family-line service.',
    ],
  },
}

function getCoverageTravelAccountGuidance(profileKey) {
  const guidance = {
    newSubscriber: {
      context: 'New Subscriber Paid / IRU',
      authority: 'Keep this educational until eligibility and the individual account path are verified.',
      planRule: 'Only explain included international benefits as plan comparisons; do not add, quote, or promise travel service before official verification.',
      routing: 'Use official eligibility, plan, coverage, and destination tools before moving from education to account setup.',
    },
    existingSubscriber: {
      context: 'Existing Subscriber Paid / IRU',
      authority: 'Verify the individual FirstNet user or authorized account access before discussing line-specific travel expectations.',
      planRule: 'Match the current plan first: Value/Extra have fewer stored international benefits than Premium/Elite, and Elite has the stored 20GB global data feature.',
      routing: 'Use FirstNet Central/account tools plus official coverage and destination tools before quoting or changing a travel option.',
    },
    newAgency: {
      context: 'New Agency Paid / CRU',
      authority: 'Confirm the caller is authorized to discuss agency-managed service; keep international guidance at discovery level until specialist workflow confirms the account setup.',
      planRule: 'Do not apply individual Subscriber Paid plan assumptions to an agency prospect. Agency pricing and plan setup must be confirmed through official agency/specialist workflows.',
      routing: 'Capture destination, device group, use case, and admin contact, then route through agency setup or specialist support.',
    },
    existingAgency: {
      context: 'Existing Agency Paid / CRU',
      authority: 'Confirm whether the caller is an agency admin/contact or only an end user reporting travel or coverage behavior.',
      planRule: 'Agency-managed travel, roaming, and coverage support can depend on the agency plan, device fleet, provisioning, and admin permissions.',
      routing: 'Use official agency/account tools for plan and feature availability before quoting or changing international support.',
    },
    family: {
      context: 'FirstNet and Family / AT&T commercial family line',
      authority: 'Identify whether the caller is the verified FirstNet user or a family/commercial-line user before discussing account-specific details.',
      planRule: 'Keep FirstNet travel benefits tied to the FirstNet Subscriber Paid line; family lines use AT&T commercial network service and may follow different commercial travel rules.',
      routing: 'Separate FirstNet line coverage/travel questions from AT&T commercial family-line travel questions before routing or quoting.',
    },
  }

  return guidance[profileKey]
}

function createCoverageTravelSubIssueBranches(profileKey) {
  const profile = issueProfiles[profileKey]
  const accountGuidance = getCoverageTravelAccountGuidance(profileKey)
  const accountQuestions = [
    accountGuidance.authority,
    accountGuidance.planRule,
    accountGuidance.routing,
  ]

  return [
    {
      id: `${profileKey}-domestic-coverage`,
      label: 'Domestic Coverage',
      type: 'travel-issue',
      summary: `${profile.prefix} domestic coverage issue. Account lens: ${accountGuidance.context}. Use this when the caller asks whether FirstNet service, priority, Band 14, LTE, or 5G-supported service works at a specific U.S. location.`,
      questions: [
        profile.accountCheck,
        ...accountQuestions,
        'What exact service address, work location, incident location, or travel route needs to be checked?',
        'Which device and line are involved?',
        'Is the caller asking about general coverage, First Priority, Band 14, 5G, hotspot, or device behavior?',
      ],
      steps: [
        'Use the official coverage map or account tools for address-level answers.',
        'Confirm device compatibility and provisioning before assuming the issue is network coverage.',
        'If the issue is agency-managed, confirm whether the caller is an admin/contact or end user.',
        'Explain that the training map is not a live coverage checker.',
      ],
    },
    {
      id: `${profileKey}-fiveg-check`,
      label: '5G Check',
      type: 'travel-issue',
      summary: `${profile.prefix} 5G coverage issue. Account lens: ${accountGuidance.context}. The app data says 5G access requires a compatible device and is not available everywhere.`,
      questions: [
        profile.accountCheck,
        ...accountQuestions,
        'What device model and line are involved?',
        'Is the customer physically in the location where they expect 5G?',
        'Is the issue no 5G indicator, slow data, activation, SIM/eSIM, plan expectation, or coverage expectation?',
        'Has device compatibility and provisioning been checked?',
      ],
      steps: [
        'Confirm device compatibility first.',
        'Verify location availability in official tools.',
        'Separate 5G availability from general FirstNet service availability.',
        'Avoid promising 5G in every location because the app data explicitly says it is not available everywhere.',
      ],
    },
    {
      id: `${profileKey}-latin-america`,
      label: 'Latin America',
      type: 'travel-issue',
      summary: `${profile.prefix} Latin America travel issue. Account lens: ${accountGuidance.context}. The app data says FirstNet Premium 2.0 and Elite 2.0 include unlimited talk, text, and high-speed data in 20 Latin American countries at no extra cost; coverage and data speeds vary.`,
      questions: [
        profile.accountCheck,
        ...accountQuestions,
        'Is the customer on Premium 2.0 or Elite 2.0?',
        'What exact Latin American destination is involved?',
        'Is the customer asking about talk, text, high-speed data, hotspot, roaming behavior, or billing expectation?',
        'Has the exact country been verified in official destination tools?',
      ],
      steps: [
        'Verify the customer plan before explaining the Latin America feature.',
        'Verify the exact destination before quoting availability.',
        'Do not name the exact 20 countries from memory because the app data stores the count, not the full official list.',
        'Remind the agent that coverage and data speeds vary.',
      ],
    },
    {
      id: `${profileKey}-elite-global-data`,
      label: 'Elite Global Data',
      type: 'travel-issue',
      summary: `${profile.prefix} Elite global data travel issue. Account lens: ${accountGuidance.context}. The app data says FirstNet Elite 2.0 includes 20GB of international data per month for over 210 destinations; after 20GB, speeds may be reduced to a maximum of 512 Kbps.`,
      questions: [
        profile.accountCheck,
        ...accountQuestions,
        'Is the customer on FirstNet Elite 2.0?',
        'What destination is involved?',
        'Is the customer asking about the 20GB monthly international data amount, reduced speed after 20GB, or destination eligibility?',
        'Has the exact destination and account eligibility been verified?',
      ],
      steps: [
        'Confirm Elite 2.0 before explaining the 20GB international data feature.',
        'Verify the destination in official tools before quoting coverage or availability.',
        'Explain the app-stored threshold carefully: after 20GB, international data speeds may be reduced to a maximum of 512 Kbps.',
        'Do not list over-210 destinations unless official tools confirm the customer destination.',
      ],
    },
    {
      id: `${profileKey}-international-day-pass`,
      label: 'Intl Day Pass',
      type: 'travel-issue',
      summary: `${profile.prefix} International Day Pass coverage/travel issue. Account lens: ${accountGuidance.context}. The app does not store exact IDP pricing or destination lists, so this path is intentionally a verify-before-quote workflow.`,
      questions: [
        profile.accountCheck,
        ...accountQuestions,
        'What country or destination is the customer traveling to?',
        'What plan and account type does the customer have?',
        'Is the customer asking whether to add IDP, how much it costs, whether the destination is supported, or whether the account is eligible?',
        'Has IDP availability, pricing, destination support, and account eligibility been checked in official tools?',
      ],
      steps: [
        'Do not quote IDP pricing from this app.',
        'Verify destination support, account eligibility, and current pricing in official tools.',
        'Separate IDP from Elite included international data and Premium/Elite Latin America features.',
        'Use IDP as a verification branch, not as an assumed add-on.',
      ],
    },
  ]
}

function createIssueBranches(profileKey, allowedIssueIds = issueBranches.map((issue) => issue.id)) {
  const profile = issueProfiles[profileKey]

  return issueBranches
    .filter((issue) => allowedIssueIds.includes(issue.id))
    .map((issue) => {
      if (issue.id === 'billing') {
        return {
          ...issue,
          id: `${profileKey}-${issue.id}`,
          summary: `${profile.prefix} billing path. ${profile.accountCheck}`,
          questions: profile.billing,
          steps: profile.billingSteps,
        }
      }

      if (issue.id === 'eligibility') {
        return {
          ...issue,
          id: `${profileKey}-${issue.id}`,
          summary: `${profile.prefix} eligibility path. ${profile.accountCheck}`,
          questions: profile.eligibility,
          steps: profile.eligibilitySteps,
        }
      }

      if (issue.id === 'devices') {
        return {
          ...issue,
          id: `${profileKey}-${issue.id}`,
          summary: `${profile.prefix} device path. Identify whether the issue belongs to the account holder, agency admin, end user, or family/commercial line before discussing device options.`,
          questions: [
            profile.accountCheck,
            'What exact device type is involved: phone, rugged device, hotspot, router, modem, BYOD, replacement, or upgrade?',
            'What identifier is needed: IMEI for device, ICCID for physical SIM, or EID for eSIM?',
            'Does this path allow offer discussion, or should the agent only troubleshoot/support the device?',
          ],
          steps: [
            'Confirm account authority before discussing device offers or account changes.',
            'Match device type to the right support path instead of assuming a smartphone upgrade.',
            'Verify FirstNet Ready/Capable or certified-device guidance before setting expectations.',
            'Use official device, offer, and activation tools before quoting.',
          ],
        }
      }

      if (issue.id === 'activation') {
        return {
          ...issue,
          id: `${profileKey}-${issue.id}`,
          summary: `${profile.prefix} activation path. Confirm the account path first because SIM/eSIM and authority can change the next step.`,
          questions: [
            profile.accountCheck,
            'Is this new line activation, replacement, BYOD, physical SIM, or eSIM?',
            'Is the device compatible and provisioned with the right FirstNet SIM or eSIM path?',
            'Are IMEI, ICCID, or EID needed for this specific activation issue?',
          ],
          steps: [
            'Verify account type and caller authority before activation guidance.',
            'Use the correct identifier for the activation problem.',
            'Check whether the device needs a software update.',
            'Use official FirstNet Help activation resources for the exact device path.',
          ],
        }
      }

      if (issue.id === 'account-access') {
        return {
          ...issue,
          id: `${profileKey}-${issue.id}`,
          summary: `${profile.prefix} account-access path. Choose FirstNet Central, FirstNet Help, FirstNet Assist, agency admin, or store/specialist workflow based on who is calling.`,
          questions: [
            profile.accountCheck,
            'Can the caller sign in to FirstNet Central, or are they blocked before account tools?',
            'Is the request bill access, expert chat, device diagnostics, eSIM help, account management, or family account combination?',
            'Does this issue belong to a verified FirstNet user, agency admin, end user, or family-line user?',
          ],
          steps: [
            'Use FirstNet Central for account, services, billing, and expert chat where appropriate.',
            'Use FirstNet Help for device-specific and eSIM resources.',
            'Use FirstNet Assist for diagnostics and support workflows.',
            'Avoid account-specific details until official authorization is verified.',
          ],
        }
      }

      return {
        ...issue,
        id: `${profileKey}-${issue.id}`,
        summary: `${profile.prefix} coverage/travel issue path. Verify plan, destination, device, and account before setting expectations. International options only appear here because they should be handled as coverage/travel issues.`,
        questions: [
          profile.accountCheck,
          'What exact address or destination needs verification?',
          'Which plan and device are involved?',
          'Is the coverage/travel issue domestic coverage, 5G, Latin America, Elite international data, or International Day Pass?',
        ],
        steps: [
          'Use official coverage and destination tools before quoting.',
          'Confirm device compatibility for 5G.',
          'Verify plan-specific international coverage/travel details before quoting country or destination availability.',
          'Remind the caller that coverage and data speeds vary.',
        ],
        children: createCoverageTravelSubIssueBranches(profileKey),
      }
    })
}

const roadmapTree = {
  id: 'call-in',
  label: 'Customer Calls In',
  type: 'start',
  summary: 'Begin with active listening, identify the customer need, and avoid guessing the account path.',
  questions: [
    'What are you calling about today?',
    'Are you a new customer, existing customer, account admin, verified user, or family-line user?',
    'Is this about billing, eligibility, device, activation, account access, coverage, travel, or support?',
  ],
  steps: [
    'Acknowledge the concern.',
    'Collect the call reason.',
    'Choose the correct account path before giving a specific answer.',
  ],
  children: [
    {
      id: 'new-customer',
      label: 'New / Prospective Customer',
      type: 'customer',
      summary: 'Use when the caller is not yet active or is trying to verify eligibility, pick a path, or start service.',
      questions: [
        'Is the caller applying as an individual, agency/organization, or essential-services organization?',
        'Is the caller asking about personal FirstNet service, agency-managed service, or FirstNet and Family?',
        'Do they already have a compatible device or need a new device?',
      ],
      steps: [
        'Do not promise eligibility before official verification.',
        'Separate Subscriber Paid from Agency Paid early.',
        'If device or activation is part of the ask, verify compatibility and SIM/eSIM path.',
      ],
      children: [
        {
          id: 'new-subscriber-paid',
          label: 'Subscriber Paid / IRU Path',
          type: 'account',
          summary: 'Individual public safety professional or eligible support person personally signs up and pays.',
          questions: [
            'Is the individual eligible through official verification?',
            'Which individual plan is being considered: Value, Extra, Premium, or Elite?',
            'Will FirstNet and Family be part of the setup?',
          ],
          steps: [
            'Verify eligibility before quoting final access.',
            'Explain individual plan differences only after the account path is clear.',
            'For family lines, verify Subscriber Paid status and active FirstNet account first.',
          ],
          children: createIssueBranches('newSubscriber'),
        },
        {
          id: 'new-agency-paid',
          label: 'Agency Paid / CRU Path',
          type: 'account',
          summary: 'Agency, department, utility, healthcare organization, or eligible organization manages service for personnel.',
          questions: [
            'Is the caller authorized to discuss agency service?',
            'Is the use case smartphones, data-only devices, pooled data, unlimited data, or Wireless Broadband?',
            'Is the organization looking for critical applications, failover, quick deployment, or offsite connectivity?',
          ],
          steps: [
            'Route agency setup through agency sign-up or FirstNet specialist workflows.',
            'Do not infer organization eligibility from a title alone.',
            'Match agency plan category to the use case before device or billing discussion.',
          ],
          children: createIssueBranches('newAgency'),
        },
        {
          id: 'new-family',
          label: 'FirstNet and Family',
          type: 'account',
          summary: 'Family-line conversation connected to a verified Subscriber Paid FirstNet user.',
          questions: [
            'Does the public safety user already have an active FirstNet account?',
            'Are family members already on a separate AT&T account?',
            'Is the caller asking about one bill, one point of purchase, or mixed FirstNet and AT&T services?',
          ],
          steps: [
            'Confirm verified Subscriber Paid status.',
            'Explain that family lines use AT&T commercial network service, not FirstNet network access.',
            'If family members are already on another AT&T account, the app data says they must visit a store to combine accounts.',
          ],
          children: createIssueBranches('family', ['billing', 'devices', 'account-access', 'coverage-travel']),
        },
      ],
    },
    {
      id: 'existing-customer',
      label: 'Existing Customer',
      type: 'customer',
      summary: 'Use when the caller already has service and needs account, billing, device, activation, coverage, or support help.',
      questions: [
        'Which line, device, account, bill, destination, or service is involved?',
        'Is the account Subscriber Paid, Agency Paid, or FirstNet and Family/family line?',
        'Is the caller authorized for the account or only using a device?',
      ],
      steps: [
        'Verify account authority before account-specific details.',
        'Identify account type and issue category.',
        'Use the right support path: FirstNet Central, FirstNet Help, FirstNet Assist, or specialist/admin workflow.',
      ],
      children: [
        {
          id: 'existing-subscriber-paid',
          label: 'Subscriber Paid / IRU',
          type: 'account',
          summary: 'Existing individual FirstNet user pays for and manages their service.',
          questions: [
            'Is the caller the verified FirstNet Subscriber Paid user?',
            'Which plan and line are involved?',
            'Is FirstNet and Family involved?',
          ],
          steps: [
            'Use individual plan and billing guidance only after verification.',
            'Confirm family-line context before discussing network access or account structure.',
            'Use FirstNet Central for account and billing paths.',
          ],
          children: createIssueBranches('existingSubscriber'),
        },
        {
          id: 'existing-agency-paid',
          label: 'Agency Paid / CRU',
          type: 'account',
          summary: 'Existing service is managed by an agency or organization.',
          questions: [
            'Is the caller the agency admin/contact or the end user?',
            'Which agency plan category or device type is involved?',
            'Does the issue require admin authority, device support, or specialist routing?',
          ],
          steps: [
            'Verify agency authorization before account changes.',
            'Separate end-user troubleshooting from admin/billing management.',
            'Route agency-specific setup or changes to official agency workflows.',
          ],
          children: createIssueBranches('existingAgency'),
        },
        {
          id: 'existing-family-commercial',
          label: 'Family / AT&T Commercial Line',
          type: 'account',
          summary: 'Family member or commercial line connected to a FirstNet and Family account.',
          questions: [
            'Is the caller the verified FirstNet user or a family-line user?',
            'Is the question about the FirstNet line or an AT&T commercial family line?',
            'Is the issue billing, device, account access, or plan structure?',
          ],
          steps: [
            'Clarify that family lines do not receive FirstNet network access.',
            'Keep FirstNet-user questions separate from family commercial-line questions.',
            'Verify account authority before discussing details.',
          ],
          children: createIssueBranches('family', ['billing', 'devices', 'account-access', 'coverage-travel']),
        },
      ],
    },
  ],
}

function flattenNodes(node) {
  return [node, ...(node.children ?? []).flatMap((child) => flattenNodes(child))]
}

function getTravelPrompt(node) {
  if (node.type === 'start') return 'Start by choosing whether this caller is new or existing.'
  if (node.type === 'customer') return 'Choose the account path that best matches the caller.'
  if (node.type === 'account') return 'Choose the issue the caller needs help with.'
  if (node.id.includes('coverage-travel') && node.children) return 'Choose the exact coverage/travel issue the caller is asking about.'
  return 'Review the personalized path and use the node detail for the live call.'
}

function getNodeTypeLabel(node) {
  return node.type ?? 'issue'
}

function getIssueKind(node) {
  return issueBranches.find((issue) => node.id.endsWith(issue.id))?.id ?? null
}

function getAccountContext(node) {
  if (node.id.includes('newSubscriber')) return 'new Subscriber Paid / IRU'
  if (node.id.includes('existingSubscriber')) return 'existing Subscriber Paid / IRU'
  if (node.id.includes('newAgency')) return 'new Agency Paid / CRU'
  if (node.id.includes('existingAgency')) return 'existing Agency Paid / CRU'
  if (node.id.includes('family') || node.id.includes('family-commercial')) return 'FirstNet and Family or family/commercial'
  if (node.id.includes('subscriber')) return 'Subscriber Paid / IRU'
  if (node.id.includes('agency')) return 'Agency Paid / CRU'
  if (node.id.includes('new')) return 'new/prospective customer'
  if (node.id.includes('existing')) return 'existing customer'
  return 'general call-in'
}

function getDetailedSections(node) {
  const nodeType = getNodeTypeLabel(node)
  const issueKind = getIssueKind(node)
  const accountContext = getAccountContext(node)
  const baseSections = [
    {
      title: 'Listen For',
      items: [
        'The exact words the caller uses to describe ownership, account access, and urgency.',
        'Whether the caller sounds like the account owner, agency admin, device end user, family-line user, or prospect.',
        'Whether the caller is asking for education, account action, troubleshooting, or a quote.',
      ],
    },
    {
      title: 'Before You Proceed',
      items: [
        'Confirm caller authority before discussing account-specific details.',
        'Confirm account type before applying billing, device, eligibility, activation, coverage, or travel guidance.',
        'Use official tools for anything that could change by account, destination, device, price, or eligibility status.',
      ],
    },
  ]

  if (nodeType === 'start') {
    return [
      ...baseSections,
      {
        title: 'Manager Coaching',
        items: [
          'Coach agents to slow the call down before choosing a path; the first wrong split causes the rest of the call to drift.',
          'The first decision is not the product. The first decision is who the caller is and what authority they have.',
          'A clean opening should capture need, status, account path, and the object of the issue: line, device, bill, location, or eligibility request.',
        ],
      },
      {
        title: 'Path Forward',
        items: [
          'If no account exists, move toward new/prospective customer and eligibility or setup questions.',
          'If service exists, move toward existing customer and verify account authority.',
          'If the caller is unsure, ask whether service is personally paid, agency-managed, or tied to family/commercial lines.',
        ],
      },
    ]
  }

  if (nodeType === 'customer') {
    return [
      ...baseSections,
      {
        title: 'Decision Logic',
        items: [
          node.id.includes('new')
            ? 'New/prospective callers need eligibility, account-path, plan, device, and setup guidance before account-specific support.'
            : 'Existing callers need verification first, then issue routing by account type and caller authority.',
          'The agent should identify whether the caller is trying to start service, manage current service, troubleshoot, or understand a bill/feature.',
          'Do not let a product question skip the account path; device, billing, and travel answers can change by account type.',
        ],
      },
      {
        title: 'Branch Choices',
        items: [
          'Subscriber Paid / IRU means the eligible individual personally manages and pays for service.',
          'Agency Paid / CRU means an organization manages service for personnel or devices.',
          'FirstNet and Family or family/commercial paths require separating FirstNet user questions from AT&T commercial family-line questions.',
        ],
      },
    ]
  }

  if (nodeType === 'account') {
    const isAgency = node.id.includes('agency')
    const isFamily = node.id.includes('family')
    return [
      ...baseSections,
      {
        title: 'Account-Specific Focus',
        items: isAgency
          ? [
              'Verify whether the caller is an agency admin/contact or an end user with a device issue.',
              'Separate agency plan categories: unlimited, pooled data, Data Only, or Wireless Broadband.',
              'For Wireless Broadband, remember the app data references 175GB per billing cycle and conversion behavior after overuse for three consecutive billing periods.',
            ]
          : isFamily
            ? [
                'Confirm the verified FirstNet Subscriber Paid user exists before discussing FirstNet and Family setup.',
                'Clarify that family lines use AT&T commercial network service, not FirstNet network access.',
                'If family members are already on a separate AT&T account, the app data says the customer must visit a store to combine accounts.',
              ]
            : [
                'Verify the caller is the Subscriber Paid user or otherwise authorized.',
                'Separate individual plan questions across Value, Extra, Premium, and Elite.',
                'If family lines are involved, confirm FirstNet and Family eligibility and keep family/commercial lines separate from FirstNet network access.',
              ],
      },
      {
        title: 'Best Next Branch',
        items: [
          'Billing / Payment when the caller mentions bill, charge, payment, discount, taxes, fees, price, or bill explanation.',
          'Devices / Upgrade when the caller mentions model, IMEI, BYOD, trade-in, promo, rugged device, hotspot, router, modem, SIM, or replacement.',
          isFamily
            ? 'Account Access / SSO when the issue is sign-in, bill access, combining accounts, or reaching the right support path.'
            : 'Coverage / Travel, Activation / SIM, Eligibility, or Account Access when those words describe the caller’s actual need.',
        ],
      },
    ]
  }

  if (nodeType === 'travel-issue') {
    const accountGuidance = getCoverageTravelAccountGuidance(
      Object.keys(issueProfiles).find((profileKey) => node.id.startsWith(profileKey)) ?? 'existingSubscriber',
    )
    const travelIssueDetails = {
      'domestic-coverage': {
        focus: [
          'Use this path for U.S. location, service, Band 14, First Priority, or domestic availability conversations.',
          'The exact address, route, incident location, device, and account type matter before interpreting coverage.',
          'If the caller says the device used to work but no longer does, consider activation, SIM/eSIM, device behavior, and software before assuming coverage changed.',
        ],
        verify: [
          'Official coverage or account tools for address-level information.',
          'Device compatibility and provisioning status.',
          'Whether the caller is authorized to discuss the line or only reporting an issue as an end user.',
        ],
        avoid: [
          'Do not use the training HeatMap as a live coverage checker.',
          'Do not promise FirstNet, LTE, 5G, or Band 14 behavior at an exact address without official verification.',
          'Do not skip account type because agency and Subscriber Paid support paths can differ.',
        ],
      },
      'fiveg-check': {
        focus: [
          'Use this path when the customer expects 5G, sees no 5G indicator, asks about 5G plan access, or reports data behavior tied to 5G expectations.',
          'The app data says 5G requires a compatible device and is not available everywhere.',
          'A plan benefit can exist while device or location support still prevents the expected experience.',
        ],
        verify: [
          'Exact device model and compatibility.',
          'Location where the customer expects 5G.',
          'SIM/eSIM provisioning and activation if the issue appeared after setup or upgrade.',
        ],
        avoid: [
          'Do not say 5G is available everywhere.',
          'Do not assume slow data is a plan issue before checking device, location, and provisioning.',
          'Do not use a general coverage statement to answer a device-specific 5G question.',
        ],
      },
      'latin-america': {
        focus: [
          'Use this path for Premium 2.0 or Elite 2.0 callers asking about Latin America travel coverage, talk, text, or high-speed data.',
          'The app data stores the travel benefit as “20 Latin American countries” but does not store the exact official country list.',
          'The phrase “coverage and data speeds vary” should stay attached to this coverage/travel issue.',
        ],
        verify: [
          'Plan: Premium 2.0 or Elite 2.0.',
          'Exact destination country in official tools.',
          'Whether the caller is asking about talk, text, high-speed data, hotspot, roaming, or billing expectation.',
        ],
        avoid: [
          'Do not name the exact 20 countries unless official tools confirm them.',
          'Do not apply the Latin America feature to Value 2.0 or Extra 2.0 from this app data.',
          'Do not promise speed or coverage because the app data says coverage and data speeds vary.',
        ],
      },
      'elite-global-data': {
        focus: [
          'Use this path for FirstNet Elite 2.0 customers asking about the 20GB monthly international data feature.',
          'The app data says Elite includes 20GB of international data per month for over 210 destinations.',
          'The app data says after 20GB, international data speeds may be reduced to a maximum of 512 Kbps.',
        ],
        verify: [
          'Plan: FirstNet Elite 2.0.',
          'Exact destination in official tools.',
          'Whether the question is about included data, post-20GB speed, billing expectation, or destination support.',
        ],
        avoid: [
          'Do not apply Elite global data to non-Elite plans.',
          'Do not list over-210 destinations from memory.',
          'Do not present the 20GB feature as unlimited high-speed international data.',
        ],
      },
      'international-day-pass': {
        focus: [
          'Use this path when the customer asks about adding International Day Pass, destination support, pricing, or travel coverage outside the included plan benefits.',
          'The app does not store exact IDP pricing or exact destination lists.',
          'IDP should be treated as a coverage/travel verification path, not an assumed account add.',
        ],
        verify: [
          'Destination support.',
          'Current pricing.',
          'Account eligibility.',
          'Whether another included travel benefit, such as Elite global data or Premium/Elite Latin America, applies first.',
        ],
        avoid: [
          'Do not quote IDP pricing from this app.',
          'Do not assume IDP is available for every destination or account.',
          'Do not confuse IDP with Elite included international data or the Premium/Elite Latin America travel benefit.',
        ],
      },
    }
    const travelIssueKey = Object.keys(travelIssueDetails).find((key) => node.id.includes(key))
    const detail = travelIssueDetails[travelIssueKey]

    return [
      {
        title: 'Account Type Lens',
        items: [
          `This is a ${accountGuidance.context} coverage/travel issue.`,
          accountGuidance.authority,
          accountGuidance.planRule,
          accountGuidance.routing,
        ],
      },
      {
        title: 'Issue Focus',
        items: detail.focus,
      },
      {
        title: 'Must Verify',
        items: detail.verify,
      },
      {
        title: 'Avoid',
        items: detail.avoid,
      },
      {
        title: 'Customer-Friendly Framing',
        items: [
          '“I want to match the destination, plan, device, and account before I set the expectation.”',
          '“Some travel benefits are plan-included, and some require a separate verification path.”',
          '“I can explain the coverage/travel item, then verify whether it applies to your exact account and destination.”',
        ],
      },
    ]
  }

  const issueDetails = {
    billing: {
      listen: [
        'Listen for payment, bill view, bill explanation, published price mismatch, discount timing, taxes, fees, Spanish sample bill, or account overview.',
        'Confirm whether this is education about pricing or an account-specific billing issue.',
        'Check whether the account context is personal Subscriber Paid, agency-managed, or family/commercial.',
      ],
      proceed: [
        'Use FirstNet Central and Manage Services & Billing for bill access paths when applicable.',
        'Mention eligible AutoPay and paperless billing discount timing only where it applies to individual plan pricing.',
        'Do not use individual plan price assumptions for agency-paid billing.',
      ],
      avoid: [
        'Do not promise an exact monthly total because taxes and fees are extra.',
        'Do not discuss bill details without verification.',
        'Do not route family commercial-line billing as if it receives FirstNet network access.',
      ],
    },
    eligibility: {
      listen: [
        'Listen for role, employer, agency, essential-services organization, volunteer status, healthcare, utility, transportation, or family-line eligibility.',
        'Identify whether the caller is applying personally or through an organization.',
        'Watch for callers who ask if a title automatically qualifies them.',
      ],
      proceed: [
        'Route individual requests toward official eligibility verification.',
        'Route organization-managed service toward agency sign-up or specialist workflows.',
        'For FirstNet and Family, verify Subscriber Paid status before family discussion.',
      ],
      avoid: [
        'Do not approve eligibility from a job title alone.',
        'Do not mix agency-managed service with personal Subscriber Paid signup.',
        'Do not tell family-line users they receive FirstNet network access.',
      ],
    },
    devices: {
      listen: [
        'Listen for phone, rugged device, hotspot, router, modem, BYOD, upgrade, trade-in, promo, replacement, SIM, eSIM, IMEI, ICCID, or EID.',
        'Identify whether the caller wants compatibility, troubleshooting, activation, pricing, or upgrade help.',
        'Check whether the device is tied to a Subscriber Paid line, agency line, or family/commercial line.',
      ],
      proceed: [
        'Use IMEI for the device, ICCID for physical SIM, and EID for eSIM questions.',
        'Confirm FirstNet Ready/Capable or certified-device path before setting expectations.',
        'Match device, offer, plan requirement, trade-in, and activation path before quoting an upgrade.',
      ],
      avoid: [
        'Do not apply smartphone promo rules to rugged or specialty devices by assumption.',
        'Do not quote a device offer if the source does not publish a specific promo for that device.',
        'Do not troubleshoot device behavior without separating activation, SIM/eSIM, network, and physical device issues.',
      ],
    },
    activation: {
      listen: [
        'Listen for new line, replacement, BYOD, physical SIM, eSIM, setup, software update, device swap, or activation failure.',
        'Identify whether the account is Subscriber Paid, Agency Paid, or family/commercial before activation guidance.',
        'Ask whether the issue began before or after a SIM/eSIM/device change.',
      ],
      proceed: [
        'Confirm compatible or FirstNet Ready/Capable device path.',
        'Use IMEI, ICCID, or EID based on the activation type.',
        'Use official FirstNet Help activation resources for the exact device path.',
      ],
      avoid: [
        'Do not assume a physical SIM path if the device is using eSIM.',
        'Do not skip software update checks where device behavior suggests setup is incomplete.',
        'Do not give account-changing activation guidance without caller authority.',
      ],
    },
    'account-access': {
      listen: [
        'Listen for sign-in, FirstNet Central, Manage Services & Billing, expert chat, FirstNet Help, FirstNet Assist, diagnostics, or store/specialist routing.',
        'Identify whether the caller is blocked before login or needs help after login.',
        'Check whether the issue belongs to an account owner/admin or a device end user.',
      ],
      proceed: [
        'Use FirstNet Central for account, services, billing, and expert chat paths.',
        'Use FirstNet Help for device-specific and eSIM resources.',
        'Use FirstNet Assist for diagnostics and device support workflows.',
      ],
      avoid: [
        'Do not discuss account-specific details without verified authority.',
        'Do not send every device issue to billing/account access when FirstNet Assist or FirstNet Help is more appropriate.',
        'Do not treat family account combination as a pure online self-service path when the app data says store visit may be required.',
      ],
    },
    'coverage-travel': {
      listen: [
        'Listen for address, destination, 5G, Latin America, Elite international data, International Day Pass, roaming, hotspot, high-speed data, or reduced speeds.',
        'Identify plan, device, destination, and account type before explaining features.',
        'Separate domestic coverage from international travel benefits.',
      ],
      proceed: [
        'Use official coverage and destination tools before quoting.',
        'Confirm 5G compatible device and location support.',
        'For Premium/Elite Latin America, Elite global data, or International Day Pass, verify exact destination and account eligibility.',
      ],
      avoid: [
        'Do not use the HeatMap as an address-level coverage checker.',
        'Do not name exact Latin America or over-210 destinations unless official tools confirm them.',
        'Do not promise data speed because coverage and data speeds vary.',
      ],
    },
  }[issueKind]

  if (issueDetails) {
    return [
      {
        title: 'Account Lens',
        items: [
          `This modal is for a ${accountContext} path.`,
          'Keep the issue tied to the selected account context; the same issue can require different questions for different account types.',
          'If the caller’s answers contradict the selected path, back up in Travel mode and choose the correct branch.',
        ],
      },
      { title: 'Listen For', items: issueDetails.listen },
      { title: 'Proceed With', items: issueDetails.proceed },
      { title: 'Avoid', items: issueDetails.avoid },
    ]
  }

  return baseSections
}

function RoadmapBranch({ depth = 0, node, onSelect }) {
  const nodeType = getNodeTypeLabel(node)
  const branchType = (node.children?.length ?? 0) > 2 ? 'is-multi' : 'is-binary'

  return (
    <li className={`roadmap-node-wrap node-${nodeType} depth-${depth}`}>
      <button className="roadmap-node" type="button" onClick={() => onSelect(node)}>
        <span>{nodeType}</span>
        <strong>{node.label}</strong>
      </button>
      {node.children && (
        <ul className={`roadmap-branch depth-${depth + 1} ${branchType}`}>
          {node.children.map((child) => (
            <RoadmapBranch depth={depth + 1} key={child.id} node={child} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Roadmap() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [travelOpen, setTravelOpen] = useState(false)
  const [travelPath, setTravelPath] = useState([roadmapTree])
  const nodes = useMemo(() => flattenNodes(roadmapTree), [])
  const currentTravelNode = travelPath[travelPath.length - 1]
  const travelComplete = !currentTravelNode.children
  const selectedDetails = selectedNode ? getDetailedSections(selectedNode) : []

  function chooseTravelNode(node) {
    setTravelPath((path) => [...path, node])
  }

  function stepTravelBack() {
    setTravelPath((path) => (path.length > 1 ? path.slice(0, -1) : path))
  }

  function resetTravel() {
    setTravelPath([roadmapTree])
  }

  return (
    <div className="call-roadmap">
      <section className="roadmap-hero">
        <div>
          <p className="eyebrow">Manager Call Path Map</p>
          <h2>Roadmap</h2>
          <p>
            A branching view of common FirstNet call paths. Start with the call-in,
            identify new vs. existing customer, separate account type, verify authority,
            then move into the customer issue.
          </p>
        </div>
      </section>

      <section className="roadmap-verification-strip" aria-label="Core verification steps">
        {verificationSteps.map((step, index) => (
          <article key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </article>
        ))}
      </section>

      <section className={`roadmap-travel ${travelOpen ? 'is-open' : ''}`} aria-label="Travel the call path">
        <div className="roadmap-travel-top">
          <div>
            <p className="eyebrow">Progressive Coaching</p>
            <h3>Travel the Path</h3>
            <p>
              Walk through the call one decision at a time. Each choice personalizes the
              next question set until the agent reaches a final issue path.
            </p>
          </div>
          <button
            className="roadmap-travel-toggle"
            type="button"
            onClick={() => setTravelOpen((open) => !open)}
          >
            {travelOpen ? 'Hide Travel' : 'Start Travel'}
          </button>
        </div>

        {travelOpen && (
          <div className="roadmap-carousel">
            <div className="travel-progress">
              {travelPath.map((node, index) => (
                <button
                  className={node.id === currentTravelNode.id ? 'active' : ''}
                  key={`${node.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedNode(node)}
                >
                  {index + 1}. {node.label}
                </button>
              ))}
            </div>

            <article className="travel-card">
              <div className="travel-card-heading">
                <div>
                  <span>{getNodeTypeLabel(currentTravelNode)}</span>
                  <h4>{currentTravelNode.label}</h4>
                </div>
                <strong className="travel-level">Stage {travelPath.length}</strong>
              </div>
              <p>{currentTravelNode.summary}</p>

              <div className="travel-question-panel">
                <strong>{getTravelPrompt(currentTravelNode)}</strong>
                <ul>
                  {(currentTravelNode.questions ?? []).slice(0, 3).map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>

              {currentTravelNode.children ? (
                <div className="travel-choice-grid">
                  {currentTravelNode.children.map((child) => (
                    <button key={child.id} type="button" onClick={() => chooseTravelNode(child)}>
                      <i aria-hidden="true" />
                      <span>{getNodeTypeLabel(child)}</span>
                      <strong>{child.label}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="travel-finish">
                  <strong>Path Complete</strong>
                  <p>
                    Use the selected issue modal to guide essential questions, verification,
                    and next steps for this exact customer journey.
                  </p>
                  <button type="button" onClick={() => setSelectedNode(currentTravelNode)}>
                    Open Final Node
                  </button>
                </div>
              )}

              <div className="travel-actions">
                <button type="button" onClick={stepTravelBack} disabled={travelPath.length === 1}>
                  Back
                </button>
                <button type="button" onClick={() => setSelectedNode(currentTravelNode)}>
                  View Node Details
                </button>
                <button type="button" onClick={resetTravel} disabled={travelPath.length === 1 && !travelComplete}>
                  Reset
                </button>
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="roadmap-tree-panel">
        <div className="roadmap-toolbar">
          <p className="eyebrow">Clickable Tree</p>
          <span>{nodes.length} nodes</span>
        </div>
        <ul className="roadmap-tree" aria-label="Customer call path roadmap">
          <RoadmapBranch node={roadmapTree} onSelect={setSelectedNode} />
        </ul>
      </section>

      {selectedNode && (
        <div className="roadmap-modal-backdrop" role="presentation" onClick={() => setSelectedNode(null)}>
          <section
            aria-modal="true"
            className="roadmap-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="roadmap-modal-header">
              <div>
                <p className="eyebrow">{selectedNode.type}</p>
                <h3>{selectedNode.label}</h3>
              </div>
              <button type="button" onClick={() => setSelectedNode(null)} aria-label="Close roadmap detail">
                Close
              </button>
            </div>
            <p className="roadmap-modal-summary">{selectedNode.summary}</p>
            <div className="roadmap-modal-grid">
              <article>
                <h4>Essential Questions</h4>
                <ul>
                  {(selectedNode.questions ?? []).map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h4>Required Steps</h4>
                <ul>
                  {(selectedNode.steps ?? []).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="roadmap-detail-grid">
              {selectedDetails.map((section) => (
                <article key={section.title}>
                  <h4>{section.title}</h4>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
