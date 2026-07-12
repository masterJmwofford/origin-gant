import Accordion from "../components/Accordion";
import EagleHighlight from "./EagleHighlight";
import { getEagleHighlightScore } from "../utils/eagleHighlightScoring";

export default function Plans({ plans, eagleEye }) {
  if (plans.length === 0) {
    return <p className="empty-state">No plan notes match that search yet.</p>;
  }

  return (
    <div className="accordion-list">
      {plans.map((plan, planIndex) => {
        const siblingPlans = plans.filter((_, index) => index !== planIndex)
        const siblingText = siblingPlans.flatMap((item) => [item.summary, ...item.details])
        const bestDetailIndex = plan.details.reduce((winnerIndex, item, itemIndex) => {
          const itemCompareWith = [...siblingText, ...plan.details.slice(0, itemIndex)]
          const score = getEagleHighlightScore(item, itemCompareWith)
          const winningScore =
            winnerIndex === -1
              ? 0
              : getEagleHighlightScore(plan.details[winnerIndex], [
                  ...siblingText,
                  ...plan.details.slice(0, winnerIndex),
                ])

          return score > winningScore ? itemIndex : winnerIndex
        }, -1)

        return (
          <Accordion key={plan.title} title={plan.title}>
            <p>
              <EagleHighlight compareWith={siblingText} enabled={eagleEye} text={plan.summary} />
            </p>
            <ul>
              {plan.details.map((item, itemIndex) => (
                <li key={item}>
                  <EagleHighlight
                    compareWith={[...siblingText, ...plan.details.slice(0, itemIndex)]}
                    enabled={eagleEye && itemIndex === bestDetailIndex}
                    text={item}
                  />
                </li>
              ))}
            </ul>
          </Accordion>
        )
      })}
    </div>
  );
}
