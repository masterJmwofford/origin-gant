import { useMemo, useState } from 'react'
import pavoLogo from '../assets/pavo-logo.png'

const sectionOrder = [
  'GeneralGreeting',
  'CustomerDiscovery',
  'BillingSummary',
  'EligibilitySummary',
  'PlanAndFeatureSummary',
  'FamilyAndDeviceSummary',
  'SelfServiceNextStep',
  'CalmClose',
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
  dovetalk: {
    label: 'DoveTalk',
    className: 'source-dovetalk',
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
  const familyAccess = billingGuide.familyPlans.find((item) => item.title === 'Who can use FirstNet and Family')
  const familyDiscounts = billingGuide.familyPlans.find((item) => item.title === 'Discounts and billing')
  const activationNote = studyNotes.find((note) => note.title === 'Activation Concepts')
  const billingOption = selfServiceGame.options.find((option) => option.id === 'firstnet-central-billing')
  const assistOption = selfServiceGame.options.find((option) => option.id === 'firstnet-assist-care')
  const priorityDefinition = findTerm(terms, 'First Priority')
  const coreDefinition = findTerm(terms, 'Dedicated FirstNet Core')

  return {
    GeneralGreeting: {
      title: 'GeneralGreeting',
      source: 'dovetalk',
      helper: 'Open with acknowledgement, ownership, and a low-pressure reason for the call.',
      text:
        'Thanks for taking the time to talk with me today. I can help review the FirstNet options with you, explain what applies to your situation, and make sure the next step is clear before we wrap up.',
    },
    CustomerDiscovery: {
      title: 'CustomerDiscovery',
      source: 'eligibility',
      helper: 'Confirm whether this is Subscriber Paid, Agency Paid, or family-line interest.',
      text: `Before I recommend a path, I want to confirm whether this is for an individual public safety professional paying for their own service, or for an agency or organization providing service to employees or personnel. ${accountRoadmap.buckets.shared.facts[5]}`,
    },
    BillingSummary: {
      title: 'BillingSummary',
      source: 'billing',
      helper: 'Explain pricing assumptions, discounts, taxes/fees, and bill-pay path.',
      text: `${joinDetails(billingPriceRule)} For online bill pay, ${billingOption.detail}`,
    },
    EligibilitySummary: {
      title: 'EligibilitySummary',
      source: 'eligibility',
      helper: 'Explain eligibility without guessing from job title alone.',
      text: `${accountRoadmap.buckets.subscriber.facts[0]} ${accountRoadmap.buckets.agency.facts[0]} ${accountRoadmap.buckets.shared.facts[5]}`,
    },
    PlanAndFeatureSummary: {
      title: 'PlanAndFeatureSummary',
      source: 'cards',
      helper: 'Summarize plan choices and the FirstNet value proposition.',
      text: `For plan comparison, ${extraPlan.name} is listed at ${extraPlan.oneLinePrice} and includes ${extraPlan.headline.toLowerCase()} ${premiumPlan.name} adds ${premiumPlan.features[2].toLowerCase()} ${elitePlan.name} adds ${elitePlan.features[3].toLowerCase()} ${priorityDefinition} ${coreDefinition}`,
    },
    FamilyAndDeviceSummary: {
      title: 'FamilyAndDeviceSummary',
      source: 'billing',
      helper: 'Use when the customer asks about family lines or activation requirements.',
      text: `${joinDetails(familyAccess)} ${joinDetails(familyDiscounts)} ${joinDetails(activationNote)}`,
    },
    SelfServiceNextStep: {
      title: 'SelfServiceNextStep',
      source: 'sso',
      helper: 'Give the customer a practical self-service or support path.',
      text: `${billPayRule.details.join(' ')} ${assistOption.detail}`,
    },
    CalmClose: {
      title: 'CalmClose',
      source: 'dovetalk',
      helper: 'End with summary, next step, and agreement check.',
      text:
        'To summarize, we reviewed the account type, plan or feature fit, billing expectations, and the best next step. Does that plan sound good for what you need today, or would you like me to review one more option with you?',
    },
  }
}

function getInitialDraft(scriptSections) {
  return sectionOrder.reduce((draft, key) => {
    draft[key] = scriptSections[key].text
    return draft
  }, {})
}

export default function PavoCristatus({ billingGuide, accountRoadmap, selfServiceGame, studyNotes, terms }) {
  const scriptSections = useMemo(
    () => buildGeneratedScript({ billingGuide, accountRoadmap, selfServiceGame, studyNotes, terms }),
    [accountRoadmap, billingGuide, selfServiceGame, studyNotes, terms],
  )
  const [draft, setDraft] = useState(() => getInitialDraft(scriptSections))

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

  const combinedScript = sectionOrder.map((key) => draft[key]).join('\n\n')

  return (
    <div className="pavo-cristatus">
      <section className="pavo-generated-layout" aria-label="PavoCristatus generated script">
        <aside className="pavo-center">
          <img className="pavo-logo" src={pavoLogo} alt="Peacock logo for PavoCristatus" />
          <div>
            <p className="eyebrow">Pavo cristatus</p>
            <h3>Collaborative Script</h3>
            <p>Generated first. Editable by section. Color tags show the source tab.</p>
          </div>
        </aside>

        <div className="pavo-script-editor">
          {sectionOrder.map((key) => {
            const section = scriptSections[key]
            const meta = sourceMeta[section.source]

            return (
              <article className={`pavo-script-section ${meta.className}`} key={key}>
                <div className="pavo-section-heading">
                  <div>
                    <p className="eyebrow">{section.title}</p>
                    <h3>{section.title}</h3>
                  </div>
                  <span>{meta.label}</span>
                </div>
                <p>{section.helper}</p>
                <textarea
                  aria-label={`Edit ${section.title}`}
                  value={draft[key]}
                  onChange={(event) => updateSection(key, event.target.value)}
                />
                <button type="button" onClick={() => resetSection(key)}>
                  Reset section
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="pavo-script-panel">
        <div className="section-heading compact">
          <p className="eyebrow">Full Script</p>
          <h3>Current customer-facing script</h3>
        </div>
        <pre className="pavo-full-script">{combinedScript}</pre>
      </section>
    </div>
  )
}
