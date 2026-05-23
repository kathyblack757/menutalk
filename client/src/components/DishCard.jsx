
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCurrencySymbol, getDishTranslation } from '@/lib/format';
import { t as tr } from '@/i18n/translations';

const DishCard = ({ dish, displayLanguage = 'zh', menuLanguage = 'zh', userCurrency = 'CNY', localCurrency = 'USD', lang = 'zh', theme = 'light', userAllergens = [], userRestrictions = [], spiceTolerance = -1 }) => {
  const isLight = theme === 'light';
  const [descExpanded, setDescExpanded] = useState(false);

  const d = getDishTranslation(dish, displayLanguage);

  // 旅游地货币（大号）= localCurrency，本国货币（小号）= userCurrency
  const localSym = getCurrencySymbol(localCurrency);
  const homeSym = getCurrencySymbol(userCurrency);
  const localPrice = dish.prices?.[localCurrency] ?? dish.prices?.[dish.menuCurrency] ?? 0;
  const homePrice = dish.prices?.[userCurrency] ?? dish.prices?.[dish.menuCurrency] ?? 0;
  const needsExpand = (d.description?.length || 0) > 80;

  // 过敏原 + 饮食禁忌警告（用 key 匹配，与显示语言无关）
  const matchedAllergens = userAllergens.length > 0 && dish.allergenKeys
    ? userAllergens.filter((a) => dish.allergenKeys.includes(a))
    : [];
  const matchedRestrictions = userRestrictions.length > 0 && dish.restrictionKeys
    ? userRestrictions.filter((r) => dish.restrictionKeys.includes(r))
    : [];
  const hasWarning = matchedAllergens.length > 0 || matchedRestrictions.length > 0;
  // 辣度超限：菜品辣度 > 用户耐受
  const spiceTooHigh = spiceTolerance >= 0 && dish.spiceLevel > spiceTolerance;

  return (
    <div
      className="w-full bg-[#FDF6EC] rounded-[20px] overflow-hidden relative"
      style={{
        boxShadow: isLight
          ? '0 8px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)'
          : '0 16px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* 顶部图片区域 + 渐变遮罩 */}
      <div className="relative h-[175px] flex items-center justify-center overflow-hidden">
        <img
          src={dish.image}
          alt={d.name}
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          loading="lazy" />

        <div className="absolute inset-0 bg-gradient-to-br from-[#7a3a10]/30 via-[#c26020]/20 to-[#e8903a]/25" />
        {dish.isPopular &&
        <span
          className="absolute top-[10px] left-[12px] text-white text-[10px] font-medium px-2 py-[3px] rounded-md tracking-wide"
          style={{ fontFamily: "'DM Sans', sans-serif", background: 'rgba(194,59,34,0.92)' }}>
          
            {tr(lang, 'card.popular')}
          </span>
        }
      </div>

      {/* 卡片内容 */}
      <div className="px-4 pt-[16px] pb-4">
        <div className="flex items-end gap-2 mb-1">
          <h2
            className="text-[22px] font-bold text-[#3D2B1F] tracking-tight leading-none"
            style={{ fontFamily: "'Noto Serif CJK SC', 'Songti SC', serif" }}
          >
            {d.name}
          </h2>
          {hasWarning && (
            <span
              className="text-[10px] font-medium text-[#C23B22] leading-none pb-[2px]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ⚠ {[
                matchedAllergens.length > 0 && tr(lang, 'card.allergenWarn'),
                matchedRestrictions.length > 0 && tr(lang, 'card.restrictionWarn'),
              ].filter(Boolean).join(' / ')}
            </span>
          )}
        </div>
        <p
          className="text-[12px] text-[#9a7b5e] italic mt-0.5 truncate"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          
          {getDishTranslation(dish, menuLanguage).name}
        </p>

        {/* Ingredients */}
        <div className="text-[9px] text-[#b8957a] tracking-[0.12em] uppercase mb-[5px] mt-2"

        style={{ fontFamily: "'DM Sans', sans-serif" }}>{tr(lang, 'card.ingredients')}


        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {(d.ingredients || []).map((ing) =>
          <span
            key={ing}
            className="text-[11px] px-2 py-[2px] rounded-full border text-[#5a4020] bg-[rgba(139,105,20,0.08)]"
            style={{ fontFamily: "'DM Sans', sans-serif", borderColor: 'rgba(139,105,20,0.25)' }}>
            
              {ing}
            </span>
          )}
        </div>

        {/* Allergens */}
        <div className="text-[9px] text-[#b8957a] tracking-[0.12em] uppercase mb-[5px]"

        style={{ fontFamily: "'DM Sans', sans-serif" }}>{tr(lang, 'card.allergens')}


        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {(d.allergens || []).map((al) =>
          <span
            key={al}
            className="text-[11px] font-medium px-2 py-[2px] rounded-full border text-[#C23B22] bg-[rgba(194,59,34,0.1)]"
            style={{ fontFamily: "'DM Sans', sans-serif", borderColor: 'rgba(194,59,34,0.3)' }}>
            
              ⚠ {al}
            </span>
          )}
        </div>

        <div className="h-[0.5px] bg-[rgba(61,43,31,0.1)] my-2" />

        {/* 辣度 & 卡路里 */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-[10px] text-[#9a7b5e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{tr(lang, 'card.spice')}</span>
          {spiceTooHigh && (
            <span className="text-[9px] text-red-500 font-medium">{tr(lang, 'card.spiceOver')}</span>
          )}
          {[1, 2, 3, 4, 5].map((i) => {
            const active = i <= dish.spiceLevel;
            const warn = spiceTooHigh && active && i > spiceTolerance;
            return (
              <span
                key={i}
                className={`text-[13px] ${active ? '' : 'opacity-20'}`}
                style={warn ? { filter: 'hue-rotate(-30deg) saturate(2) brightness(1.2)' } : {}}
              >
                🌶️
              </span>
            );
          })}
          <span
            className="text-[11px] text-[#9a7b5e] bg-[rgba(139,105,20,0.06)] px-[7px] py-[2px] rounded-full"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            
            {tr(lang, 'card.calories')}: {tr(lang, 'card.cal' + { low: 'Low', medium: 'Medium', high: 'High' }[dish.calories || 'medium'])}
          </span>
        </div>

        {/* 描述 - 可展开，防止溢出 */}
        <div className="mb-2">
          <p className={`text-[11.5px] leading-[1.55] text-[#6b5040] ${descExpanded ? '' : 'line-clamp-3'}`}>
            {d.description}
          </p>
          {needsExpand &&
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="text-[10px] text-[#c26020] font-medium flex items-center gap-0.5 mt-1">
            
              {descExpanded ? tr(lang, 'card.collapse') : tr(lang, 'card.expand')}
              {descExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          }
        </div>

        {/* 价格：菜单货币（大）+ 用户母语货币换算（小） */}
        <div className="flex justify-between items-baseline border-t border-[rgba(61,43,31,0.08)] pt-2.5">
          <span className="text-[22px] font-bold text-[#3D2B1F]" style={{ fontFamily: "'Noto Serif CJK SC', 'Songti SC', serif" }}>
            {localSym} {localPrice}
          </span>
          <span className="text-[12px] text-[#9a7b5e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            ≈ {homeSym}{homePrice} {userCurrency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DishCard;

