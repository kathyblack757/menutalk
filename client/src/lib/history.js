const STORAGE_KEY = 'menutalk_history';

export const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (entry) => {
  const list = loadHistory();
  list.unshift({
    id: Date.now(),
    date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
    time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    dishCount: entry.dishCount || 0,
    photo: entry.photo || null,
    dishes: entry.dishes || [],
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  return list;
};
