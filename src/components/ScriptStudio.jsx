import { useMemo, useState } from 'react'
import scriptSpecialist from '../assets/script-specialist.png'

const sectionOrder = [
  'Greeting',
  'Verification',
  'Eligibility',
  'AccountInfo',
  'BillingSuggestions',
  'SuggestiveTalkingPoints',
  'NextStepAndClose',
]

const sourceMeta = {
  billing: {
    label: 'Billing',
    className: 'source-billing',
  },
  eligibility: {
    label: 'Eligibility',
    className: 'source-eligibility',
  },
  cards: {
    label: 'Index Cards',
    className: 'source-cards',
  },
  sso: {
    label: 'SSO Options',
    className: 'source-sso',
  },
  resolveLab: {
    label: 'ResolveLab',
    className: 'source-resolvelab',
  },
}

function findTerm(terms, term) {
  return terms.find((item) => item.term === term)?.definition || ''
}

function findPlan(guide, name) {
  return guide.individualPlans.find((plan) => plan.name === name) || guide.individualPlans[0]
}

function joinDetails(item, fallback = '') {
  return item?.details?.join(' ') || fallback
}

function buildGeneratedScript({ billingGuide, accountRoadmap, selfServiceGame, studyNotes, terms }) {
  const extraPlan = findPlan(billingGuide, 'FirstNet Extra 2.0')
  const premiumPlan = findPlan(billingGuide, 'FirstNet Premium 2.0')
  const elitePlan = findPlan(billingGuide, 'FirstNet Elite 2.0')
  const billingPriceRule = billingGuide.billingRules.find((rule) => rule.title === 'Published price assumptions')
  const billPayRule = billingGuide.billingRules.find((rule) => rule.title === 'Online bill payment path')
  const deviceRule = billingGuide.billingRules.find((rule) => rule.title === 'Device and SIM requirement')
  const familyAccess = billingGuide.familyPlans.find((item) => item.title === 'Who can use FirstNet and Family')
  const familyDiscounts = billingGuide.familyPlans.find((item) => item.title === 'Discounts and billing')
  const activationNote = studyNotes.find((note) => note.title === 'Activation Concepts')
  const billingOption = selfServiceGame.options.find((option) => option.id === 'firstnet-central-billing')
  const assistOption = selfServiceGame.options.find((option) => option.id === 'firstnet-assist-care')
  const priorityDefinition = findTerm(terms, 'First Priority')
  const coreDefinition = findTerm(terms, 'Dedicated FirstNet Core')
  const valuePlan = findPlan(billingGuide, 'FirstNet Value 2.0')

  return {
    Greeting: {
      title: 'Greeting',
      source: 'resolveLab',
      helper: 'Start the live interaction with acknowledgement, ownership, and permission to ask questions.',
      text:
        'Thank you for calling in today. I can help review your FirstNet options, explain what may fit your account, and make sure you have a clear next step before we finish. Before I make a recommendation, I will ask a few quick questions so I do not point you toward the wrong plan or support path.',
    },
    Verification: {
      title: 'Verification',
      source: 'sso',
      helper: 'Verify the customer and the service path before discussing account-specific information.',
      text: `First, I want to verify the account path we should use. If we need bill or account details, ${billingOption.detail} If you need live FirstNet care, ${assistOption.detail} I will only discuss account-specific details after the correct account access or support path is confirmed.`,
    },
    Eligibility: {
      title: 'Eligibility',
      source: 'eligibility',
      helper: 'Confirm Subscriber Paid, Agency Paid, or family-line context without guessing eligibility.',
      text: `Next, I want to confirm eligibility and account type. ${accountRoadmap.buckets.subscriber.facts[0]} ${accountRoadmap.buckets.agency.facts[0]} ${accountRoadmap.buckets.shared.facts[5]} If this involves FirstNet and Family, ${familyAccess.details[0]} ${familyAccess.details[2]} ${familyAccess.details[3]}`,
    },
    AccountInfo: {
      title: 'Account Info',
      source: 'billing',
      helper: 'Gather the customer context that determines which recommendation makes sense.',
      text: `To narrow this down, I would ask whether you are reviewing a phone plan, adding family lines, activating a device, or trying to understand a bill. ${joinDetails(deviceRule)} ${joinDetails(activationNote)} If family lines are part of the conversation, ${familyAccess.details[1]} ${familyAccess.details[3]}`,
    },
    BillingSuggestions: {
      title: 'Billing Suggestions',
      source: 'billing',
      helper: 'Offer grounded billing suggestions based on plan and account context.',
      text: `For billing expectations, ${joinDetails(billingPriceRule)} If the customer wants a lower entry point, ${valuePlan.name} is listed at ${valuePlan.oneLinePrice} and includes ${valuePlan.headline.toLowerCase()} If they ask about hotspot, ${extraPlan.name} is listed at ${extraPlan.oneLinePrice} and includes ${extraPlan.headline.toLowerCase()} If coverage or travel benefits matter, ${premiumPlan.name} adds ${premiumPlan.features[2].toLowerCase()} and ${elitePlan.name} adds ${elitePlan.features[3].toLowerCase()}`,
    },
    SuggestiveTalkingPoints: {
      title: 'Suggestive Talking Points',
      source: 'cards',
      helper: 'Use these as optional, customer-specific talking points after the need is clear.',
      text: `If reliability is the concern, explain that ${priorityDefinition} If public-safety network design matters, explain that ${coreDefinition} If the customer wants family savings, ${joinDetails(familyDiscounts)} If the customer needs one account experience, explain that FirstNet and Family can help organize eligible FirstNet service with AT&T family lines, while family members use AT&T commercial network service rather than the FirstNet network.`,
    },
    NextStepAndClose: {
      title: 'Next Step and Close',
      source: 'sso',
      helper: 'Close with the action path, summary, and agreement check.',
      text: `For the next step, ${billPayRule.details.join(' ')} I would summarize: we verified the account path, checked eligibility, reviewed account needs, and matched the billing or plan suggestion to what the customer asked for. Then I would ask: does this option sound like it fits what you need today, or should we compare one more plan before you decide?`,
    },
  }
}

function getInitialDraft(scriptSections) {
  return sectionOrder.reduce((draft, key) => {
    draft[key] = scriptSections[key].text
    return draft
  }, {})
}

export default function ScriptStudio({ billingGuide, accountRoadmap, selfServiceGame, studyNotes, terms }) {
  const scriptSections = useMemo(
    () => buildGeneratedScript({ billingGuide, accountRoadmap, selfServiceGame, studyNotes, terms }),
    [accountRoadmap, billingGuide, selfServiceGame, studyNotes, terms],
  )
  const [draft, setDraft] = useState(() => getInitialDraft(scriptSections))
  const [activeSection, setActiveSection] = useState(null)

  function updateSection(key, value) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function resetSection(key) {
    setDraft((current) => ({
      ...current,
      [key]: scriptSections[key].text,
    }))
  }

  function closeModal() {
    setActiveSection(null)
  }

  const combinedScript = sectionOrder.map((key) => draft[key]).join('\n\n')
  const activeSectionData = activeSection ? scriptSections[activeSection] : null
  const activeSource = activeSectionData ? sourceMeta[activeSectionData.source] : null

  return (
    <div className="script-studio">
      <section className="script-generated-layout" aria-label="Generated customer script">
        <aside className="script-studio-center">
          <img className="script-specialist-avatar" src={scriptSpecialist} alt="Professional script specialist" />
          <div>
            <p className="eyebrow">Script Studio</p>
            <h3>Collaborative Script</h3>
            <p>Generated first. Editable by section. Color tags show the source tab.</p>
          </div>
        </aside>

        <div className="script-section-editor">
          {sectionOrder.map((key) => {
            const section = scriptSections[key]
            const meta = sourceMeta[section.source]
            const preview = draft[key].length > 170 ? `${draft[key].slice(0, 170)}...` : draft[key]

            return (
              <article className={`customer-script-section ${meta.className}`} key={key}>
                <div className="script-section-heading">
                  <div>
                    <p className="eyebrow">{section.title}</p>
                    <h3>{section.title}</h3>
                  </div>
                  <span>{meta.label}</span>
                </div>
                <p>{section.helper}</p>
                <p className="script-section-preview">{preview}</p>
                <textarea
                  aria-label={`Edit ${section.title}`}
                  value={draft[key]}
                  onChange={(event) => updateSection(key, event.target.value)}
                />
                <div className="script-section-actions">
                  <button type="button" onClick={() => setActiveSection(key)}>
                    Edit section
                  </button>
                  <button type="button" onClick={() => resetSection(key)}>
                    Reset section
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="customer-script-panel">
        <div className="section-heading compact">
          <p className="eyebrow">Full Script</p>
          <h3>Current customer-facing script</h3>
        </div>
        <pre className="customer-full-script">{combinedScript}</pre>
      </section>

      {activeSectionData && (
        <div className="script-modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section
            className={`script-edit-modal ${activeSource.className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="script-edit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="script-modal-heading">
              <div>
                <p className="eyebrow">{activeSectionData.title}</p>
                <h3 id="script-edit-title">Edit script section</h3>
              </div>
              <span>{activeSource.label}</span>
            </div>
            <p>{activeSectionData.helper}</p>
            <textarea
              aria-label={`Edit ${activeSectionData.title} in modal`}
              value={draft[activeSection]}
              onChange={(event) => updateSection(activeSection, event.target.value)}
            />
            <div className="script-modal-actions">
              <button type="button" onClick={() => resetSection(activeSection)}>
                Reset section
              </button>
              <button className="primary" type="button" onClick={closeModal}>
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
