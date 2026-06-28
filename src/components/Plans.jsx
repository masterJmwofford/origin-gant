import Accordion from "../components/Accordion";

export default function Plans({ plans }) {
  if (plans.length === 0) {
    return <p className="empty-state">No plan notes match that search yet.</p>;
  }

  return (
    <div className="accordion-list">
      {plans.map((plan) => (
        <Accordion key={plan.title} title={plan.title}>
          <p>{plan.summary}</p>
          <ul>
            {plan.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Accordion>
      ))}
    </div>
  );
}
