// 选择卡

'use client'
import { useState } from 'react';

export default function QuizCard({ question, options, answer, explanation }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
  };

  const isCorrect = selected === answer;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
          互动答题
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">{question}</h2>

      <div className="space-y-3">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              showResult
                ? option === answer
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : option === selected
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-100 text-gray-400'
                : 'border-gray-100 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showResult && (
        <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? '🎉 回答正确！' : '😅 再接再厉'}
          </p>
          <p className="text-sm mt-1 text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  );
}
