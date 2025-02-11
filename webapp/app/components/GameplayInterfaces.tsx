import React from "react";

// ---------------------------
// Interface de Question
// ---------------------------
interface QuestionInterfaceProps {
  question: string;
  answers: [string, string, string]; // trois réponses
  onAnswerClick: (answer: string) => void;
  onRegenerate: () => void;
  remainingRegenerations: number;
}

export const QuestionInterface: React.FC<QuestionInterfaceProps> = ({
  question,
  answers,
  onAnswerClick,
  onRegenerate,
  remainingRegenerations,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <p className="text-center mb-8 text-[70px]">
        {question}
      </p>
      <div className="flex flex-col items-center space-y-4">
        {answers.map((answer, index) => (
          <button
            key={index}
            className="px-8 py-4 bg-blue-500 text-white rounded"
            onClick={() => onAnswerClick(answer)}
          >
            {answer}
          </button>
        ))}
        <button
          className="w-16 h-16 bg-gray-600 text-white rounded flex items-center justify-center"
          onClick={onRegenerate}
          disabled={remainingRegenerations <= 0}
          title="Régénérer la question"
        >
          ↻
        </button>
      </div>
      <p className="mt-4">
        Régénérations restantes: {remainingRegenerations}
      </p>
    </div>
  );
};

// ---------------------------
// Interface de Contexte
// ---------------------------
export interface Indicator {
  name: string;
  // Tableau des gains/pertes sur les cinq dernières années
  changes: number[]; 
}

interface ContextInterfaceProps {
  contextText: string;
  indicators: Indicator[]; // Doit contenir Santé, Karma, Argent, Compétences Sociales, QI
  onContinue: () => void;
}

export const ContextInterface: React.FC<ContextInterfaceProps> = ({
  contextText,
  indicators,
  onContinue,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="bg-[#191919] p-8 rounded-[20px] w-full max-w-2xl">
        <h2 className="text-center text-white text-[50px] mb-4">Contexte</h2>
        <p className="text-white mb-8">{contextText}</p>
        <div className="mb-8">
          {indicators.map((indicator, index) => (
            <div key={index} className="mb-2">
              <span className="text-white font-bold">{indicator.name}:</span>
              {indicator.changes.map((change, idx) => (
                <span
                  key={idx}
                  className={`ml-2 ${change >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {change >= 0 ? `+${change}` : change}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded"
            onClick={onContinue}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}; 