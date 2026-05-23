import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, Volume2, Loader2 } from 'lucide-react';
import { getCurrencySymbol, getDishTranslation } from '@/lib/format';
import { generateOrder } from '@/lib/api';
import { t } from '@/i18n/translations';

const CartSheet = ({ open, onOpenChange, cart, onUpdateQuantity, onRemove, userLanguage = 'zh', userCurrency = 'CNY', localCurrency = 'USD', lang = 'zh', theme = 'light', speechRate = 1 }) => {
  const [showScript, setShowScript] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [orderText, setOrderText] = useState('');
  const [orderTextLocal, setOrderTextLocal] = useState('');
  const isLight = theme === 'light';

  const mainCurrency = cart.length > 0 ? cart[0].menuCurrency || localCurrency : localCurrency;
  const totalMenu = cart.reduce((s, i) => s + (i.prices?.[i.menuCurrency] || i.prices?.[mainCurrency] || 0) * i.quantity, 0);
  const totalUser = cart.reduce((s, i) => s + (i.prices?.[userCurrency] || i.prices?.[i.menuCurrency] || i.prices?.[mainCurrency] || 0) * i.quantity, 0);

  const getItemName = (item, language) => getDishTranslation(item, language).name || item.originalName;

  const handleGenerate = async () => {
    if (showScript) {
      setShowScript(false);
      return;
    }
    setScriptLoading(true);
    setShowScript(true);
    try {
      const dishList = cart.map((i) => ({
        translatedName: getItemName(i, userLanguage),
        quantity: i.quantity,
      }));
      const result = await generateOrder(
        dishList,
        userLanguage,
        totalMenu.toFixed(2),
        totalUser.toFixed(2),
        userCurrency
      );
      setOrderText(result.orderText);
      setOrderTextLocal(result.orderTextLocal);
    } catch {
      setOrderText('点单文案生成失败，请重试');
      setOrderTextLocal('Failed to generate order script. Please try again.');
    } finally {
      setScriptLoading(false);
    }
  };

  const speak = () => {
    if (!orderText) return;
    const u = new SpeechSynthesisUtterance(orderText);
    const langMap = { zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' };
    u.lang = langMap[userLanguage] || 'en-US';
    u.rate = speechRate;
    window.speechSynthesis.speak(u);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={`h-[85vh] rounded-t-3xl flex flex-col ${isLight ? 'bg-white text-stone-800' : 'bg-stone-900 border-stone-800 text-amber-50'}`}>
        <SheetHeader className="shrink-0 pb-4">
          <SheetTitle className={`text-lg ${isLight ? 'text-stone-700' : 'text-amber-100'}`}>{t(lang, 'cart.title')}</SheetTitle>
        </SheetHeader>

        {/* 菜品列表 — 可滚动 */}
        <ScrollArea className="flex-1 min-h-0 pr-2">
          {!cart.length ? (
            <p className={`text-center py-8 ${isLight ? 'text-stone-400' : 'text-stone-400'}`}>{t(lang, 'cart.empty')}</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const itemName = getItemName(item, lang);
                const itemMenuPrice = item.prices?.[item.menuCurrency] || 0;
                const itemUserPrice = item.prices?.[userCurrency] || item.prices?.[item.menuCurrency] || 0;
                return (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl ${isLight ? 'bg-stone-100' : 'bg-stone-800'}`}>
                    <div className="min-w-0 flex-1 mr-3">
                      <p className={`font-medium truncate ${isLight ? 'text-stone-800' : 'text-amber-100'}`}>{itemName}</p>
                      <p className={`text-xs truncate ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>{item.originalName}</p>
                      <p className={`text-sm mt-1 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                        {getCurrencySymbol(item.menuCurrency)}{itemMenuPrice} ≈ {getCurrencySymbol(userCurrency)}{itemUserPrice}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className={`w-7 h-7 rounded-full flex items-center justify-center ${isLight ? 'bg-stone-200 text-stone-600' : 'bg-stone-700 text-amber-100'}`}><Minus size={14} /></button>
                      <span className={`w-4 text-center text-sm ${isLight ? 'text-stone-700' : 'text-amber-100'}`}>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className={`w-7 h-7 rounded-full flex items-center justify-center ${isLight ? 'bg-stone-200 text-stone-600' : 'bg-stone-700 text-amber-100'}`}><Plus size={14} /></button>
                      <button onClick={() => onRemove(item.id)} className={`ml-2 hover:text-red-400 ${isLight ? 'text-stone-400' : 'text-stone-500'}`}><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* 底部固定区：合计 + 文案 + 按钮 */}
        <div className={`shrink-0 mt-4 pt-4 border-t space-y-3 ${isLight ? 'border-stone-200' : 'border-stone-800'}`}>
          {!showScript && (
            <>
              <div className="flex justify-between items-center">
                <span className={isLight ? 'text-stone-500' : 'text-stone-400'}>{t(lang, 'cart.total')} ({mainCurrency})</span>
                <span className={`text-2xl font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{getCurrencySymbol(mainCurrency)}{totalMenu.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isLight ? 'text-stone-500' : 'text-stone-400'}>{t(lang, 'cart.converted')} ({userCurrency})</span>
                <span className={`text-lg ${isLight ? 'text-stone-500' : 'text-stone-300'}`}>≈ {getCurrencySymbol(userCurrency)}{totalUser.toFixed(2)}</span>
              </div>
            </>
          )}

          {cart.length > 0 && (
            <>
              {/* 文案区 — 在按钮上方展开 */}
              {showScript && (
                <div className={`p-4 rounded-xl border animate-in slide-in-from-bottom-2 duration-200 ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-stone-800 border-amber-700/30'}`}>
                  {scriptLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-amber-500" />
                    </div>
                  ) : (
                    <>
                      <p className={`text-base leading-relaxed ${isLight ? 'text-stone-700' : 'text-amber-50'}`}>{orderText}</p>
                      {orderTextLocal && orderTextLocal !== orderText && (
                        <>
                          <div className={`my-3 border-t border-dashed ${isLight ? 'border-amber-300' : 'border-stone-600'}`} />
                          <p className={`text-xs leading-relaxed ${isLight ? 'text-stone-400' : 'text-stone-500'}`}>
                            {orderTextLocal}
                          </p>
                        </>
                      )}
                      <button
                        className="mt-3 w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98] transition-all text-white text-sm font-medium flex items-center justify-center"
                        onClick={speak}
                      >
                        <Volume2 size={16} className="mr-2" /> {t(lang, 'cart.speak')}
                      </button>
                    </>
                  )}
                </div>
              )}

              <button
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium active:scale-[0.98] transition-all ${
                  showScript
                    ? (isLight
                        ? 'border border-stone-300 text-stone-500 hover:bg-stone-100'
                        : 'border border-stone-600 text-stone-400 hover:bg-stone-800')
                    : 'bg-amber-500 hover:bg-amber-400 text-white'
                }`}
                onClick={handleGenerate}
                disabled={scriptLoading}
              >
                {scriptLoading ? t(lang, 'cart.generating') : (showScript ? t(lang, 'cart.hide') : t(lang, 'cart.generate'))}
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
