import EagleHighlight from './EagleHighlight'
import { getEagleHighlightScore } from '../utils/eagleHighlightScoring'

function flattenText(values) {
  return values.flatMap((value) => {
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return flattenText(value)
    if (value && typeof value === 'object') return flattenText(Object.values(value))
    return []
  })
}

function BulletList({ items, eagleEye, compareWith = [] }) {
  const bestIndex = items.reduce((winnerIndex, item, index) => {
    const itemCompareWith = [...compareWith, ...items.slice(0, index)]
    const score = getEagleHighlightScore(item, itemCompareWith)
    const winningScore =
      winnerIndex === -1
        ? 0
        : getEagleHighlightScore(items[winnerIndex], [...compareWith, ...items.slice(0, winnerIndex)])

    return score > winningScore ? index : winnerIndex
  }, -1)

  return (
    <ul>
      {items.map((item, index) => (
        <li key={item}>
          <EagleHighlight
            compareWith={[...compareWith, ...items.slice(0, index)]}
            enabled={eagleEye && index === bestIndex}
            text={item}
          />
        </li>
      ))}
    </ul>
  )
}

export default function BillingEligibilityGuide({ guide, eagleEye }) {
  return (
    <div className="billing-guide">
      <div className="billing-guide-intro">
        <p>
          <EagleHighlight enabled={eagleEye} text={guide.sourceNote} />
        </p>
      </div>

      <section className="billing-panel">
        <div className="section-heading compact">
          <p className="eyebrow">Subscriber Paid</p>
          <h3>Individual FirstNet Plan Matrix</h3>
        </div>
        <div className="plan-table">
          {guide.individualPlans.map((plan, index) => {
            const siblingPlans = guide.individualPlans.filter((_, planIndex) => planIndex !== index)
            const siblingText = flattenText(siblingPlans)

            return (
              <article className="plan-row" key={plan.name}>
                <div className="plan-row-main">
                  <h4>{plan.name}</h4>
                  <strong>
                    <EagleHighlight
                      compareWith={guide.individualPlans
                        .filter((_, planIndex) => planIndex !== index)
                        .map((item) => item.oneLinePrice)}
                      enabled={eagleEye}
                      text={plan.oneLinePrice}
                    />
                  </strong>
                  <p>
                    <EagleHighlight compareWith={siblingText} enabled={eagleEye} text={plan.headline} />
                  </p>
                </div>
                <div>
                  <h5>Multi-line pricing</h5>
                  <BulletList
                    compareWith={siblingPlans.flatMap((item) => item.multiLinePricing)}
                    eagleEye={eagleEye}
                    items={plan.multiLinePricing}
                  />
                </div>
                <div>
                  <h5>Verified features</h5>
                  <BulletList
                    compareWith={siblingPlans.flatMap((item) => item.features)}
                    eagleEye={eagleEye}
                    items={plan.features}
                  />
                </div>
              </article>
            )
          })}
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
                <BulletList
                  compareWith={flattenText(
                    guide.billingRules.filter((item) => item.title !== rule.title).map((item) => item.details),
                  )}
                  eagleEye={eagleEye}
                  items={rule.details}
                />
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
                <BulletList
                  compareWith={flattenText(
                    guide.eligibility
                      .filter((eligibilityItem) => eligibilityItem.group !== item.group)
                      .map((eligibilityItem) => eligibilityItem.details),
                  )}
                  eagleEye={eagleEye}
                  items={item.details}
                />
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
              <BulletList
                compareWith={flattenText(
                  guide.familyPlans
                    .filter((familyItem) => familyItem.title !== item.title)
                    .map((familyItem) => familyItem.details),
                )}
                eagleEye={eagleEye}
                items={item.details}
              />
            </article>
          ))}
        </div>

        <div className="family-plan-options">
          {guide.familyPlanOptions.map((plan, index) => {
            const siblingPlans = guide.familyPlanOptions.filter((_, planIndex) => planIndex !== index)

            return (
              <article className="family-plan-card" key={plan.name}>
                <h4>{plan.name}</h4>
                <p>
                  <EagleHighlight
                    compareWith={siblingPlans.map((item) => item.pricing)}
                    enabled={eagleEye}
                    text={plan.pricing}
                  />
                </p>
                <BulletList
                  compareWith={siblingPlans.flatMap((item) => item.details)}
                  eagleEye={eagleEye}
                  items={plan.details}
                />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
