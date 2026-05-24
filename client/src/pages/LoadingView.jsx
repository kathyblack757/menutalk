import { useState, useEffect } from 'react';
import { t } from '@/i18n/translations';

const LoadingView = ({ photo, lang = 'zh', theme = 'light' }) => {
  const [step, setStep] = useState(0);
  const isLight = theme === 'light';

  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 2000);
    return () => clearTimeout(timer);
  }, []);

  const bgColor = isLight ? '#FBF7F0' : '#1a1008';
  const gold = '#C9A96E';
  const dimColor = isLight ? '#d6d3ce' : '#4a4540';
  const textColor = isLight ? '#8A8A8A' : '#a09888';
  const titleColor = isLight ? '#5c5348' : '#e8dcc8';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      {photo && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'linear-gradient(180deg, rgba(251,247,240,0.4) 0%, rgba(201,169,110,0.06) 100%)'
            : 'linear-gradient(180deg, rgba(26,16,8,0.4) 0%, rgba(201,169,110,0.06) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* 步骤进度 */}
        <div className="flex items-center mb-9">
          <div className="flex flex-col items-center">
            <div
              className="w-2.5 h-2.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: gold,
                boxShadow: step === 0 ? `0 0 10px ${gold}80` : `0 0 0px ${gold}00`,
                transform: step === 0 ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            <span
              className="text-[11px] mt-2.5 whitespace-nowrap transition-colors duration-500 tracking-wide"
              style={{ color: step >= 0 ? gold : dimColor }}
            >
              {t(lang, 'loading.step1')}
            </span>
          </div>

          <div
            className="w-14 h-px mx-3 transition-all duration-700"
            style={{
              backgroundColor: step >= 1 ? gold : dimColor,
              marginTop: '-16px',
            }}
          />

          <div className="flex flex-col items-center">
            <div
              className="w-2.5 h-2.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: step >= 1 ? gold : dimColor,
                boxShadow: step === 1 ? `0 0 10px ${gold}80` : `0 0 0px ${gold}00`,
                transform: step === 1 ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            <span
              className="text-[11px] mt-2.5 whitespace-nowrap transition-colors duration-500 tracking-wide"
              style={{ color: step >= 1 ? gold : dimColor }}
            >
              {t(lang, 'loading.step2')}
            </span>
          </div>
        </div>

        {/* 主标题 */}
        <h2
          className="text-[28px] font-bold mb-3 tracking-[0.15em]"
          style={{ fontFamily: "'Noto Serif CJK SC', 'Songti SC', serif", color: titleColor }}
        >
          {t(lang, 'loading.title')}
        </h2>

        {/* 副标题 */}
        <p className="text-[13px] tracking-wide" style={{ color: textColor }}>
          {t(lang, step === 0 ? 'loading.subtitle1' : 'loading.subtitle2')}
        </p>
      </div>

      {/* 底部提示 */}
      <p className="absolute bottom-16 text-[12px] tracking-wide" style={{ color: textColor }}>
        {t(lang, 'loading.hint')}
      </p>
    </div>
  );
};

export default LoadingView;
