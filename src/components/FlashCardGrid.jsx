import FlashCard from "./FlashCard";

export default function FlashCardGrid({ terms, eagleEye }) {
  if (terms.length === 0) {
    return <p className="empty-state">No flashcards match that search yet.</p>;
  }

  return (
    <div className="grid">
      {terms.map((card, index) => {
        const relatedCards = terms
          .filter((_, cardIndex) => cardIndex !== index)
          .flatMap((item) => [item.term, item.definition])

        return (
          <FlashCard
            compareWith={relatedCards}
            eagleEye={eagleEye}
            key={card.term}
            front={card.term}
            back={card.definition}
          />
        )
      })}
    </div>
  );
}
