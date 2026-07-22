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
    label: 'Scenario',
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
        'Thank you for calling in today. I can help with that. Before I recommend a plan, billing path, device step, or support option, I want to make sure I understand what you are trying to accomplish and confirm the right account path. That way I can give you the clearest next step instead of guessing.',
    },
    Verification: {
      title: 'Verification',
      source: 'sso',
      helper: 'Verify the customer and the service path before discussing account-specific information.',
      text: `To get started, I would verify who I am speaking with, the line or service involved, and whether this is an individual FirstNet account, agency-managed service, or a family/commercial line connected to FirstNet and Family. If we need bill or account details, ${billingOption.detail} If the issue needs live FirstNet care, ${assistOption.detail} Once the correct access path is confirmed, I can safely discuss the account-specific details.`,
    },
    Eligibility: {
      title: 'Eligibility',
      source: 'eligibility',
      helper: 'Confirm Subscriber Paid, Agency Paid, or family-line context without guessing eligibility.',
      text: `Next, I would confirm which eligibility path applies. ${accountRoadmap.buckets.subscriber.facts[0]} ${accountRoadmap.buckets.agency.facts[0]} ${accountRoadmap.buckets.shared.facts[5]} If family lines are part of the call, I would explain the boundary clearly: ${familyAccess.details[0]} ${familyAccess.details[2]} ${familyAccess.details[3]}`,
    },
    AccountInfo: {
      title: 'Account Info',
      source: 'billing',
      helper: 'Gather the customer context that determines which recommendation makes sense.',
      text: `After the account path is clear, I would narrow the need: are we reviewing a phone plan, adding family lines, activating a device, upgrading a device, checking eligibility, or explaining a bill? If a device is involved, ${joinDetails(deviceRule)} ${joinDetails(activationNote)} If family lines are part of the conversation, I would also confirm that ${familyAccess.details[1]} ${familyAccess.details[3]}`,
    },
    BillingSuggestions: {
      title: 'Billing Suggestions',
      source: 'billing',
      helper: 'Offer grounded billing suggestions based on plan and account context.',
      text: `Once I know what matters most, I would connect the recommendation to that need. For billing expectations, ${joinDetails(billingPriceRule)} If the customer wants a lower entry point, ${valuePlan.name} is listed at ${valuePlan.oneLinePrice} and includes ${valuePlan.headline.toLowerCase()} If hotspot is important, ${extraPlan.name} is listed at ${extraPlan.oneLinePrice} and includes ${extraPlan.headline.toLowerCase()} If coverage or travel benefits matter, ${premiumPlan.name} adds ${premiumPlan.features[2].toLowerCase()} and ${elitePlan.name} adds ${elitePlan.features[3].toLowerCase()}`,
    },
    SuggestiveTalkingPoints: {
      title: 'Suggestive Talking Points',
      source: 'cards',
      helper: 'Use these as optional, customer-specific talking points after the need is clear.',
      text: `From there, I would add only the talking points that match the customer’s concern. If reliability is the concern, I would explain that ${priorityDefinition} If public-safety network design matters, I would explain that ${coreDefinition} If family savings matter, ${joinDetails(familyDiscounts)} If the customer wants one account experience, I would explain that FirstNet and Family can help organize eligible FirstNet service with AT&T family lines, while family members use AT&T commercial network service rather than the FirstNet network.`,
    },
    NextStepAndClose: {
      title: 'Next Step and Close',
      source: 'sso',
      helper: 'Close with the action path, summary, and agreement check.',
      text: `Before closing, I would summarize what we confirmed: the account path, eligibility context, customer need, and the plan, billing, device, or support recommendation that best matches the call. If the next step is billing or account access, ${billPayRule.details.join(' ')} Then I would ask: does this plan or support path sound like it fits what you need today, or would you like to compare one more option before we wrap up?`,
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
          <img className="script-specialist-avatar" src={scriptSpecialist} alt="Arab woman script specialist" />
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
