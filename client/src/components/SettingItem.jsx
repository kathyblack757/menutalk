import { ChevronRight } from 'lucide-react';

const SettingItem = ({ icon: Icon, title, value, onClick, isLast, isLight = true }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors text-left ${
      isLight
        ? `bg-white active:bg-gray-50 ${!isLast ? 'border-b border-gray-100' : ''}`
        : `hover:bg-stone-700/50 active:bg-stone-700 ${!isLast ? 'border-b border-stone-700/50' : ''}`
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={isLight ? 'text-[#333]' : 'text-amber-400'} strokeWidth={1.5} />
      <span className={`text-sm font-medium ${isLight ? 'text-[#1a1a1a]' : 'text-amber-100'}`}>{title}</span>
    </div>
    <div className="flex items-center gap-1">
      <span className={`text-sm ${isLight ? 'text-[#999]' : 'text-stone-400'}`}>{value}</span>
      <ChevronRight size={16} className={isLight ? 'text-[#CCC]' : 'text-stone-600'} />
    </div>
  </button>
);

export default SettingItem;
