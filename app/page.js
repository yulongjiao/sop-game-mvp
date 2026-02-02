'use client'

import { useState, useEffect } from 'react';
import { getCourseData } from './actions';
import InfoCard from './components/InfoCard'; // 你的全能图文组件
import QuizCard from './components/QuizCard'; // 你的答题组件

export default function MobileClient() {
  const [data, setData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 加载数据
  useEffect(() => {
    async function load() {
      const course = await getCourseData();
      setData(course);
    }
    load();
  }, []);

  if (!data) return <div className="h-screen flex items-center justify-center text-gray-400">正在加载课程...</div>;

  const currentCard = data.cards[currentIndex];
  const isLastCard = currentIndex === data.cards.length - 1;

  // 翻页逻辑
  const handleNext = () => {
    if (!isLastCard) setCurrentIndex(curr => curr + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(curr => curr - 1);
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 flex flex-col overflow-hidden shadow-2xl">
      {/* 顶部导航条 */}
      <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-10">
        <button onClick={handlePrev} disabled={currentIndex === 0} className="text-gray-400 disabled:opacity-30">
          ←
        </button>
        <div className="font-bold text-gray-700 truncate max-w-[200px]">
          {data.title}
        </div>
        <div className="text-xs text-gray-400 font-mono">
          {currentIndex + 1} / {data.cards.length}
        </div>
      </div>

      {/* 核心内容区：卡片渲染 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {currentCard.type === 'quiz' ? (
          <QuizCard 
            question={currentCard.question}
            options={currentCard.options}
            answer={currentCard.answer}
            explanation={currentCard.explanation}
          />
        ) : (
          // 把所有可能的字段都透传给 InfoCard，让它自己去选 variant
          <InfoCard 
            {...currentCard} 
          />
        )}
      </div>

      {/* 底部按钮 */}
      <div className="p-4 bg-white border-t shrink-0 safe-area-bottom">
        <button 
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all active:scale-95 ${
            isLastCard ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLastCard ? '🎉 完成课程' : '继续学习 →'}
        </button>
      </div>
    </div>
  );
}