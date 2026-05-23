import { t } from '@/i18n/translations';

const LoadingView = ({ photo, lang = 'zh' }) => (
  <div className="relative flex flex-col items-center justify-center h-full w-full bg-[#FBF7F0] overflow-hidden">
    {photo && (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${photo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.05,
        }}
      />
    )}

    <div className="flex gap-2 mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-[#C9A96E] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>

    <p
      className="text-base font-medium tracking-wide text-stone-600"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {t(lang, 'loading.scanning')}
    </p>
    <p className="text-xs mt-2 text-stone-400">
      {t(lang, 'loading.tip')}
    </p>
  </div>
);

export default LoadingView;
