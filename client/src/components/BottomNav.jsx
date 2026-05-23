import { Camera, History, User } from 'lucide-react';
import { t } from '@/i18n/translations';

const BottomNav = ({ activeTab, onChange, lang = 'zh' }) => {
  const tabs = [
    { key: 'scan', label: t(lang, 'nav.scan'), icon: Camera },
    { key: 'history', label: t(lang, 'nav.history'), icon: History },
    { key: 'profile', label: t(lang, 'nav.profile'), icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-14"
      style={{
        background: 'rgba(15,8,2,0.96)',
        borderTop: '0.5px solid rgba(139,105,20,0.2)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex flex-col items-center justify-center gap-[3px] w-full h-full transition-opacity"
            style={{ opacity: isActive ? 1 : 0.45 }}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 2}
              color={isActive ? '#f5c060' : 'rgba(255,200,140,0.9)'}
            />
            <span
              className="text-[9px] font-medium tracking-wide"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: isActive ? '#f5c060' : 'rgba(255,200,140,0.9)',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
