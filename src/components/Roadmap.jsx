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
    summary: 'Domestic coverage, 5G, Latin America, Elite international data, International Day Pass, or destination question.',
    questions: [
      'What exact location or destination is involved?',
      'What plan, device, and account type does the customer have?',
      'Is the question about 5G, talk/text, high-speed data, hotspot, roaming, or speed after threshold?',
      'Is the customer asking about Premium/Elite Latin America, Elite global data, or International Day Pass?',
    ],
    steps: [
      'Use official coverage and destination tools before quoting.',
      'Confirm 5G device compatibility and location availability.',
      'Verify exact destinations for Latin America, Elite international data, or International Day Pass.',
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
        summary: `${profile.prefix} coverage/travel path. Verify plan, destination, device, and account before setting expectations.`,
        questions: [
          profile.accountCheck,
          'What exact address or destination needs verification?',
          'Which plan and device are involved?',
          'Is the question domestic coverage, 5G, Latin America, Elite international data, or International Day Pass?',
        ],
        steps: [
          'Use official coverage and destination tools before quoting.',
          'Confirm device compatibility for 5G.',
          'Verify plan-specific international features before quoting country or destination availability.',
          'Remind the caller that coverage and data speeds vary.',
        ],
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
          children: createIssueBranches('family', ['billing', 'devices', 'account-access']),
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
          children: createIssueBranches('family', ['billing', 'devices', 'account-access']),
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
  return 'Review the personalized path and use the node detail for the live call.'
}

function getNodeTypeLabel(node) {
  return node.type ?? 'issue'
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
  const [selectedNode, setSelectedNode] = useState(roadmapTree)
  const [travelOpen, setTravelOpen] = useState(false)
  const [travelPath, setTravelPath] = useState([roadmapTree])
  const nodes = useMemo(() => flattenNodes(roadmapTree), [])
  const currentTravelNode = travelPath[travelPath.length - 1]
  const travelComplete = !currentTravelNode.children

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
        <div className="roadmap-guardrail">
          <strong>Guardrail</strong>
          <span>This is a training map based on app study data. Use official tools for account-specific answers.</span>
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
                <span>{getNodeTypeLabel(currentTravelNode)}</span>
                <h4>{currentTravelNode.label}</h4>
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
          </section>
        </div>
      )}
    </div>
  )
}
