import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, country: string): string {
  const formats: Record<string, { locale: string; currency: string }> = {
    germany: { locale: 'de-DE', currency: 'EUR' },
    netherlands: { locale: 'nl-NL', currency: 'EUR' },
    singapore: { locale: 'en-SG', currency: 'SGD' },
    vietnam: { locale: 'vi-VN', currency: 'VND' },
    japan: { locale: 'ja-JP', currency: 'JPY' },
  };

  const format = formats[country] || formats.germany;
  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
