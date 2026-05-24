import { useState } from 'react';
import { Wallet, AlertTriangle, Flame, SunMoon, Ban, Volume2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SETTING_OPTIONS } from '@/lib/settings';
import { t } from '@/i18n/translations';
import ProfileHeader from './ProfileHeader';
import SettingItem from './SettingItem';

const ProfileView = ({ settings = {}, onSettingsChange }) => {
  const lang = settings.interfaceLanguage || 'zh';
  const theme = settings.theme || 'light';
  const isLight = theme === 'light';
  const [activeSheet, setActiveSheet] = useState(null);

  const handleSelect = (key, value) => {
    if (key === 'allergens' || key === 'restrictions') {
      const current = settings.allergens || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onSettingsChange({ ...settings, [key]: updated });
    } else {
      const patch = { [key]: value };
      if (key === 'targetLanguage') {
        const langToCur = { zh: 'CNY', en: 'USD', ja: 'JPY', ko: 'KRW' };
        patch.localCurrency = langToCur[value] || settings.localCurrency;
      }
      onSettingsChange({ ...settings, ...patch });
      setActiveSheet(null);
    }
  };

  const getLabel = (key, value) => {
    if (key === 'allergens' || key === 'restrictions') {
      return value?.length ? t(lang, 'profile.selected', value.length) : t(lang, 'profile.notSet');
    }
    if (key === 'spiceTolerance') {
      if (value < 0) return t(lang, 'profile.notSet');
      const levels = t(lang, 'profile.spiceLevels');
      const name = Array.isArray(levels) ? levels[value] : value;
      const count = value + 1;
      return <span>{name} <span className="text-[10px] ml-0.5">{'🌶️'.repeat(count)}</span></span>;
    }
    if (key === 'speechRate') {
      const rates = { 0.7: t(lang, 'settingsLabels.slow'), 1: t(lang, 'settingsLabels.normal'), 1.3: t(lang, 'settingsLabels.fast') };
      return rates[value] || SETTING_OPTIONS.speechRate.find((o) => o.value === value)?.label || value;
    }
    if (key === 'theme' || key === 'currency' || key === 'localCurrency') {
      const label = t(lang, 'settingsLabels.' + value);
      return label !== 'settingsLabels.' + value ? label : (SETTING_OPTIONS[key]?.find((o) => o.value === value)?.label || value);
    }
    return SETTING_OPTIONS[key]?.find((o) => o.value === value)?.label || value;
  };

  const renderOptionLabel = (option) => {
    if (activeSheet === 'spiceTolerance') {
      const levels = t(lang, 'profile.spiceLevels');
      const name = Array.isArray(levels) ? levels[option.value] : option.label;
      const count = option.value + 1;
      return <span>{name} <span className="text-[11px] ml-1">{'🌶️'.repeat(count)}</span></span>;
    }
    if (activeSheet === 'speechRate') {
      const rates = { 0.7: t(lang, 'settingsLabels.slow'), 1: t(lang, 'settingsLabels.normal'), 1.3: t(lang, 'settingsLabels.fast') };
      return rates[option.value] || option.label;
    }
    if (activeSheet === 'allergens' || activeSheet === 'restrictions') {
      const translated = t(lang, 'settingsLabels.' + option.value);
      return translated !== 'settingsLabels.' + option.value ? translated : option.label;
    }
    const translated = t(lang, 'settingsLabels.' + option.value);
    return translated !== 'settingsLabels.' + option.value ? translated : option.label;
  };

  const dietItems = [
    { key: 'allergens', icon: AlertTriangle, title: t(lang, 'profile.allergens') },
    { key: 'restrictions', icon: Ban, title: t(lang, 'profile.restrictions') },
    { key: 'spiceTolerance', icon: Flame, title: t(lang, 'profile.spiceTolerance') },
  ];
  const systemItems = [
    { key: 'localCurrency', icon: Wallet, title: t(lang, 'profile.localCurrency') },
    { key: 'currency', icon: Wallet, title: t(lang, 'profile.currency') },
    { key: 'speechRate', icon: Volume2, title: t(lang, 'profile.speechRate') },
    { key: 'theme', icon: SunMoon, title: t(lang, 'profile.theme') },
  ];
  const allItems = [...dietItems, ...systemItems];

  return (
    <div className={`h-full overflow-y-auto px-5 pt-12 pb-6 ${isLight ? 'bg-[#FBF7F0]' : 'bg-[#1a1008]'}`}>
      <h1 className={`text-2xl font-bold mb-6 ${isLight ? 'text-stone-700' : 'text-amber-100'}`}>
        {t(lang, 'profile.title')}
      </h1>
      <ProfileHeader settings={settings} onSettingsChange={onSettingsChange} lang={lang} />

      {/* 饮食偏好 */}
      <div className="mt-8">
        <p className={`text-xs font-medium mb-3 ml-1 tracking-wide ${isLight ? 'text-[#8A8A8A]' : 'text-stone-400'}`}>{t(lang, 'profile.dietSection')}</p>
        <div className={`rounded-2xl overflow-hidden ${isLight ? 'bg-white shadow-sm' : 'bg-stone-800/60'}`}>
          {dietItems.map((item, idx) => (
            <SettingItem
              key={item.key}
              icon={item.icon}
              title={item.title}
              value={getLabel(item.key, settings[item.key])}
              onClick={() => setActiveSheet(item.key)}
              isLast={idx === dietItems.length - 1}
              isLight={isLight}
            />
          ))}
        </div>
      </div>

      {/* 系统设置 */}
      <div className="mt-6">
        <p className={`text-xs font-medium mb-3 ml-1 tracking-wide ${isLight ? 'text-[#8A8A8A]' : 'text-stone-400'}`}>{t(lang, 'profile.systemSection')}</p>
        <div className={`rounded-2xl overflow-hidden ${isLight ? 'bg-white shadow-sm' : 'bg-stone-800/60'}`}>
          {systemItems.map((item, idx) => (
            <SettingItem
              key={item.key}
              icon={item.icon}
              title={item.title}
              value={getLabel(item.key, settings[item.key])}
              onClick={() => setActiveSheet(item.key)}
              isLast={idx === systemItems.length - 1}
              isLight={isLight}
            />
          ))}
        </div>
      </div>

      <Sheet open={!!activeSheet} onOpenChange={() => setActiveSheet(null)}>
        <SheetContent side="bottom" className={`rounded-t-2xl px-4 pb-6 ${isLight ? 'bg-white border-0' : 'bg-stone-900 border-stone-800 text-amber-50'}`}>
          <SheetHeader className="pb-2">
            <SheetTitle className={`text-base font-bold ${isLight ? 'text-[#1a1a1a]' : 'text-amber-100'}`}>
              {allItems.find((s) => s.key === activeSheet)?.title}
            </SheetTitle>
          </SheetHeader>
          <div className="py-2 space-y-1">
            {activeSheet &&
              activeSheet !== 'allergens' && activeSheet !== 'restrictions' &&
              SETTING_OPTIONS[activeSheet]?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(activeSheet, option.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    settings[activeSheet] === option.value
                      ? (isLight ? 'bg-[#FFF8E7] text-[#B8860B]' : 'bg-amber-900/30 text-amber-400')
                      : (isLight ? 'text-[#333] hover:bg-gray-50' : 'text-stone-300 hover:bg-stone-800')
                  }`}
                >
                  {renderOptionLabel(option)}
                </button>
              ))}
            {(activeSheet === 'allergens' || activeSheet === 'restrictions') &&
              SETTING_OPTIONS[activeSheet].map((option) => {
                const isSelected = (settings[activeSheet] || []).includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(activeSheet, option.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      isSelected ? (isLight ? 'bg-[#FFF8E7] text-[#B8860B]' : 'bg-amber-900/30 text-amber-400') : (isLight ? 'text-[#333] hover:bg-gray-50' : 'text-stone-300 hover:bg-stone-800')
                    }`}
                  >
                    {renderOptionLabel(option)}
                    {isSelected && <span className="text-[#B8860B] text-lg">✓</span>}
                  </button>
                );
              })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProfileView;
