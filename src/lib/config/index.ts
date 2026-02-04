import type { Country } from '@/types';
import germanyConfig from './germany.json';
import netherlandsConfig from './netherlands.json';
import singaporeConfig from './singapore.json';
import vietnamConfig from './vietnam.json';
import japanConfig from './japan.json';

export const configs = {
  germany: germanyConfig,
  netherlands: netherlandsConfig,
  singapore: singaporeConfig,
  vietnam: vietnamConfig,
  japan: japanConfig,
};

export function getConfig(country: Country): any {
  return configs[country];
}

// Exchange rates to EUR (base currency)
// Rates as of February 2026 - should be updated periodically for accuracy
// Source: These are approximate market rates
export const exchangeRates: Record<string, number> = {
  EUR: 1.0,      // Base currency
  SGD: 0.67,     // 1 SGD = ~0.67 EUR
  VND: 0.000038, // 1 VND = ~0.000038 EUR
  JPY: 0.0063,   // 1 JPY = ~0.0063 EUR
};

export function getCurrencyForCountry(country: Country): string {
  const currencyMap: Record<Country, string> = {
    germany: 'EUR',
    netherlands: 'EUR',
    singapore: 'SGD',
    vietnam: 'VND',
    japan: 'JPY',
  };
  return currencyMap[country];
}

export function convertToEUR(amount: number, country: Country): number {
  const currency = getCurrencyForCountry(country);
  const rate = exchangeRates[currency] || 1.0;
  return amount * rate;
}
