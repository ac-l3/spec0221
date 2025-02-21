'use client';

import { useState } from 'react';
import { SPECTRAL_TYPES } from '../../lib/constants';

const QUESTIONS = [
  {
    id: 1,
    text: "When exploring a new topic, I tend to:",
    options: [
      { text: "Notice subtle patterns and details others miss", scores: { OBSERVER: 2, SYNTHESIZER: 1 } },
      { text: "Generate unexpected connections and ideas", scores: { CATALYST: 2, SYNTHESIZER: 1 } },
      { text: "Connect insights from different sources", scores: { SYNTHESIZER: 2, CATALYST: 1 } },
      { text: "Document and organize information systematically", scores: { ARCHIVIST: 2, OBSERVER: 1 } }
    ]
  },
  {
    id: 2,
    text: "My strongest contribution to research is:",
    options: [
      { text: "Identifying hidden patterns in data", scores: { OBSERVER: 2, ARCHIVIST: 1 } },
      { text: "Coming up with novel approaches", scores: { CATALYST: 2, OBSERVER: 1 } },
      { text: "Bridging different perspectives", scores: { SYNTHESIZER: 2, CATALYST: 1 } },
      { text: "Creating structured knowledge bases", scores: { ARCHIVIST: 2, SYNTHESIZER: 1 } }
    ]
  },
  {
    id: 3,
    text: "When sharing findings, I prefer to:",
    options: [
      { text: "Highlight detailed observations", scores: { OBSERVER: 2, ARCHIVIST: 1 } },
      { text: "Present unexpected insights", scores: { CATALYST: 2, SYNTHESIZER: 1 } },
      { text: "Show connections between ideas", scores: { SYNTHESIZER: 2, OBSERVER: 1 } },
      { text: "Provide organized documentation", scores: { ARCHIVIST: 2, CATALYST: 1 } }
    ]
  }
];

export default function SpectralQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    OBSERVER: 0,
    CATALYST: 0,
    SYNTHESIZER: 0,
    ARCHIVIST: 0
  });
  const [result, setResult] = useState(null);

  const handleAnswer = (option) => {
    // Update scores
    const newScores = { ...scores };
    Object.entries(option.scores).forEach(([type, score]) => {
      newScores[type] += score;
    });
    setScores(newScores);

    // Move to next question or show result
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const primaryType = Object.entries(newScores).reduce((a, b) => 
        b[1] > a[1] ? b : a
      )[0];
      
      setResult(SPECTRAL_TYPES[primaryType]);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          You are {result.name}!
        </h2>
        <p className="text-lg text-center mb-6">
          {result.description}
        </p>
        <div className="space-y-2">
          <h3 className="font-semibold">Key Traits:</h3>
          <ul className="list-disc pl-5">
            {result.traits.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </h2>
        <p className="text-lg">{question.text}</p>
      </div>
      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
} 