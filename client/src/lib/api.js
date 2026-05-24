const BASE = '/api';

async function urlToBlob(url) {
  const res = await fetch(url);
  return res.blob();
}

export async function ocrMenu(imageUrl, targetLang = 'en') {
  const blob = imageUrl instanceof Blob ? imageUrl : await urlToBlob(imageUrl);
  const form = new FormData();
  form.append('image', blob, 'menu.jpg');
  form.append('targetLang', targetLang);

  const res = await fetch(`${BASE}/ocr`, { method: 'POST', body: form });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'OCR failed');
  return data;
}

export async function getDishDetail(originalName, userLang = 'zh', allergenList = []) {
  const res = await fetch(`${BASE}/dish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalName, userLang, allergenList }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Dish detail failed');
  return data.dish;
}

export async function getExchangeRate(from = 'CNY', to = 'USD') {
  const res = await fetch(`${BASE}/exchange?from=${from}&to=${to}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Exchange failed');
  return data;
}

export async function generateOrder(dishes, targetLang, totalLocal, totalConverted, convertedCurrency) {
  const res = await fetch(`${BASE}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dishes, targetLang, totalLocal, totalConverted, convertedCurrency }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Order generation failed');
  return data;
}

/**
 * 将 OCR 返回的菜品转换为 DishCard 兼容格式
 */
export function ocrToDishCard(ocrDish, index, defaultCurrency, targetLang) {
  const currency = ocrDish.currency || defaultCurrency;
  return {
    id: `dish_${index}`,
    originalName: ocrDish.originalName,
    translatedName: ocrDish.translatedName,
    menuLanguage: targetLang,
    menuCurrency: currency,
    prices: ocrDish.price != null
      ? { [currency]: ocrDish.price }
      : { [currency]: 0 },
    image: '',
    spiceLevel: 0,
    calories: 'medium',
    isPopular: false,
    allergenKeys: [],
    restrictionKeys: [],
    translations: {},
    _loading: true,
  };
}

/**
 * 将 /api/dish 详情合并到 DishCard 对象
 */
export function mergeDishDetail(dishCard, detail, targetLang, userLang) {
  const translations = {};

  // 目标语言 → 显示翻译名（卡片小字斜体）
  // 用户语言 → 显示原文菜名（卡片大标题），同语言时用翻译名
  const targetName = dishCard.translatedName || dishCard.originalName;
  const userName = (userLang === targetLang)
    ? targetName
    : (dishCard.originalName || targetName);

  translations[targetLang] = {
    name: targetName,
    description: '',
    ingredients: detail.ingredients || [],
    allergens: detail.allergens || [],
  };

  // 用户母语版本（卡片大标题）
  translations[userLang] = {
    name: userName,
    description: detail.culturalNote || '',
    ingredients: detail.ingredients || [],
    allergens: detail.allergens || [],
  };

  return {
    ...dishCard,
    spiceLevel: detail.spiceLevel ?? dishCard.spiceLevel,
    calories: detail.calories || dishCard.calories,
    allergenKeys: (detail.allergens || []).map((a) => a.toLowerCase()),
    restrictionKeys: [],
    translations,
    image: detail.imageSearchQuery
      ? `/api/images?query=${encodeURIComponent(detail.imageSearchQuery)}`
      : `/api/images?query=food`,
    _loading: false,
  };
}
