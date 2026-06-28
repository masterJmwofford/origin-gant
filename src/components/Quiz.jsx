import { useMemo, useState } from "react";

export default function Quiz({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = useMemo(
    () => Math.round(((currentIndex + (answered ? 1 : 0)) / questions.length) * 100),
    [answered, currentIndex, questions.length],
  );

  function chooseAnswer(option) {
    if (answered) return;

    setSelectedAnswer(option);
    setAnswered(true);

    if (option === currentQuestion.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex === questions.length - 1) {
      setCurrentIndex(0);
      setSelectedAnswer("");
      setScore(0);
      setAnswered(false);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer("");
    setAnswered(false);
  }

  return (
    <div className="quiz-card">
      <div className="quiz-meta">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div className="progress" aria-label="Quiz progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <h3>{currentQuestion.prompt}</h3>

      <div className="options">
        {currentQuestion.options.map((option) => {
          let className = "option";

          if (answered && option === currentQuestion.answer) {
            className += " correct";
          } else if (answered && option === selectedAnswer) {
            className += " incorrect";
          }

          return (
            <button
              className={className}
              key={option}
              type="button"
              onClick={() => chooseAnswer(option)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="quiz-result">
          <p>
            {selectedAnswer === currentQuestion.answer
              ? "Correct."
              : `Not quite. Correct answer: ${currentQuestion.answer}.`}
          </p>
          <button className="primary" type="button" onClick={nextQuestion}>
            {currentIndex === questions.length - 1 ? "Restart quiz" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}
