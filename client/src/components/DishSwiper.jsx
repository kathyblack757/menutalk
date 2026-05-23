import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import DishCard from './DishCard';
import { t } from '@/i18n/translations';

const THRESHOLD = 60;
const OVERLAY_MAX = 0.85;

const DishSwiper = ({ dishes, photo, onLike, onSkip, onBack, displayLanguage, menuLanguage, userCurrency, localCurrency, lang = 'zh', theme = 'light', userAllergens = [], userRestrictions = [], spiceTolerance = -1 }) => {
  const [index, setIndex] = useState(0);
  const [panX, setPanX] = useState(0);
  const [exitInfo, setExitInfo] = useState(null);
  const [reaction, setReaction] = useState(null);
  const isLight = theme === 'light';

  const dish = index < dishes.length ? dishes[index] : null;
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 375;

  const handleDrag = useCallback((_, info) => {
    setPanX(info.offset.x);
  }, []);

  const handleDragEnd = useCallback((_, info) => {
    const x = info.offset.x;
    setPanX(0);
    if (Math.abs(x) >= THRESHOLD) {
      const dir = x > 0 ? 1 : -1;
      setReaction({ dir });
      if (dir > 0) onLike(dish);
      else onSkip(dish);
      setTimeout(() => {
        setReaction(null);
        setExitInfo({ dir, flyX: dir * screenW * 1.2 });
        setTimeout(() => {
          setIndex((i) => i + 1);
          setExitInfo(null);
        }, 220);
      }, 80);
    }
  }, [dish, onLike, onSkip, screenW]);

  const absX = Math.abs(panX);
  const overlayOpacity = absX > 30 ? Math.min(OVERLAY_MAX, (absX - 30) / (THRESHOLD - 30) * OVERLAY_MAX) : 0;

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      {photo && (
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
      )}
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(160deg, #2d1505 0%, #0f0a04 60%, #1a0d02 100%)' }} />
      <div className="absolute inset-0 -z-10" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(180,100,20,0.08) 4px, rgba(180,100,20,0.08) 8px)' }} />

      {/* 顶部栏：返回 + 进度 + 页码 居中对齐 */}
      <div className="shrink-0 flex items-center justify-between px-4 z-10" style={{ height: 'clamp(44px, 6vh, 56px)' }}>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={20} color={isLight ? 'rgba(139,111,71,0.7)' : 'rgba(255,220,160,0.7)'} />
        </button>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(dishes.length, 10) }, (_, i) => (
            <div key={i} className="h-[3px] rounded-[2px] transition-all duration-200" style={{
              width: i === index % dishes.length ? 24 : 16,
              background: i === index % dishes.length
                ? (isLight ? '#C9A96E' : 'rgba(255,200,100,0.85)')
                : (isLight ? 'rgba(139,111,71,0.2)' : 'rgba(255,200,100,0.2)'),
            }} />
          ))}
        </div>
        <div className="text-[12px] tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif", color: isLight ? 'rgba(139,111,71,0.55)' : 'rgba(255,220,160,0.55)' }}>
          <span className="font-medium" style={{ color: isLight ? '#8B6F47' : 'rgba(255,220,160,0.9)' }}>{Math.min(index + 1, dishes.length)}</span> / {dishes.length}
        </div>
      </div>

      {/* 卡片区域 */}
      <div className="shrink-0" style={{ padding: '0 26px', paddingTop: 12 }}>
        <div className="relative mx-auto" style={{ width: '100%', maxWidth: 360, minHeight: 510 }}>
          {/* 背后叠层卡片 */}
          {dish && dishes[index + 1] && (
            <motion.div
              className="absolute inset-0 bg-[#F5EAD8] rounded-[20px] z-0"
              style={{ opacity: 0.6 }}
              initial={false}
              animate={!exitInfo ? { scale: 0.96, y: 6, opacity: 0.6 } : { scale: 1, y: 0, opacity: 0.6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          )}

          {/* SKIP 蒙层 — 拖拽中渐显 / 确认后短暂全显 */}
          <motion.div
            className="absolute rounded-[24px] flex items-center justify-center pointer-events-none"
            style={{
              top: -6, left: -6, right: -6, bottom: -6,
              zIndex: (panX < -30 || reaction?.dir === -1) ? 20 : 1,
              opacity: reaction?.dir === -1 ? OVERLAY_MAX : (panX < -30 ? overlayOpacity : 0),
              background: 'rgba(220,60,40,0.22)',
            }}
          >
            <span className="text-[28px] font-bold text-[#ff5040] border-2 border-[#ff5040]/50 rounded-xl px-5 py-1.5"
              style={{ fontFamily: "'Noto Serif CJK SC', 'Songti SC', serif" }}>
              {t(lang, 'swiper.skip')}
            </span>
          </motion.div>

          {/* ADD 蒙层 — 拖拽中渐显 / 确认后短暂全显 */}
          <motion.div
            className="absolute rounded-[24px] flex items-center justify-center pointer-events-none"
            style={{
              top: -6, left: -6, right: -6, bottom: -6,
              zIndex: (panX > 30 || reaction?.dir === 1) ? 20 : 1,
              opacity: reaction?.dir === 1 ? OVERLAY_MAX : (panX > 30 ? overlayOpacity : 0),
              background: 'rgba(40,180,80,0.22)',
            }}
          >
            <span className="text-[28px] font-bold text-[#30c860] border-2 border-[#30c860]/50 rounded-xl px-5 py-1.5"
              style={{ fontFamily: "'Noto Serif CJK SC', 'Songti SC', serif" }}>
              {t(lang, 'swiper.add')}
            </span>
          </motion.div>

          {/* 卡片 */}
          <AnimatePresence mode="popLayout">
            {dish && (
              <motion.div
                key={dish.id}
                drag="x"
                dragElastic={0.6}
                dragSnapToOrigin
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={!exitInfo ? { scale: 1, opacity: 1 } : { x: exitInfo.flyX, opacity: 0, rotate: exitInfo.dir * 20, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                whileDrag={{ scale: 1.02 }}
                className="relative z-10 w-full"
              >
                <DishCard dish={dish} displayLanguage={displayLanguage} menuLanguage={menuLanguage} userCurrency={userCurrency} localCurrency={localCurrency} lang={lang} theme={theme} userAllergens={userAllergens} userRestrictions={userRestrictions} spiceTolerance={spiceTolerance} />
              </motion.div>
            )}
          </AnimatePresence>

          {!dish && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${isLight ? 'text-[#8B6F47]' : 'text-[rgba(255,220,160,0.9)]'}`}>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Noto Serif CJK SC', 'Songti SC', serif" }}>{t(lang, 'swiper.allDone')}</h3>
              <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,220,160,0.6)' }}>{t(lang, 'swiper.allDoneHint')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-start justify-center" style={{ paddingTop: 'clamp(6px, 1vh, 12px)', paddingBottom: 'clamp(24px, 4vh, 40px)' }}>
        <span className="text-[10px] tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif", color: isLight ? 'rgba(139,111,71,0.4)' : 'rgba(255,200,140,0.4)' }}>
          {t(lang, 'swiper.dragHint')}
        </span>
      </div>
    </div>
  );
};

export default DishSwiper;
