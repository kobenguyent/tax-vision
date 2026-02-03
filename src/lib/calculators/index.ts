import type { Country, TaxInput, TaxResult } from '@/types';
import { GermanyCalculator } from './GermanyCalculator';
import { NetherlandsCalculator } from './NetherlandsCalculator';
import { SingaporeCalculator } from './SingaporeCalculator';
import { VietnamCalculator } from './VietnamCalculator';
import { JapanCalculator } from './JapanCalculator';

export class CalculatorFactory {
  static getCalculator(country: Country) {
    switch (country) {
      case 'germany':
        return new GermanyCalculator();
      case 'netherlands':
        return new NetherlandsCalculator();
      case 'singapore':
        return new SingaporeCalculator();
      case 'vietnam':
        return new VietnamCalculator();
      case 'japan':
        return new JapanCalculator();
      default:
        throw new Error(`Unknown country: ${country}`);
    }
  }

  static calculate(input: TaxInput): TaxResult {
    const calculator = this.getCalculator(input.country);
    
    if (input.direction === 'grossToNet') {
      return calculator.calculateGrossToNet(input);
    } else {
      return calculator.calculateNetToGross(input);
    }
  }
}

export function calculate(input: TaxInput): TaxResult {
  return CalculatorFactory.calculate(input);
}
