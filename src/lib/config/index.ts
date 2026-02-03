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
