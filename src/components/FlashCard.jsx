import { useState } from "react";
import EagleHighlight from "./EagleHighlight";

export default function FlashCard({ front, back, eagleEye, compareWith = [] }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      className={`flashcard ${flipped ? "flipped" : ""}`}
      type="button"
      onClick={() => setFlipped(!flipped)}
      aria-label={`Flip flashcard for ${front}`}
    >
      <span className="flashcard-inner">
        <span className="flash-front">
          <EagleHighlight compareWith={compareWith} enabled={eagleEye} text={front} />
        </span>
        <span className="flash-back">
          <EagleHighlight compareWith={compareWith} enabled={eagleEye} text={back} />
        </span>
      </span>

      <span className="card-hint">{flipped ? "Tap to hide" : "Tap to reveal"}</span>
    </button>
  );
}
