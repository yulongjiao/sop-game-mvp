'use client'

import { useState, useEffect } from 'react';
import { Trash2, Plus, Image as ImageIcon, Save, Menu, CheckCircle, Circle, Layout, X } from 'lucide-react';
// 确保引入了 saveCourseData
import { generateCourseAI, saveCourseData } from '../actions';

// === 模拟手机外壳 ===
const MobileFrame = ({ children }) => (
  <div className="w-[375px] h-[700px] border-[8px] border-gray-900 rounded-[3rem] overflow-hidden bg-gray-50 shadow-2xl relative mx-auto flex flex-col">
    <div className="absolute top-0 w-full h-6 bg-gray-900 z-50 flex justify-center">
        <div className="w-20 h-4 bg-black rounded-b-xl"></div>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
      {children}
    </div>
  </div>
);

// === 图标选择器小组件 ===
const IconSelector = ({ value, onChange }) => (
    <div className="flex gap-2">
        {['check', 'x', 'zap', 'alert', 'star', 'info'].map(icon => (
            <button 
                key={icon}
                onClick={() => onChange(icon)}
                className={`p-1 rounded ${value === icon ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
                {/* 这里为了简化直接显示文字，你可以换成 lucide 图标 */}
                <span className="text-xs font-bold uppercase">{icon[0]}</span>
            </button>
        ))}
    </div>
);

export default function AdminEditor() {
  const [courseData, setCourseData] = useState({ title: "新课程", cards: [] });
  const [activeIndex, setActiveIndex] = useState(0); 
  const [sopText, setSopText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // === 核心：AI 生成 ===
  async function handleAIGenerate() {
    if (!sopText.trim()) return;
    setIsProcessing(true);
    try {
      const result = await generateCourseAI(sopText);
      if (result.success) {
        setCourseData(result.data);
        setActiveIndex(0);
      } else {
        alert("生成失败: " + result.error);
      }
    } catch (e) {
      alert("网络错误");
    } finally {
      setIsProcessing(false);
    }
  }
{/* === 放在 AdminEditor 组件内部，handleAIGenerate 函数的下面 === */}

// 📋 新增：保存函数
async function handleSave() {
  setIsProcessing(true); // 借用一下 loading 状态
  try {
    const result = await saveCourseData(courseData);
    if (result.success) {
      alert("✅ 发布成功！快去手机端刷新看看！");
    } else {
      alert("❌ 保存失败: " + result.error);
    }
  } catch (e) {
    alert("❌ 网络错误");
  } finally {
    setIsProcessing(false);
  }
}

  // === 通用更新函数 ===
  const updateCurrentCard = (field, value) => {
    const newCards = [...courseData.cards];
    newCards[activeIndex] = { ...newCards[activeIndex], [field]: value };
    setCourseData({ ...courseData, cards: newCards });
  };

  // 深度更新 (用于 left.title, right.desc 这种嵌套结构)
  const updateDeepCard = (parent, field, value) => {
    const newCards = [...courseData.cards];
    const current = newCards[activeIndex];
    // 确保父对象存在
    if (!current[parent]) current[parent] = {};
    
    newCards[activeIndex] = {
        ...current,
        [parent]: { ...current[parent], [field]: value }
    };
    setCourseData({ ...courseData, cards: newCards });
  };

  // 更新列表项 (List Item)
  const updateListItem = (itemIndex, field, value) => {
    const newCards = [...courseData.cards];
    const current = newCards[activeIndex];
    const newItems = [...(current.items || [])];
    if (!newItems[itemIndex]) newItems[itemIndex] = {};
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    newCards[activeIndex] = { ...current, items: newItems };
    setCourseData({ ...courseData, cards: newCards });
  };

  // 增加/删除列表项
  const addListItem = () => {
    const newCards = [...courseData.cards];
    const items = newCards[activeIndex].items || [];
    newCards[activeIndex].items = [...items, { title: "新项目", desc: "描述", icon: "star", color: "blue" }];
    setCourseData({ ...courseData, cards: newCards });
  };

  const removeListItem = (idx) => {
    const newCards = [...courseData.cards];
    newCards[activeIndex].items = newCards[activeIndex].items.filter((_, i) => i !== idx);
    setCourseData({ ...courseData, cards: newCards });
  };

  const activeCard = courseData.cards[activeIndex];

  // === 渲染编辑器：根据 Variant 分发 ===
  const renderInfoEditor = () => {
    const variant = activeCard.variant || 'classic';

    // 1. 经典 / 英雄 / 引言 (结构类似，都是图+文)
    if (['classic', 'hero', 'quote', 'magazine'].includes(variant)) {
        return (
            <div className={`h-full flex flex-col ${variant === 'magazine' ? 'bg-black text-white' : 'bg-white'}`}>
                <div className="h-1/2 relative group cursor-pointer bg-gray-100">
                    <img src={`https://picsum.photos/seed/${activeCard.imageKeyword}/800/600`} className={`w-full h-full object-cover ${variant==='magazine'?'opacity-50 grayscale':''}`} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <span className="text-white font-bold flex gap-2"><ImageIcon/> 换图关键词</span>
                    </div>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <input 
                        value={activeCard.title}
                        onChange={(e) => updateCurrentCard('title', e.target.value)}
                        className={`text-2xl font-bold w-full mb-4 outline-none bg-transparent border-b border-transparent focus:border-blue-500 ${variant==='magazine'?'text-yellow-400 font-black italic':'text-gray-900'}`}
                    />
                    <textarea 
                        value={activeCard.content}
                        onChange={(e) => updateCurrentCard('content', e.target.value)}
                        className={`w-full h-full resize-none leading-relaxed text-lg outline-none bg-transparent border border-transparent focus:border-blue-500 rounded-lg p-2 ${variant==='magazine'?'text-gray-300 font-light tracking-widest':'text-gray-600'}`}
                    />
                </div>
            </div>
        );
    }

    // 2. 结构化清单 (List with Icons)
    if (variant === 'list_with_icons') {
        return (
            <div className="h-full bg-gradient-to-br from-indigo-50 to-blue-50 p-6 overflow-y-auto">
                <input 
                    value={activeCard.title}
                    onChange={(e) => updateCurrentCard('title', e.target.value)}
                    className="text-2xl font-bold text-indigo-900 mb-6 bg-transparent outline-none w-full border-b border-indigo-100 focus:border-indigo-300"
                />
                <div className="space-y-4 pb-20">
                    {(activeCard.items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-blue-300 transition-all group relative">
                            {/* 删除按钮 */}
                            <button onClick={() => removeListItem(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-md z-10">
                                <X size={12} />
                            </button>
                            
                            <div className="flex flex-col gap-2 items-center pt-1">
                                <IconSelector value={item.icon} onChange={(val) => updateListItem(idx, 'icon', val)} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color==='red'?'bg-red-100 text-red-500':'bg-blue-100 text-blue-500'}`}>
                                    <div className="w-4 h-4 bg-current rounded-full" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <input 
                                    value={item.title} 
                                    onChange={(e) => updateListItem(idx, 'title', e.target.value)}
                                    className="font-bold text-gray-800 w-full outline-none border-b border-gray-100 focus:border-blue-300"
                                    placeholder="项目标题"
                                />
                                <input 
                                    value={item.desc} 
                                    onChange={(e) => updateListItem(idx, 'desc', e.target.value)}
                                    className="text-sm text-gray-500 w-full outline-none border-b border-gray-100 focus:border-blue-300"
                                    placeholder="项目描述"
                                />
                            </div>
                        </div>
                    ))}
                    <button onClick={addListItem} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-400 rounded-xl font-bold hover:bg-indigo-50">
                        + 添加项目
                    </button>
                </div>
            </div>
        );
    }

    // 3. 左右对比 (Comparison)
    if (variant === 'comparison') {
        const left = activeCard.left || {};
        const right = activeCard.right || {};
        return (
            <div className="h-full bg-white flex flex-col p-6">
                <input 
                    value={activeCard.title}
                    onChange={(e) => updateCurrentCard('title', e.target.value)}
                    className="text-xl font-bold text-center mb-6 outline-none border-b focus:border-blue-500"
                />
                <div className="flex-1 flex gap-2">
                    {/* 左侧：错误 */}
                    <div className="flex-1 bg-red-50 rounded-2xl p-4 flex flex-col border border-red-100">
                        <div className="text-center mb-4"><X className="inline text-red-500 w-8 h-8"/></div>
                        <input 
                            value={left.title || ''}
                            onChange={(e) => updateDeepCard('left', 'title', e.target.value)}
                            className="font-bold text-red-900 mb-2 bg-transparent outline-none text-center placeholder-red-300"
                            placeholder="错误做法"
                        />
                        <textarea 
                            value={left.desc || ''}
                            onChange={(e) => updateDeepCard('left', 'desc', e.target.value)}
                            className="text-xs text-red-700 bg-transparent outline-none flex-1 resize-none text-center placeholder-red-300"
                            placeholder="描述后果..."
                        />
                    </div>
                    {/* 右侧：正确 */}
                    <div className="flex-1 bg-green-50 rounded-2xl p-4 flex flex-col border border-green-100">
                        <div className="text-center mb-4"><CheckCircle className="inline text-green-500 w-8 h-8"/></div>
                        <input 
                            value={right.title || ''}
                            onChange={(e) => updateDeepCard('right', 'title', e.target.value)}
                            className="font-bold text-green-900 mb-2 bg-transparent outline-none text-center placeholder-green-300"
                            placeholder="正确做法"
                        />
                        <textarea 
                            value={right.desc || ''}
                            onChange={(e) => updateDeepCard('right', 'desc', e.target.value)}
                            className="text-xs text-green-700 bg-transparent outline-none flex-1 resize-none text-center placeholder-green-300"
                            placeholder="描述好处..."
                        />
                    </div>
                </div>
            </div>
        );
    }

    // 4. 数据冲击 (Big Number)
    if (variant === 'big_number') {
        return (
            <div className="h-full bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="relative z-10 w-full">
                    <input 
                        value={activeCard.title}
                        onChange={(e) => updateCurrentCard('title', e.target.value)}
                        className="text-lg text-gray-400 mb-8 uppercase tracking-widest text-center bg-transparent outline-none w-full"
                    />
                    <div className="flex items-baseline justify-center mb-4 gap-2">
                        <input 
                            value={activeCard.number || ''}
                            onChange={(e) => updateCurrentCard('number', e.target.value)}
                            className="text-7xl font-black text-blue-400 bg-transparent outline-none w-32 text-right"
                            placeholder="00"
                        />
                        <input 
                            value={activeCard.unit || ''}
                            onChange={(e) => updateCurrentCard('unit', e.target.value)}
                            className="text-2xl font-bold bg-transparent outline-none w-16 text-left"
                            placeholder="单位"
                        />
                    </div>
                    <textarea 
                        value={activeCard.desc || ''}
                        onChange={(e) => updateCurrentCard('desc', e.target.value)}
                        className="text-xl font-medium bg-transparent outline-none w-full text-center resize-none h-32 text-gray-300"
                        placeholder="输入说明文字..."
                    />
                </div>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-sm">
      
      {/* === 左侧列表 === */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
            <h1 className="font-bold text-lg text-gray-800">课程大纲</h1>
            <input 
                value={courseData.title} 
                onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                className="w-full mt-2 p-1 font-medium border-b border-transparent focus:border-blue-500 outline-none"
            />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {courseData.cards.map((card, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                idx === activeIndex ? 'bg-blue-50 border-blue-200 border shadow-sm' : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                {idx + 1}
              </div>
              <div className="flex-1 truncate">
                <div className="font-bold text-gray-700 truncate">{card.title || '无标题'}</div>
                <div className="text-xs text-gray-400 uppercase flex items-center gap-1">
                   {card.type === 'quiz' ? '❓ 题目' : <Layout size={10}/>}
                   {/* 显示中文别名 */}
                   {card.variant === 'comparison' && '对比'}
                   {card.variant === 'list_with_icons' && '清单'}
                   {card.variant === 'big_number' && '数据'}
                   {!['comparison','list_with_icons','big_number'].includes(card.variant) && card.type !== 'quiz' && '图文'}
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2">
            <Plus size={16} /> 添加卡片
          </button>
        </div>
      </div>

      {/* === 中间编辑器 === */}
      <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center p-8 relative">
        {/* ✨ 顶部工具栏：用来切换模版 ✨ */}
        {activeCard && activeCard.type === 'info' && (
            <div className="bg-white px-4 py-2 rounded-full shadow-sm mb-4 flex items-center gap-2">
                <span className="text-gray-400 text-xs font-bold uppercase">当前版式:</span>
                <select 
                    value={activeCard.variant || 'classic'}
                    onChange={(e) => updateCurrentCard('variant', e.target.value)}
                    className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer hover:text-blue-600"
                >
                    <option value="classic">📷 经典图文</option>
                    <option value="hero">🦸 英雄大图</option>
                    <option value="magazine">📰 时尚杂志</option>
                    <option value="list_with_icons">📝 结构清单</option>
                    <option value="comparison">🆚 左右对比</option>
                    <option value="big_number">🔢 关键数据</option>
                </select>
            </div>
        )}

        {activeCard ? (
            <MobileFrame>
                {/* 1. QUIZ 渲染 (复用之前的逻辑) */}
                {activeCard.type === 'quiz' ? (
                     <div className="h-full flex flex-col bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 overflow-y-auto">
                        <div className="text-xs font-bold opacity-50 mb-2 uppercase">编辑题目</div>
                        <textarea 
                            value={activeCard.question}
                            onChange={(e) => updateCurrentCard('question', e.target.value)}
                            className="text-2xl font-bold bg-transparent w-full mb-8 outline-none border-b border-white/20 focus:border-white resize-none"
                            rows={3}
                        />
                        <div className="space-y-4 mb-8">
                            {activeCard.options?.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <button 
                                        onClick={() => updateCurrentCard('answer', opt)}
                                        className={`p-1 rounded-full ${opt === activeCard.answer ? 'text-green-400' : 'text-white/30'}`}
                                    >
                                        {opt === activeCard.answer ? <CheckCircle size={24}/> : <Circle size={24}/>}
                                    </button>
                                    <input 
                                        value={opt}
                                        onChange={(val) => {
                                            const newOpts = [...activeCard.options];
                                            newOpts[idx] = val.target.value;
                                            updateCurrentCard('options', newOpts);
                                        }} 
                                        className="flex-1 bg-white/10 rounded-xl p-3 border border-transparent outline-none text-white"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="bg-black/20 rounded-xl p-4 border border-dashed border-white/10">
                            <div className="text-xs font-bold opacity-50 mb-1">解析</div>
                            <textarea value={activeCard.explanation} onChange={(e) => updateCurrentCard('explanation', e.target.value)} className="w-full bg-transparent text-sm outline-none resize-none h-20" />
                        </div>
                     </div>
                ) : (
                    // 2. INFO 渲染 (根据不同 variant)
                    renderInfoEditor()
                )}
            </MobileFrame>
        ) : (
            <div className="text-gray-400">请选择左侧卡片</div>
        )}
      </div>

      {/* === 右侧 AI === */}
      <div className="w-96 bg-white border-l flex flex-col p-4 gap-4">
        <h2 className="font-bold flex items-center gap-2">✨ AI 编剧助手</h2>
        
        {/* SOP 输入框 */}
        <textarea 
            className="flex-1 w-full p-4 border rounded-xl bg-gray-50 resize-none outline-none focus:ring-2 ring-blue-500 text-sm"
            placeholder="在此粘贴 SOP 文本..."
            value={sopText}
            onChange={e => setSopText(e.target.value)}
        />
        
        {/* 按钮 1: 生成课程 */}
        <button 
            onClick={handleAIGenerate}
            disabled={isProcessing}
            className={`py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isProcessing ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
        >
            {isProcessing ? '🧠 正在思考结构...' : '✨ 生成 / 重置课程'}
        </button>

        {/* 按钮 2: 保存发布 */}
        <button 
            onClick={handleSave}
            disabled={isProcessing}
            className="py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
            <Save size={16}/> 保存发布
        </button>
      </div>

    </div>
  );
}