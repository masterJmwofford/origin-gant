import FlashCard from "./FlashCard";

export default function FlashCardGrid({ terms }) {
  if (terms.length === 0) {
    return <p className="empty-state">No flashcards match that search yet.</p>;
  }

  return (
    <div className="grid">
      {terms.map((card) => (
        <FlashCard key={card.term} front={card.term} back={card.definition} />
      ))}
    </div>
  );
}
