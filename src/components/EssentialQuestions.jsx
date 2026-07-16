import { useMemo, useState } from 'react'

const categories = [
  {
    id: 'triage',
    label: 'Call Triage',
    customerSays: '“I need help with my FirstNet account, but I am not sure where to start.”',
    goal: 'Identify the account path, caller need, and safe next step before giving plan, billing, device, or eligibility guidance.',
    openingQuestions: [
      'Are you calling about billing, eligibility, account access, a device, activation, coverage, travel, or an upgrade?',
      'Is this for an individual FirstNet account, an agency/organization-managed account, or a family/commercial line connected to FirstNet and Family?',
      'Are you the account owner, verified FirstNet user, authorized agency contact, or family-line user?',
      'What is the phone number, line, device, or service that the question is about?',
    ],
    questions: [
      {
        ask: 'What changed most recently: a bill, a plan, a device, a SIM/eSIM, account access, eligibility, or location?',
        why: 'Recent changes often point to the right workflow without guessing.',
      },
      {
        ask: 'Do you need an explanation, a self-service path, a compatibility check, or help deciding what to verify next?',
        why: 'This separates education from account action.',
      },
      {
        ask: 'Have you already signed in to FirstNet Central or used FirstNet Assist?',
        why: 'The app data lists FirstNet Central and FirstNet Assist as support paths for billing, account, and device help.',
      },
    ],
    verify: [
      'Do not quote prices, eligibility, device promos, 5G availability, or travel features until the exact account context is verified.',
      'Use this guide to ask better questions; it is not a replacement for official account tools.',
    ],
  },
  {
    id: 'iru',
    label: 'IRU / Subscriber Paid',
    customerSays: '“This is my personal FirstNet line, and I pay the bill.”',
    goal: 'Confirm whether the caller matches the Subscriber Paid path used throughout the app before discussing individual plans, family lines, or personal billing.',
    openingQuestions: [
      'Are you the verified FirstNet user who pays for this service?',
      'Are you calling about only your FirstNet line, or also family lines on FirstNet and Family?',
      'Is the account already active, or are you trying to verify eligibility and sign up?',
    ],
    questions: [
      {
        ask: 'Which individual plan are you asking about: Value 2.0, Extra 2.0, Premium 2.0, or Elite 2.0?',
        why: 'The app data shows those individual plans differ by price, hotspot/tablet/wearable benefits, and international features.',
      },
      {
        ask: 'Are AutoPay and paperless billing already set up, or are you asking why the published price does not match the bill yet?',
        why: 'The app data says eligible AutoPay and paperless discounts start within two bills, with taxes and fees extra.',
      },
      {
        ask: 'Are family members already on another AT&T account?',
        why: 'The app data says family members on a separate AT&T account must visit a store to combine accounts.',
      },
      {
        ask: 'Is each FirstNet user on the account limited to one phone, watch, tablet, and hotspot?',
        why: 'The app data lists that limit for FirstNet and Family account structure.',
      },
    ],
    verify: [
      'FirstNet and Family is available only to verified FirstNet Subscriber Paid Users.',
      'Family lines use AT&T commercial network service, not FirstNet network access.',
    ],
  },
  {
    id: 'cru',
    label: 'CRU / Agency Paid',
    customerSays: '“My agency or organization manages this FirstNet service.”',
    goal: 'Route agency-managed questions toward authorized account/admin workflows before discussing line changes, devices, or billing.',
    openingQuestions: [
      'Is this service paid or managed by an agency, department, employer, or organization?',
      'Are you the authorized account administrator/contact, or are you calling as the end user of the device?',
      'Is the question about one line/device, a group of users, pooled data, unlimited data, or Wireless Broadband?',
    ],
    questions: [
      {
        ask: 'Which agency plan category applies: unlimited, pooled data, or Wireless Broadband?',
        why: 'The app roadmap lists agency unlimited, pooled data, and Wireless Broadband plan categories.',
      },
      {
        ask: 'Is the device a smartphone, data-only device, router, modem, hotspot, rugged device, or other FirstNet Ready device?',
        why: 'Agency and device paths can differ by device type and data need.',
      },
      {
        ask: 'Is the issue about critical applications, failover, backup connectivity, quick deployment, or offsite connectivity?',
        why: 'The app roadmap positions Wireless Broadband for those use cases.',
      },
      {
        ask: 'Do you need user support, admin/billing help, or eligibility/account setup guidance?',
        why: 'Agency service should be handled through agency sign-up or FirstNet specialist workflows rather than guessed from job title alone.',
      },
    ],
    verify: [
      'Do not assume agency authorization from a job title alone.',
      'Agency-managed changes may require an agency admin or official FirstNet specialist workflow.',
    ],
  },
  {
    id: 'account',
    label: 'Account Issues',
    customerSays: '“I cannot get into my account, pay my bill, or find the right support path.”',
    goal: 'Identify whether the customer needs FirstNet Central, bill help, chat with an expert, or another self-service support path.',
    openingQuestions: [
      'Can you sign in to FirstNet Central?',
      'Are you trying to view/pay a bill, understand a bill, manage service, or chat with support?',
      'Are you seeing an access issue, a missing bill, a confusing charge, or a navigation problem?',
    ],
    questions: [
      {
        ask: 'Have you gone from FirstNet Central to Manage Services & Billing?',
        why: 'The app data says that path leads to the AT&T account overview for the bill linked to the FirstNet account.',
      },
      {
        ask: 'Are you looking for a bill explanation rather than payment?',
        why: 'FirstNet Central includes Quick Help & Tutorials with bill explanation resources in the app data.',
      },
      {
        ask: 'Do you need Spanish bill help?',
        why: 'The app data says a Spanish bill view is not available at this time, but a Spanish sample can be found through FirstNet Central FAQ and Billing.',
      },
      {
        ask: 'Can you sign in well enough to chat with an expert?',
        why: 'The app data says customers can sign in to FirstNet Central to chat with an expert or call 800.574.7000.',
      },
    ],
    verify: [
      'The app data says bill pay without logging in is not available.',
      'Avoid discussing account-specific details until the caller is verified in official tools.',
    ],
  },
  {
    id: 'devices',
    label: 'Devices',
    customerSays: '“I need help with a phone, hotspot, SIM, eSIM, BYOD, or upgrade.”',
    goal: 'Separate device compatibility, device type, SIM/eSIM path, offer requirements, and activation status.',
    openingQuestions: [
      'What exact device model is involved?',
      'Is this a new purchase, upgrade, BYOD device, replacement, rugged device, hotspot, router, or modem?',
      'Is the issue about compatibility, activation, pricing, trade-in, SIM/eSIM, or troubleshooting?',
    ],
    questions: [
      {
        ask: 'What is the IMEI for the device?',
        why: 'The app device terminology says IMEI identifies the phone or connected device for compatibility, activation, or upgrade details.',
      },
      {
        ask: 'Is the customer using a physical FirstNet Trio SIM or eSIM?',
        why: 'The app data says FirstNet plans require a capable device provisioned with a FirstNet Trio SIM or eSIM.',
      },
      {
        ask: 'If it is a physical SIM issue, what is the ICCID?',
        why: 'The app terminology says ICCID identifies the physical SIM card.',
      },
      {
        ask: 'If it is an eSIM issue, what is the EID?',
        why: 'The app terminology says EID identifies eSIM capability on compatible devices.',
      },
      {
        ask: 'Is there a published device-specific offer, and what are the trade-in, installment, plan, SIM, or verification requirements?',
        why: 'The D-Vice data warns not to quote an upgrade until device, offer, and requirements match.',
      },
    ],
    verify: [
      'FirstNet service depends on compatible/capable device and the correct SIM or eSIM path.',
      'Do not apply smartphone promo assumptions to rugged or specialty devices.',
    ],
  },
  {
    id: 'activations',
    label: 'Activations',
    customerSays: '“I need to activate service, eSIM, a physical SIM, or a device.”',
    goal: 'Confirm account type, device compatibility, SIM type, and identifiers before walking through activation expectations.',
    openingQuestions: [
      'Is this a new line, replacement device, BYOD activation, eSIM activation, or physical SIM activation?',
      'Is the account Subscriber Paid, Agency Paid, or a family/commercial line?',
      'Is the device compatible or FirstNet Ready/Capable?',
    ],
    questions: [
      {
        ask: 'Are we activating with a removable physical SIM or with eSIM?',
        why: 'The app data says FirstNet supports Trio SIM and eSIM on compatible devices.',
      },
      {
        ask: 'Do we have the correct identifier: IMEI for the device, ICCID for physical SIM, or EID for eSIM?',
        why: 'Each identifier answers a different activation question.',
      },
      {
        ask: 'Has the device received any required software update?',
        why: 'The device terminology says some FirstNet Ready devices may need a software update.',
      },
      {
        ask: 'Is the caller trying to activate from official FirstNet Help resources or asking for the correct path?',
        why: 'The self-service data points customers to FirstNet Help for eSIM activation resources and device-specific tutorials.',
      },
    ],
    verify: [
      'Activation steps may differ by account type and device.',
      'Use official activation resources for the customer’s exact device and SIM path.',
    ],
  },
  {
    id: 'eligibility',
    label: 'Eligibility',
    customerSays: '“Do I qualify for FirstNet?”',
    goal: 'Ask enough context to guide the customer toward the right official eligibility workflow without deciding eligibility from role names alone.',
    openingQuestions: [
      'Are you applying as an individual first responder, through an agency, or as part of an essential-services organization?',
      'Are you trying to verify a new account or add/adjust service on an existing account?',
      'Is this for FirstNet service, FirstNet and Family, or an agency-managed account?',
    ],
    questions: [
      {
        ask: 'What role or organization type is connected to the request?',
        why: 'The app data gives examples such as volunteer firefighters, ER doctors, nurses, utilities, transportation, and healthcare.',
      },
      {
        ask: 'Is the customer paying personally, or is the agency/organization managing service?',
        why: 'Subscriber Paid and Agency Paid follow different account paths in the app roadmap.',
      },
      {
        ask: 'Is the customer asking about family lines?',
        why: 'FirstNet and Family is available only to verified Subscriber Paid Users in the app data.',
      },
      {
        ask: 'Has the customer used FirstNet Verify or an official agency sign-up/specialist workflow?',
        why: 'The app data points individual users toward FirstNet Verify and agency service toward agency workflows.',
      },
    ],
    verify: [
      'Do not infer eligibility from a role name alone.',
      'Use official eligibility verification workflows before promising access.',
    ],
  },
  {
    id: 'coverage',
    label: 'Coverage / Travel',
    customerSays: '“Will this work where I am, with 5G, or while traveling?”',
    goal: 'Separate coverage, device support, plan benefits, and international verification before setting expectations.',
    openingQuestions: [
      'Is the question about domestic coverage, 5G, Latin America, Elite international data, or International Day Pass?',
      'What exact location, destination, device, and plan are involved?',
      'Is the customer asking about talk/text, high-speed data, hotspot, roaming, or speed after a usage threshold?',
    ],
    questions: [
      {
        ask: 'What address or destination needs to be checked in official coverage or destination tools?',
        why: 'The HeatMap is a training aid, not a live address-level coverage checker.',
      },
      {
        ask: 'Does the customer have a compatible device for 5G?',
        why: 'The app data says 5G access requires a compatible device and is not available everywhere.',
      },
      {
        ask: 'Is the customer on Premium 2.0 or Elite 2.0 and asking about Latin America?',
        why: 'The app data says Premium and Elite include talk, text, and high-speed data in 20 Latin American countries, but the exact list must be verified.',
      },
      {
        ask: 'Is the customer on Elite 2.0 and asking about global international data?',
        why: 'The app data says Elite includes 20GB international data per month for over 210 destinations; after 20GB, speeds may be reduced to a maximum of 512 Kbps.',
      },
      {
        ask: 'Is the customer asking about International Day Pass?',
        why: 'The app does not store exact IDP pricing or destination lists, so availability, price, and account eligibility must be verified.',
      },
    ],
    verify: [
      'Verify destination, device, plan, and account before quoting international expectations.',
      'Coverage and data speeds vary.',
    ],
  },
]

export default function EssentialQuestions() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const activeGuide = useMemo(
    () => categories.find((category) => category.id === activeCategory) ?? categories[0],
    [activeCategory],
  )

  return (
    <div className="essential-questions">
      <section className="question-hero">
        <div>
          <p className="eyebrow">Live Call Guide</p>
          <h2>Essential Questions by Customer Need</h2>
          <p>
            Toggle the caller’s need, then use the questions to identify the account
            path, verify the right details, and avoid giving an answer before the facts
            match the customer’s situation.
          </p>
        </div>
        <div className="question-callout">
          <strong>Call rule</strong>
          <span>Ask, verify, then explain. Do not quote account-specific facts from memory.</span>
        </div>
      </section>

      <div className="question-category-tabs" aria-label="Customer need categories">
        {categories.map((category) => (
          <button
            className={activeGuide.id === category.id ? 'active' : ''}
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <section className="question-workspace">
        <aside className="question-scenario">
          <p className="eyebrow">Customer Cue</p>
          <h3>{activeGuide.customerSays}</h3>
          <p>{activeGuide.goal}</p>
        </aside>

        <div className="question-stack">
          <section className="question-panel">
            <div className="section-heading compact">
              <p className="eyebrow">Start Here</p>
              <h3>Opening Filter Questions</h3>
            </div>
            <ol className="question-list">
              {activeGuide.openingQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </section>

          <section className="question-panel">
            <div className="section-heading compact">
              <p className="eyebrow">Guide</p>
              <h3>Essential Questions</h3>
            </div>
            <div className="essential-question-grid">
              {activeGuide.questions.map((question) => (
                <article key={question.ask}>
                  <strong>{question.ask}</strong>
                  <p>{question.why}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="question-panel verification-panel">
            <div className="section-heading compact">
              <p className="eyebrow">Do Not Skip</p>
              <h3>Verification Cautions</h3>
            </div>
            <ul>
              {activeGuide.verify.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  )
}
