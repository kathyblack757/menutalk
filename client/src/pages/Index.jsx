import { useState, useCallback, useEffect } from 'react';
import DishSwiper from '@/components/DishSwiper';
import CartSheet from '@/components/CartSheet';
import CartButton from '@/components/CartButton';
import BottomNav from '@/components/BottomNav';
import CameraTab from '@/pages/CameraTab';
import ViewfinderPage from '@/pages/ViewfinderPage';
import LoadingView from '@/pages/LoadingView';
import HistoryView from '@/components/HistoryView';
import ProfileView from '@/components/ProfileView';
import { saveHistory } from '@/lib/history';
import { ocrMenu, getDishDetail, ocrToDishCard, mergeDishDetail, getExchangeRate } from '@/lib/api';
import { mockDishes } from '@/data/mockDishes';

const Index = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [currentView, setCurrentView] = useState('tabs'); // 'tabs' | 'viewfinder' | 'loading' | 'swiper'
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const detectLang = () => {
    const lang = (navigator.language || 'zh').split('-')[0];
    return ['zh', 'en', 'ja', 'ko'].includes(lang) ? lang : 'zh';
  };

  const langToCurrency = { zh: 'CNY', en: 'USD', ja: 'JPY', ko: 'KRW' };

  const defaultSettings = {
    interfaceLanguage: detectLang(),
    targetLanguage: detectLang(),
    currency: langToCurrency[detectLang()] || 'CNY',
    localCurrency: null,
    allergens: [],
    restrictions: [],
    username: '',
    avatar: null,
    spiceTolerance: -1,
    speechRate: 1,
    theme: 'dark',
  };

  // IP 定位 → 旅游地货币
  const ipCurrencyMap = { CN: 'CNY', US: 'USD', JP: 'JPY', KR: 'KRW', GB: 'GBP', AU: 'AUD', CA: 'CAD', TH: 'THB', FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR' };

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((data) => {
        const c = ipCurrencyMap[data.country_code];
        if (c) {
          setUserSettings((prev) => ({ ...prev, localCurrency: c }));
        }
      })
      .catch(() => {});
  }, []);

  const [userSettings, setUserSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('menutalk_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 清理旧版数据（中文过敏原/禁忌 或 旧版本）
        const oldKeys = ['花生', '大豆', '猪肉', '海鲜', '麸质', '乳制品', '素食', '清真', '牛肉'];
        if (!parsed._v || parsed.allergens?.some((a) => oldKeys.includes(a)) || parsed.restrictions?.some((r) => oldKeys.includes(r))) {
          localStorage.removeItem('menutalk_settings');
          return defaultSettings;
        }
        return { ...defaultSettings, ...parsed };
      }
      return defaultSettings;
    } catch { return defaultSettings; }
  });
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('menutalk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [dishes, setDishes] = useState([]);
  const [isDishLoading, setIsDishLoading] = useState(false);
  const lang = userSettings.interfaceLanguage || 'zh';
  const theme = userSettings.theme || 'light';

  // 持久化：设置和购物车写入 localStorage
  useEffect(() => {
    localStorage.setItem('menutalk_settings', JSON.stringify({ ...userSettings, _v: 1 }));
  }, [userSettings]);

  useEffect(() => {
    localStorage.setItem('menutalk_cart', JSON.stringify(cart));
  }, [cart]);

  // ---- 拍照流程 ----

  // CameraTab: 点击拍摄按钮 → 跳转到取景框页面
  const handleStartShoot = useCallback(() => {
    setCurrentView('viewfinder');
  }, []);

  // CameraTab / ViewfinderPage: 拿到照片 → OCR → 加载详情 → 卡片页
  const handlePhotoWithOCR = useCallback(async (photoUrl) => {
    setCapturedPhoto(photoUrl);
    setCurrentView('loading');
    setIsDishLoading(true);
    try {
      const targetLang = userSettings.targetLanguage;
      const userCurrency = userSettings.currency || 'CNY';
      const defaultCurrency = userSettings.localCurrency || langToCurrency[targetLang] || 'USD';
      // OCR 翻译到用户母语，这样大标题是用户看得懂的语言
      const ocrResult = await ocrMenu(photoUrl, lang);
      const ocrDishes = ocrResult.dishes || [];

      // 用 OCR 识别出的第一种货币作为菜单货币
      const menuCurrency = ocrDishes[0]?.currency || defaultCurrency;

      // 获取汇率
      let exchangeRate = 1;
      if (menuCurrency !== userCurrency) {
        try {
          const rateResult = await getExchangeRate(menuCurrency, userCurrency);
          exchangeRate = rateResult.rate || 1;
        } catch { /* 汇率失败用 1:1 兜底 */ }
      }

      // 转换为 DishCard 兼容格式
      let cardDishes = ocrDishes.map((d, i) => {
        const card = ocrToDishCard(d, i, menuCurrency, targetLang);
        // 添加用户货币换算
        if (d.price != null && menuCurrency !== userCurrency) {
          card.prices[userCurrency] = Math.round(d.price * exchangeRate * 100) / 100;
        }
        return card;
      });

      // 并行加载所有菜品详情
      const details = await Promise.allSettled(
        cardDishes.map((d) =>
          getDishDetail(d.originalName, lang, userSettings.allergens || [])
        )
      );

      cardDishes = cardDishes.map((d, i) => {
        if (details[i].status === 'fulfilled') {
          return mergeDishDetail(d, details[i].value, targetLang, lang);
        }
        return { ...d, _loading: false };
      });

      setDishes(cardDishes);
      setCurrentView('swiper');
    } catch {
      // OCR 失败，暂留 loading 页
    } finally {
      setIsDishLoading(false);
    }
  }, [userSettings, lang]);

  const handleDirectPhoto = useCallback((photoUrl) => {
    handlePhotoWithOCR(photoUrl);
  }, [handlePhotoWithOCR]);

  const handlePhotoCaptured = useCallback((photoUrl) => {
    handlePhotoWithOCR(photoUrl);
  }, [handlePhotoWithOCR]);

  // ViewfinderPage: 取消 → 回到 Tab 页
  // 演示模式：跳过所有 API，直接用测试数据（零花费）
  const handleDemo = useCallback(() => {
    setDishes(mockDishes);
    setCurrentView('swiper');
  }, []);

  const handleCancelViewfinder = useCallback(() => {
    setCurrentView('tabs');
  }, []);

  // Swiper: 返回 → 保存历史
  const saveSwiperHistory = useCallback(() => {
    saveHistory({
      photo: capturedPhoto,
      dishCount: dishes.length,
      dishes: dishes.map((d) => ({
        name: d.translations?.[lang]?.name || d.originalName,
        inCart: cart.some((c) => c.id === d.id),
        data: d,
      })),
    });
  }, [capturedPhoto, cart, lang, dishes]);

  const handleBackToCamera = useCallback(() => {
    saveSwiperHistory();
    setCurrentView('tabs');
  }, [saveSwiperHistory]);

  // ---- 购物车 ----

  const handleLike = useCallback((dish) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === dish.id);
      if (ex)
        return prev.map((i) =>
          i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...dish, quantity: 1 }];
    });
  }, []);

  const handleSkip = useCallback(() => {}, []);

  const handleUpdateQuantity = useCallback((id, qty) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.id !== id));
    else
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
      );
  }, []);

  const handleRemove = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ---- 全屏视图：取景框 ----
  if (currentView === 'viewfinder') {
    return (
      <div className="min-h-screen bg-black text-amber-50 relative overflow-hidden">
        <ViewfinderPage
          onPhotoCaptured={handlePhotoCaptured}
          onCancel={handleCancelViewfinder}
          lang={lang}
        />
      </div>
    );
  }

  // ---- 全屏视图：识别中 ----
  if (currentView === 'loading') {
    return (
      <div className={`min-h-screen relative overflow-hidden ${theme === 'light' ? 'bg-[#FBF7F0] text-stone-800' : 'bg-[#1a1008] text-amber-50'}`}>
        <LoadingView photo={capturedPhoto} lang={lang} theme={theme} />
      </div>
    );
  }

  // ---- 全屏视图：卡片浏览 ----
  if (currentView === 'swiper') {
    return (
      <div className={`min-h-screen relative overflow-hidden ${theme === 'light' ? 'bg-[#FBF7F0] text-stone-800' : 'bg-[#1a1008] text-amber-50'}`}>
        <DishSwiper
          dishes={dishes}
          photo={capturedPhoto}
          onLike={handleLike}
          onSkip={handleSkip}
          onBack={handleBackToCamera}
          displayLanguage={lang}
          menuLanguage={userSettings.targetLanguage}
          userCurrency={userSettings.currency}
          userAllergens={userSettings.allergens || []}
          userRestrictions={userSettings.restrictions || []}
          spiceTolerance={userSettings.spiceTolerance ?? -1}
          lang={lang}
          theme={theme}
        />
        <CartButton
          count={cart.reduce((sum, i) => sum + i.quantity, 0)}
          onClick={() => setIsCartOpen(true)}
        />
        <CartSheet
          open={isCartOpen}
          onOpenChange={setIsCartOpen}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          userLanguage={userSettings.targetLanguage}
          userCurrency={userSettings.currency}
          localCurrency={userSettings.localCurrency || 'USD'}
          lang={lang}
          theme={theme}
          speechRate={userSettings.speechRate || 1}
        />
      </div>
    );
  }

  // ---- Tab 模式 ----
  const renderContent = () => {
    switch (activeTab) {
      case 'scan':
        return (
          <CameraTab
            onStartShoot={handleStartShoot}
            onPhotoTaken={handleDirectPhoto}
            onDemo={handleDemo}
            lang={lang}
            theme={theme}
          />
        );
      case 'history':
        return <HistoryView theme={theme} lang={lang} menuLanguage={userSettings.targetLanguage} userCurrency={userSettings.currency} localCurrency={userSettings.localCurrency || 'USD'} />;
      case 'profile':
        return (
          <ProfileView
            settings={userSettings}
            onSettingsChange={setUserSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'light' ? 'bg-[#FBF7F0] text-stone-800' : 'bg-[#1a1008] text-amber-50'}`}>
      <main className="relative z-10 h-screen pb-14 overflow-y-auto">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} lang={lang} />
    </div>
  );
};

export default Index;
