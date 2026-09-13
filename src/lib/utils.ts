import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const taka = new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 0,
});

export function formatTaka(amountInPaisa: number) {
  // amounts are stored as integer smallest-unit-free taka (whole taka, no decimals)
  return `৳${taka.format(amountInPaisa)}`;
}

export function formatDay(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric' }).format(date);
}

export function formatShortDay(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
}

export function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d;
}

export function startOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export const REACTION_MEANINGS: Record<string, string> = {
  '❤️': 'Love it',
  '👍': 'Good',
  '😊': 'Nice',
  '🤔': 'Think about it',
  '😅': 'Hmm...',
  '😮': 'Unexpected',
  '😐': 'Neutral',
  '😡': 'Not happy',
  '💸': 'Expensive',
  '👏': 'Great',
};

export const REACTION_LABELS: Record<string, string> = {
  '❤️': 'React with love',
  '👍': 'React with thumbs up',
  '😊': 'React with a smile',
  '🤔': 'React thoughtfully',
  '😅': 'React with awkward laugh',
  '😮': 'React with surprise',
  '😐': 'React neutrally',
  '😡': 'React with frustration',
  '💸': 'React that it was expensive',
  '👏': 'React with applause',
};

export const REACTION_SET = ['❤️', '👍', '😊', '🤔', '😅', '😮', '😐', '😡', '💸', '👏'];
