import { RkasItem, Triwulan } from '../types/rkas';

export function formatRupiah(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(safe);
}

export function formatDateIndo(isoDate: string): string {
  if (!isoDate) return '-';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

/**
 * Splits item.totalAnggaran across selected triwulan evenly without losing 1 Rupiah to rounding.
 */
export function calculateQuarterlyAllocation(item: RkasItem): Record<Triwulan, number> {
  const result: Record<Triwulan, number> = {
    'TW I': 0,
    'TW II': 0,
    'TW III': 0,
    'TW IV': 0,
  };

  const active = item.triwulan.length > 0 ? item.triwulan : (['TW I'] as Triwulan[]);
  const count = active.length;
  const total = Math.round(item.totalAnggaran);
  const base = Math.floor(total / count);
  const remainder = total - base * count;

  active.forEach((tw, index) => {
    result[tw] = base + (index === 0 ? remainder : 0);
  });

  return result;
}

export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}
