export const DEFAULT_CATEGORIES = [
  { key: 'food', label: 'Food', icon: '🍛', color: '#D9714E', order: 1 },
  { key: 'travel', label: 'Travel', icon: '🚕', color: '#2F7CA6', order: 2 },
  { key: 'shopping', label: 'Shopping', icon: '🛒', color: '#9B6BC7', order: 3 },
  { key: 'home', label: 'Home', icon: '🏠', color: '#8C6A4F', order: 4 },
  { key: 'health', label: 'Health', icon: '💊', color: '#3F9D6F', order: 5 },
  { key: 'bills', label: 'Bills', icon: '📱', color: '#6B7280', order: 6 },
  { key: 'snacks', label: 'Snacks', icon: '☕', color: '#D9A441', order: 7 },
  { key: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#B0559A', order: 8 },
  { key: 'work', label: 'Work', icon: '💼', color: '#495578', order: 9 },
  { key: 'family', label: 'Family', icon: '👨‍👩‍👦', color: '#C55C77', order: 10 },
  { key: 'education', label: 'Education', icon: '📚', color: '#3E8E8E', order: 11 },
  { key: 'subscriptions', label: 'Subscriptions', icon: '🔁', color: '#7A6FD9', order: 12 },
  { key: 'other', label: 'Other', icon: '📦', color: '#9C9488', order: 13 },
] as const;

export const TRANSPORT_TYPES = ['Rickshaw', 'CNG', 'Bus', 'Uber', 'Pathao', 'Train', 'Other'];

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE_BANKING', label: 'Mobile Banking' },
  { value: 'OTHER', label: 'Other' },
] as const;
