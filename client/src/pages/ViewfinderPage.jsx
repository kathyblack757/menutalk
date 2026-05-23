import { useRef, useEffect, useState } from 'react';
import { Camera, X, Image } from 'lucide-react';
import { t } from '@/i18n/translations';

const ViewfinderPage = ({ onPhotoCaptured, onCancel, lang = 'zh' }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setCameraError(true);
      }
    };
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/jpeg', 0.9);
    onPhotoCaptured?.(url);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-black overflow-hidden">
      {/* 全屏实时相机画面 */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 相机未就绪时的纯黑背景 */}
      {(!cameraReady || cameraError) && (
        <div className="absolute inset-0 bg-black z-0" />
      )}

      {/* 内容覆盖层 */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* 顶部品牌名 */}
        <div
          className="shrink-0 flex items-center px-6"
          style={{ paddingTop: 'clamp(32px, 5.7vh, 56px)' }}
        >
          <span
            className="text-xl font-bold tracking-wider"
            style={{ fontFamily: "'Noto Serif CJK SC', 'Songti SC', serif", color: '#f5c060' }}
          >
            {t(lang, 'viewfinder.brandName')}
          </span>
        </div>

        {/* 取景框 */}
        <div className="flex-1 flex justify-center" style={{ padding: '0 26px', paddingTop: '2vh' }}>
          <div
            className="relative rounded-3xl border-2 border-white/40 flex items-center justify-center"
            style={{
              width: '100%',
              aspectRatio: '0.65',
            }}
          >
            {/* 四角标记 */}
            <div
              className="absolute border-t-2 border-l-2 border-[#C9A96E] rounded-tl-md drop-shadow-lg"
              style={{
                top: 'clamp(12px, 1.9vh, 20px)',
                left: 'clamp(12px, 1.9vh, 20px)',
                width: 'clamp(18px, 2.8vh, 28px)',
                height: 'clamp(18px, 2.8vh, 28px)',
              }}
            />
            <div
              className="absolute border-t-2 border-r-2 border-[#C9A96E] rounded-tr-md drop-shadow-lg"
              style={{
                top: 'clamp(12px, 1.9vh, 20px)',
                right: 'clamp(12px, 1.9vh, 20px)',
                width: 'clamp(18px, 2.8vh, 28px)',
                height: 'clamp(18px, 2.8vh, 28px)',
              }}
            />
            <div
              className="absolute border-b-2 border-l-2 border-[#C9A96E] rounded-bl-md drop-shadow-lg"
              style={{
                bottom: 'clamp(12px, 1.9vh, 20px)',
                left: 'clamp(12px, 1.9vh, 20px)',
                width: 'clamp(18px, 2.8vh, 28px)',
                height: 'clamp(18px, 2.8vh, 28px)',
              }}
            />
            <div
              className="absolute border-b-2 border-r-2 border-[#C9A96E] rounded-br-md drop-shadow-lg"
              style={{
                bottom: 'clamp(12px, 1.9vh, 20px)',
                right: 'clamp(12px, 1.9vh, 20px)',
                width: 'clamp(18px, 2.8vh, 28px)',
                height: 'clamp(18px, 2.8vh, 28px)',
              }}
            />

            {/* 提示文字 - 相机未就绪时显示 */}
            {!cameraReady && (
              <p
                className="text-center px-6"
                style={{
                  fontSize: 'clamp(10px, 1.4vh, 13px)',
                  fontFamily: "'DM Sans', sans-serif",
                  color: cameraError ? 'rgba(255,100,80,0.6)' : 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.05em',
                }}
              >
                {cameraError ? t(lang, 'viewfinder.cameraError') : t(lang, 'viewfinder.placeMenu')}
              </p>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            gap: 'clamp(24px, 4.7vh, 48px)',
            paddingTop: 'clamp(20px, 3.8vh, 40px)',
            paddingBottom: 'max(clamp(48px, 9.2vh, 88px), env(safe-area-inset-bottom))',
          }}
        >
          <button
            onClick={onCancel}
            className="flex flex-col items-center active:scale-90 transition-transform"
            style={{ gap: 'clamp(2px, 0.5vh, 6px)' }}
          >
            <div
              className="rounded-full bg-white/15 flex items-center justify-center"
              style={{
                width: 'clamp(34px, 4.9vh, 46px)',
                height: 'clamp(34px, 4.9vh, 46px)',
              }}
            >
              <X size={19} color="white" />
            </div>
            <span
              style={{ fontSize: 'clamp(8px, 1.2vh, 11px)', color: 'rgba(255,255,255,0.85)' }}
            >
              {t(lang, 'viewfinder.cancel')}
            </span>
          </button>

          <button
            onClick={capturePhoto}
            disabled={!cameraReady}
            className="rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            style={{
              width: 'clamp(55px, 8vh, 76px)',
              height: 'clamp(55px, 8vh, 76px)',
              background: 'linear-gradient(135deg, #f5c060, #C49A3C)',
              boxShadow: '0 0 0 4px rgba(245,192,96,0.2), 0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            <Camera size={25} color="#fff" strokeWidth={1.5} />
          </button>

          <button
            onClick={() => {
              const input = document.getElementById('album-input');
              if (input) input.click();
            }}
            className="flex flex-col items-center active:scale-90 transition-transform"
            style={{ gap: 'clamp(2px, 0.5vh, 6px)' }}
          >
            <div
              className="rounded-full bg-white/15 flex items-center justify-center"
              style={{
                width: 'clamp(34px, 4.9vh, 46px)',
                height: 'clamp(34px, 4.9vh, 46px)',
              }}
            >
              <Image size={19} color="white" />
            </div>
            <span
              style={{ fontSize: 'clamp(8px, 1.2vh, 11px)', color: 'rgba(255,255,255,0.85)' }}
            >
              {t(lang, 'viewfinder.upload')}
            </span>
          </button>
        </div>
      </div>

      {/* 隐藏的文件上传input */}
      <input
        id="album-input"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            onPhotoCaptured?.(url);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default ViewfinderPage;
