import { useState } from "react";

export default function FlashCard({ front, back }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      className={`flashcard ${flipped ? "flipped" : ""}`}
      type="button"
      onClick={() => setFlipped(!flipped)}
      aria-label={`Flip flashcard for ${front}`}
    >
      <span className="flashcard-inner">
        <span className="flash-front">{front}</span>
        <span className="flash-back">{back}</span>
      </span>

      <span className="card-hint">{flipped ? "Tap to hide" : "Tap to reveal"}</span>
    </button>
  );
}
