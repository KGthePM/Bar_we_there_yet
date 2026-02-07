import type { CrowdLevel } from '@/types/database';

export const CROWD_CONFIG: Record<CrowdLevel, {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  empty: {
    label: 'Empty',
    emoji: '💤',
    color: 'var(--color-crowd-empty)',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400',
  },
  chill: {
    label: 'Chill',
    emoji: '😎',
    color: 'var(--color-crowd-chill)',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
  },
  getting_busy: {
    label: 'Getting Busy',
    emoji: '🔥',
    color: 'var(--color-crowd-getting-busy)',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
  },
  busy: {
    label: 'Busy',
    emoji: '🎉',
    color: 'var(--color-crowd-busy)',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
  },
  packed: {
    label: 'Packed!',
    emoji: '🤯',
    color: 'var(--color-crowd-packed)',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
  },
};

export const CHECKIN_DURATION_HOURS = 2;
export const CHECKIN_COOLDOWN_HOURS = 2;
export const APP_NAME = 'BarWeThereYet';
export const APP_URL = 'https://barwethereyet.com';
