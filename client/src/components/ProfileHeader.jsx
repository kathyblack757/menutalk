import { useRef, useState } from 'react';
import { Camera, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SETTING_OPTIONS } from '@/lib/settings';
import { t } from '@/i18n/translations';

const LANG_KEYS = ['zh', 'en', 'ja', 'ko'];
const LANG_FLAGS = { zh: '🇨🇳', en: '🇬🇧', ja: '🇯🇵', ko: '🇰🇷' };
const LANG_TO_CURRENCY = { zh: 'CNY', en: 'USD', ja: 'JPY', ko: 'KRW' };

const ProfileHeader = ({ settings, onSettingsChange, lang = 'zh' }) => {
  const fileRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(settings.username || '');
  const [langPicker, setLangPicker] = useState(null); // 'target' | 'interface' | null
  const isLight = (settings.theme || 'light') === 'light';

  const targetLabel = t(lang, 'langNames.' + settings.targetLanguage);
  const interfaceLabel = t(lang, 'langNames.' + settings.interfaceLanguage);
  const targetFlag = LANG_FLAGS[settings.targetLanguage] || '';
  const interfaceFlag = LANG_FLAGS[settings.interfaceLanguage] || '';

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSettingsChange({ ...settings, avatar: url });
    }
  };

  const handleSaveName = () => {
    onSettingsChange({ ...settings, username: draftName.trim() });
    setEditing(false);
  };

  const handleLangSelect = (value) => {
    const key = langPicker === 'target' ? 'targetLanguage' : 'interfaceLanguage';
    const patch = { [key]: value };
    if (langPicker === 'target' && LANG_TO_CURRENCY[value]) {
      patch.localCurrency = LANG_TO_CURRENCY[value];
    }
    onSettingsChange({ ...settings, ...patch });
    setLangPicker(null);
  };

  return (
    <div className="flex flex-col items-center pt-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* 头像 */}
      <button
        onClick={() => fileRef.current?.click()}
        className={`relative w-28 h-28 rounded-full flex items-center justify-center mb-3 border-4 overflow-hidden active:scale-95 transition-transform group ${isLight ? 'bg-[#F0EAD6] border-white shadow-sm' : 'bg-stone-700 border-stone-600'}`}
      >
        {settings.avatar ? (
          <img src={settings.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: '#F2F0E9' }}>
            <svg viewBox="0 0 60 60" className="w-[70%] h-[70%]" fill="none">
              <circle cx="22" cy="20" r="2.5" fill="#C4B5A0" />
              <circle cx="38" cy="20" r="2.5" fill="#C4B5A0" />
              <path d="M 29 27 Q 30 25 31 27" stroke="#C4B5A0" strokeWidth="2" strokeLinecap="round" />
              <path d="M 25 36 Q 30 39 35 36" stroke="#C4B5A0" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Camera size={20} className="text-white" />
        </div>
      </button>

      {/* 用户名 / 编辑资料 */}
      {editing ? (
        <div className="flex items-center gap-2 mb-5">
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            placeholder={t(lang, 'profile.inputName')}
            className={`text-sm px-3 py-1.5 rounded-lg outline-none focus:border-[#C9A96E] w-40 ${isLight ? 'bg-white border border-gray-200 text-[#2a2a2a]' : 'bg-stone-800 border border-stone-600 text-amber-50 placeholder:text-stone-500'}`}
          />
          <button
            onClick={handleSaveName}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#C9A96E] text-white font-medium"
          >
            {t(lang, 'profile.confirm')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraftName(settings.username || '');
            setEditing(true);
          }}
          className={`text-[15px] font-medium mb-5 ${isLight ? 'text-[#2a2a2a]' : 'text-amber-100'}`}
        >
          {settings.username || t(lang, 'profile.editProfile')}
        </button>
      )}

      {/* 语言切换：目标语言 → 界面语言 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLangPicker('target')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform ${isLight ? 'bg-white border border-gray-200 text-[#2a2a2a] shadow-sm' : 'bg-stone-800 border border-stone-700 text-amber-100'}`}
        >
          <span className="text-base">{targetFlag}</span>
          {targetLabel}
        </button>

        <ArrowRight size={16} className={isLight ? 'text-stone-400' : 'text-stone-500'} />

        <button
          onClick={() => setLangPicker('interface')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform ${isLight ? 'bg-white border border-gray-200 text-[#2a2a2a] shadow-sm' : 'bg-stone-800 border border-stone-700 text-amber-100'}`}
        >
          <span className="text-base">{interfaceFlag}</span>
          {interfaceLabel}
        </button>
      </div>

      {/* 语言选择面板 */}
      <Sheet open={!!langPicker} onOpenChange={() => setLangPicker(null)}>
        <SheetContent side="bottom" className={`rounded-t-2xl px-4 pb-6 ${isLight ? 'bg-white border-0' : 'bg-stone-900 border-stone-800 text-amber-50'}`}>
          <SheetHeader className="pb-2">
            <SheetTitle className={`text-base font-bold ${isLight ? 'text-[#1a1a1a]' : 'text-amber-100'}`}>
              {langPicker === 'target' ? t(lang, 'profile.chooseTargetLang') : t(lang, 'profile.chooseInterfaceLang')}
            </SheetTitle>
          </SheetHeader>
          <div className="py-2 space-y-1">
            {LANG_KEYS.map((value) => {
              const currentValue = langPicker === 'target' ? settings.targetLanguage : settings.interfaceLanguage;
              const isSelected = currentValue === value;
              const flag = LANG_FLAGS[value] || '';
              const label = t(lang, 'langNames.' + value);
              return (
                <button
                  key={value}
                  onClick={() => handleLangSelect(value)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${isSelected ? (isLight ? 'bg-[#FFF8E7] text-[#B8860B]' : 'bg-amber-900/30 text-amber-400') : (isLight ? 'text-[#333] hover:bg-gray-50' : 'text-stone-300 hover:bg-stone-800')}`}
                >
                  <span>{flag} {label}</span>
                  {isSelected && <span className={isLight ? 'text-[#B8860B]' : 'text-amber-400'}>✓</span>}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProfileHeader;
