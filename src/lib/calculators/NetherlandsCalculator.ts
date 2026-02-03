import type { TaxInput, TaxResult, TaxBreakdownItem } from '@/types';
import { getConfig } from '../config';

export class NetherlandsCalculator {
  private config = getConfig('netherlands');

  calculateGrossToNet(input: TaxInput): TaxResult {
    const annualGross = input.frequency === 'monthly' ? input.amount * 12 : input.amount;
    const breakdown: TaxBreakdownItem[] = [];

    breakdown.push({
      label: 'Gross Salary',
      amount: annualGross,
      percentage: 100,
      explanation: 'Your total annual gross salary',
      category: 'income',
    });

    // Calculate tax + social contributions per bracket
    let totalTaxAndSocial = 0;
    const brackets = this.config.taxBrackets;

    for (const bracket of brackets) {
      if (annualGross <= bracket.min) break;

      const bracketMax = bracket.max || annualGross;
      const taxableInBracket = Math.min(annualGross, bracketMax) - bracket.min;

      if (taxableInBracket > 0) {
        const taxInBracket = taxableInBracket * bracket.rate;
        totalTaxAndSocial += taxInBracket;

        breakdown.push({
          label: `Tax + Social (€${bracket.min.toLocaleString()} - ${bracket.max ? '€' + bracket.max.toLocaleString() : 'above'})`,
          amount: -taxInBracket,
          percentage: (taxInBracket / annualGross) * 100,
          explanation: `${(bracket.rate * 100).toFixed(2)}% combined rate on €${taxableInBracket.toLocaleString()}`,
          category: 'tax',
        });
      }

      if (!bracket.max || annualGross <= bracket.max) break;
    }

    // Calculate tax credits
    const generalCredit = this.calculateGeneralCredit(annualGross);
    const laborCredit = this.calculateLaborCredit(annualGross);
    const totalCredits = generalCredit + laborCredit;

    if (generalCredit > 0) {
      breakdown.push({
        label: 'General Tax Credit',
        amount: generalCredit,
        percentage: (generalCredit / annualGross) * 100,
        explanation: 'General tax credit (algemene heffingskorting)',
        category: 'deduction',
      });
    }

    if (laborCredit > 0) {
      breakdown.push({
        label: 'Labor Tax Credit',
        amount: laborCredit,
        percentage: (laborCredit / annualGross) * 100,
        explanation: 'Labor tax credit (arbeidskorting)',
        category: 'deduction',
      });
    }

    const netTax = Math.max(0, totalTaxAndSocial - totalCredits);
    const netSalary = annualGross - netTax;

    breakdown.push({
      label: 'Net Salary',
      amount: netSalary,
      percentage: (netSalary / annualGross) * 100,
      explanation: 'Your take-home salary after tax and credits',
      category: 'net',
    });

    return {
      grossSalary: input.frequency === 'monthly' ? annualGross / 12 : annualGross,
      netSalary: input.frequency === 'monthly' ? netSalary / 12 : netSalary,
      totalTax: netTax,
      totalSocial: 0, // Included in tax
      effectiveRate: (netTax / annualGross) * 100,
      breakdown,
      country: 'netherlands',
      frequency: input.frequency,
    };
  }

  calculateNetToGross(input: TaxInput): TaxResult {
    const targetNet = input.frequency === 'monthly' ? input.amount * 12 : input.amount;
    let low = targetNet;
    let high = targetNet * 2.5;
    let iterations = 0;
    const maxIterations = 50;

    while (iterations < maxIterations && high - low > 1) {
      const mid = (low + high) / 2;
      const result = this.calculateGrossToNet({ ...input, amount: mid, frequency: 'annual' });
      const calculatedNet = result.netSalary;

      if (Math.abs(calculatedNet - targetNet) < 1) {
        return {
          ...result,
          grossSalary: input.frequency === 'monthly' ? mid / 12 : mid,
          netSalary: input.frequency === 'monthly' ? targetNet / 12 : targetNet,
        };
      }

      if (calculatedNet < targetNet) {
        low = mid;
      } else {
        high = mid;
      }
      iterations++;
    }

    const finalGross = (low + high) / 2;
    return this.calculateGrossToNet({ ...input, amount: finalGross, frequency: 'annual' });
  }

  private calculateGeneralCredit(income: number): number {
    const { max, phaseOutStart, phaseOutRate } = this.config.taxCredits.general;
    
    if (income <= phaseOutStart) return max;
    
    const excess = income - phaseOutStart;
    const reduction = excess * phaseOutRate;
    return Math.max(0, max - reduction);
  }

  private calculateLaborCredit(income: number): number {
    const { max, phaseOutStart, phaseOutEnd, phaseOutRate } = this.config.taxCredits.labor;
    
    if (income <= phaseOutStart) {
      return Math.min(max, income * 0.08425);
    }
    
    if (income >= phaseOutEnd) return 0;
    
    const baseCredit = phaseOutStart * 0.08425;
    const excess = income - phaseOutStart;
    const reduction = excess * phaseOutRate;
    return Math.max(0, baseCredit - reduction);
  }
}
