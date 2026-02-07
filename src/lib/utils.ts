import type { CrowdLevel } from '@/types/database';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function getDeviceHash(): Promise<string> {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getCrowdLevelFromCount(count: number): CrowdLevel {
  if (count === 0) return 'empty';
  if (count <= 5) return 'chill';
  if (count <= 15) return 'getting_busy';
  if (count <= 30) return 'busy';
  return 'packed';
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function getDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function isVenueOpen(hours: Record<string, { open: string; close: string }>): boolean {
  const day = getDayOfWeek();
  const todayHours = hours[day];
  if (!todayHours) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;

  // Handle past-midnight closing (e.g., close at 02:00)
  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60;
    const adjustedCurrent = currentMinutes < openMinutes ? currentMinutes + 24 * 60 : currentMinutes;
    return adjustedCurrent >= openMinutes && adjustedCurrent < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}
