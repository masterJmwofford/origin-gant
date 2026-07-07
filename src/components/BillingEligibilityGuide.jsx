function BulletList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function BillingEligibilityGuide({ guide }) {
  return (
    <div className="billing-guide">
      <div className="billing-guide-intro">
        <p>{guide.sourceNote}</p>
      </div>

      <section className="billing-panel">
        <div className="section-heading compact">
          <p className="eyebrow">Subscriber Paid</p>
          <h3>Individual FirstNet Plan Matrix</h3>
        </div>
        <div className="plan-table">
          {guide.individualPlans.map((plan) => (
            <article className="plan-row" key={plan.name}>
              <div className="plan-row-main">
                <h4>{plan.name}</h4>
                <strong>{plan.oneLinePrice}</strong>
                <p>{plan.headline}</p>
              </div>
              <div>
                <h5>Multi-line pricing</h5>
                <BulletList items={plan.multiLinePricing} />
              </div>
              <div>
                <h5>Verified features</h5>
                <BulletList items={plan.features} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="billing-grid">
        <div className="billing-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Billing</p>
            <h3>Billing, Payment, and Support Rules</h3>
          </div>
          <div className="stacked-facts">
            {guide.billingRules.map((rule) => (
              <article className="fact-block" key={rule.title}>
                <h4>{rule.title}</h4>
                <BulletList items={rule.details} />
              </article>
            ))}
          </div>
        </div>

        <div className="billing-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Eligibility</p>
            <h3>Who FirstNet Says Is Eligible</h3>
          </div>
          <div className="stacked-facts">
            {guide.eligibility.map((item) => (
              <article className="fact-block" key={item.group}>
                <h4>{item.group}</h4>
                <BulletList items={item.details} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="billing-panel">
        <div className="section-heading compact">
          <p className="eyebrow">Family Lines</p>
          <h3>FirstNet and Family Rules</h3>
        </div>
        <div className="family-rules">
          {guide.familyPlans.map((item) => (
            <article className="fact-block" key={item.title}>
              <h4>{item.title}</h4>
              <BulletList items={item.details} />
            </article>
          ))}
        </div>

        <div className="family-plan-options">
          {guide.familyPlanOptions.map((plan) => (
            <article className="family-plan-card" key={plan.name}>
              <h4>{plan.name}</h4>
              <p>{plan.pricing}</p>
              <BulletList items={plan.details} />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
