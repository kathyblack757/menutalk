import { useRef } from 'react';
import { Camera, Image } from 'lucide-react';
import { t } from '@/i18n/translations';

const CameraTab = ({ onStartShoot, onPhotoTaken, lang = 'zh', theme = 'light' }) => {
  const isLight = theme === 'light';
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onPhotoTaken?.(url);
    }
  };

  const openAlbum = () => {
    const input = fileRef.current;
    if (input) {
      input.removeAttribute('capture');
      input.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 拍摄按钮 → 跳转到取景框页面 */}
      <button
        onClick={onStartShoot}
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #C9A96E, #A68B5B)',
          boxShadow: '0 4px 20px rgba(201,169,110,0.45)',
        }}
      >
        <Camera size={32} color="#fff" strokeWidth={1.5} />
      </button>

      <p className={`text-[13px] mt-5 tracking-wide ${isLight ? 'text-stone-400' : 'text-stone-500'}`}>
        {t(lang, 'camera.hint')}
      </p>

      {/* 从相册选取 → 直接选图 */}
      <button
        onClick={openAlbum}
        className={`mt-6 flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-full active:scale-95 transition-transform ${isLight ? 'text-stone-500 bg-stone-200/60' : 'text-amber-100/70 bg-white/6'}`}
      >
        <Image size={14} />
        {t(lang, 'camera.fromAlbum')}
      </button>

    </div>
  );
};

export default CameraTab;
