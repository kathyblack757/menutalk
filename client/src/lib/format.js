export const currencySymbols = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  KRW: '₩',
  THB: '฿',
  AUD: 'A$',
  CAD: 'C$',
};

/**
 * 获取货币符号，找不到时返回货币代码本身
 */
export const getCurrencySymbol = (currency) => currencySymbols[currency] || currency || '';

/**
 * 安全读取菜品翻译，按优先级：用户语言 > 菜单语言 > 第一个可用翻译
 */
export const getDishTranslation = (dish, userLanguage) => {
  if (!dish?.translations) return {};
  return (
    dish.translations[userLanguage] ||
    dish.translations[dish.menuLanguage] ||
    Object.values(dish.translations)[0] ||
    {}
  );
};
