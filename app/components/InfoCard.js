import { CheckCircle, XCircle, Zap, AlertTriangle, Info, Star } from 'lucide-react';

// 图标映射表：让 AI 传字符串名字，我们映射成组件
const ICON_MAP = {
  check: CheckCircle,
  x: XCircle,
  zap: Zap,
  alert: AlertTriangle,
  info: Info,
  star: Star,
  default: Info
};

const VARIANTS = {
  // 1. 经典模式 (保持不变)
  classic: ({ title, content, imageUrl }) => (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="h-48 bg-gray-100">
        <img src={imageUrl} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  ),

  // 2. ✨ 清单模式 (Seede 风格)：左边图标，右边文字，适合讲要点
  // 数据结构要求：content 需要是一个 JSON 字符串数组，或者 AI 直接返回 items 数组
  list_with_icons: ({ title, items = [] }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 h-full flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-indigo-900 mb-8">{title}</h2>
      <div className="space-y-4">
        {items.map((item, idx) => {
          // 动态获取图标
          const IconComponent = ICON_MAP[item.icon] || ICON_MAP.star;
          return (
            <div key={idx} className="flex items-center bg-white p-4 rounded-xl shadow-sm">
              <div className={`p-2 rounded-full mr-4 ${item.color === 'red' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                <IconComponent size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),

  // 3. ✨ 对比模式 (VS 风格)：左右两栏，强烈的红绿对比
  comparison: ({ title, left, right }) => (
    <div className="bg-white rounded-3xl shadow-lg h-full flex flex-col p-6">
      <h2 className="text-xl font-bold text-center mb-6">{title}</h2>
      <div className="flex-1 flex gap-4">
        {/* 左边：错误/旧做法 */}
        <div className="flex-1 bg-red-50 rounded-2xl p-4 flex flex-col items-center text-center border border-red-100">
          <XCircle className="text-red-500 w-10 h-10 mb-2" />
          <h3 className="font-bold text-red-900 mb-1">{left.title}</h3>
          <p className="text-xs text-red-700">{left.desc}</p>
        </div>
        {/* 右边：正确/新做法 */}
        <div className="flex-1 bg-green-50 rounded-2xl p-4 flex flex-col items-center text-center border border-green-100">
          <CheckCircle className="text-green-500 w-10 h-10 mb-2" />
          <h3 className="font-bold text-green-900 mb-1">{right.title}</h3>
          <p className="text-xs text-green-700">{right.desc}</p>
        </div>
      </div>
    </div>
  ),
  
  // 4. ✨ 大数据模式：强调数字
  big_number: ({ title, number, unit, desc }) => (
    <div className="bg-slate-900 text-white rounded-3xl h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* 装饰背景圆 */}
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10">
            <h2 className="text-lg text-gray-400 mb-6 uppercase tracking-widest">{title}</h2>
            <div className="flex items-baseline justify-center mb-4">
                <span className="text-7xl font-black text-blue-400">{number}</span>
                <span className="text-2xl ml-2 font-bold">{unit}</span>
            </div>
            <p className="text-xl font-medium">{desc}</p>
        </div>
    </div>
  )
};

export default function InfoCard(props) {
  // 如果 AI 返回的结构里有 complexData，就优先用；否则用普通 content
  const variant = props.variant || 'classic';
  const SelectedLayout = VARIANTS[variant] || VARIANTS.classic;

  // 这里的 props 包含了 AI 返回的所有字段 (items, left, right, number...)
  return (
    <div className="h-[600px] w-full">
      <SelectedLayout {...props} imageUrl={`https://picsum.photos/seed/${props.imageKeyword || 'default'}/800/600`} />
    </div>
  );
}