import { useState, useEffect } from 'react';
import { Camera, Clock, ChevronRight, ChevronLeft, ShoppingCart, X } from 'lucide-react';
import { loadHistory } from '@/lib/history';
import { t } from '@/i18n/translations';
import DishCard from './DishCard';

const HistoryView = ({ theme = 'light', lang = 'zh', menuLanguage = 'zh', userCurrency = 'CNY', localCurrency = 'USD' }) => {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const isLight = theme === 'light';

  useEffect(() => {
    setRecords(loadHistory());
  }, []);

  if (selected) {
    return (
      <div className="h-full overflow-y-auto px-5 pt-10 pb-4">
        <button
          onClick={() => setSelected(null)}
          className={`flex items-center gap-1 text-sm mb-6 active:scale-95 transition-transform ${isLight ? 'text-amber-700' : 'text-amber-400'}`}
        >
          <ChevronLeft size={18} />
          {t(lang, 'history.back')}
        </button>

        <div className={`w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5 flex items-center justify-center ${isLight ? 'bg-stone-200' : 'bg-stone-800'}`}>
          {selected.photo ? (
            <img src={selected.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera size={40} className={isLight ? 'text-stone-400' : 'text-stone-600'} />
          )}
        </div>

        <div className={`flex items-center gap-2 mb-5 text-sm ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
          <Clock size={14} />
          <span>{selected.date} {selected.time}</span>
          <span className={isLight ? 'text-stone-300' : 'text-stone-600'}>·</span>
          <span>{t(lang, 'history.dishes', selected.dishCount)}</span>
        </div>

        <h3 className={`text-sm font-medium mb-3 tracking-wide ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
          {t(lang, 'history.dishList')}
        </h3>
        <div className={`rounded-xl overflow-hidden ${isLight ? 'bg-white shadow-sm' : 'bg-stone-800/60'}`}>
          {(selected.dishes || []).map((dish, idx) => (
            <button
              key={idx}
              onClick={() => dish.data && setSelectedDish(dish)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left active:opacity-70 transition-opacity ${dish.inCart ? (isLight ? 'bg-amber-50' : 'bg-amber-900/20') : ''} ${idx !== 0 ? (isLight ? 'border-t border-stone-100' : 'border-t border-stone-700/50') : ''}`}
            >
              <span className={`text-sm ${dish.inCart ? (isLight ? 'font-bold text-amber-800' : 'font-bold text-amber-200') : (isLight ? 'text-stone-600' : 'text-stone-300')}`}>
                {dish.name}
              </span>
              {dish.inCart && (
                <span className={`flex items-center gap-1 text-xs shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                  <ShoppingCart size={14} />
                  {t(lang, 'history.wantOrder')}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 菜品卡片弹窗 */}
        {selectedDish?.data && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setSelectedDish(null)}>
            <div className="w-full max-w-[340px]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedDish(null)}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ml-auto mb-2 active:scale-90 transition-transform"
              >
                <X size={16} color="white" />
              </button>
              <DishCard
                dish={selectedDish.data}
                displayLanguage={lang}
                menuLanguage={menuLanguage}
                userCurrency={userCurrency}
                localCurrency={localCurrency}
                lang={lang}
                theme={theme}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Camera size={48} className={isLight ? 'text-stone-300' : 'text-stone-600'} />
        <h3 className={`text-lg font-bold ${isLight ? 'text-stone-600' : 'text-amber-100'}`}>{t(lang, 'history.empty')}</h3>
        <p className={`text-sm mt-2 ${isLight ? 'text-stone-400' : 'text-stone-500'}`}>{t(lang, 'history.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-5 pt-10 pb-4">
      <h1 className={`text-2xl font-bold mb-6 ${isLight ? 'text-stone-700' : 'text-amber-100'}`}>{t(lang, 'history.title')}</h1>
      <div className="space-y-3">
        {records.map((record) => (
          <button
            key={record.id}
            onClick={() => setSelected(record)}
            className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors text-left ${isLight ? 'bg-white active:bg-stone-100 shadow-sm' : 'bg-stone-800/60 active:bg-stone-800'}`}
          >
            <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${isLight ? 'bg-stone-200' : 'bg-stone-700'}`}>
              {record.photo ? (
                <img src={record.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={20} className={isLight ? 'text-stone-400' : 'text-stone-500'} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={12} className={isLight ? 'text-stone-400' : 'text-stone-500'} />
                <span className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{record.date} {record.time}</span>
              </div>
              <p className={`text-sm ${isLight ? 'text-stone-700' : 'text-amber-100'}`}>
                {t(lang, 'history.found', record.dishCount)}
              </p>
            </div>

            <ChevronRight size={16} className={isLight ? 'text-stone-400' : 'text-stone-600'} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
