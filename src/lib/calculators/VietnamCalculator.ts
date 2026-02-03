import type { TaxInput, TaxResult, TaxBreakdownItem } from '@/types';
import { getConfig } from '../config';

export class VietnamCalculator {
  private config = getConfig('vietnam');

  calculateGrossToNet(input: TaxInput): TaxResult {
    const monthlyGross = input.frequency === 'annual' ? input.amount / 12 : input.amount;
    const annualGross = monthlyGross * 12;
    const breakdown: TaxBreakdownItem[] = [];

    breakdown.push({
      label: 'Gross Salary',
      amount: annualGross,
      percentage: 100,
      explanation: 'Your total annual gross salary',
      category: 'income',
    });

    // Social insurance (calculated on monthly gross, capped)
    const monthlySocialBase = Math.min(monthlyGross, this.config.socialInsurance.social.cap);
    const socialInsurance = monthlySocialBase * this.config.socialInsurance.social.rate * 12;
    
    const monthlyHealthBase = Math.min(monthlyGross, this.config.socialInsurance.health.cap);
    const healthInsurance = monthlyHealthBase * this.config.socialInsurance.health.rate * 12;
    
    const monthlyUnemploymentBase = Math.min(monthlyGross, this.config.socialInsurance.unemployment.cap);
    const unemploymentInsurance = monthlyUnemploymentBase * this.config.socialInsurance.unemployment.rate * 12;

    const totalSocial = socialInsurance + healthInsurance + unemploymentInsurance;

    breakdown.push({
      label: 'Social Insurance (8%)',
      amount: -socialInsurance,
      percentage: (socialInsurance / annualGross) * 100,
      explanation: `Employee contribution (capped at ₫${(this.config.socialInsurance.social.cap / 1000000).toFixed(1)}M/month)`,
      category: 'social',
    });

    breakdown.push({
      label: 'Health Insurance (1.5%)',
      amount: -healthInsurance,
      percentage: (healthInsurance / annualGross) * 100,
      explanation: `Employee contribution (capped at ₫${(this.config.socialInsurance.health.cap / 1000000).toFixed(1)}M/month)`,
      category: 'social',
    });

    breakdown.push({
      label: 'Unemployment Insurance (1%)',
      amount: -unemploymentInsurance,
      percentage: (unemploymentInsurance / annualGross) * 100,
      explanation: `Employee contribution (capped at ₫${(this.config.socialInsurance.unemployment.cap / 1000000).toFixed(1)}M/month)`,
      category: 'social',
    });

    // Income before tax
    const incomeBeforeTax = annualGross - totalSocial;
    const monthlyIncomeBeforeTax = incomeBeforeTax / 12;

    // Personal deduction
    const personalDeduction = this.config.personalDeduction * 12;
    breakdown.push({
      label: 'Personal Deduction',
      amount: personalDeduction,
      percentage: (personalDeduction / annualGross) * 100,
      explanation: `₫${(this.config.personalDeduction / 1000000).toFixed(1)}M per month personal allowance`,
      category: 'deduction',
    });

    // Dependent deductions
    const dependentDeduction = this.config.dependentDeduction * input.dependents * 12;
    if (input.dependents > 0) {
      breakdown.push({
        label: `Dependent Deduction (${input.dependents})`,
        amount: dependentDeduction,
        percentage: (dependentDeduction / annualGross) * 100,
        explanation: `₫${(this.config.dependentDeduction / 1000000).toFixed(1)}M per month per dependent`,
        category: 'deduction',
      });
    }

    // Taxable income
    const monthlyTaxableIncome = Math.max(0, monthlyIncomeBeforeTax - this.config.personalDeduction - (this.config.dependentDeduction * input.dependents));

    // Calculate income tax on monthly taxable income
    let monthlyIncomeTax = 0;
    const brackets = this.config.taxBrackets;

    for (const bracket of brackets) {
      if (monthlyTaxableIncome <= bracket.min) break;

      const bracketMax = bracket.max || monthlyTaxableIncome;
      const taxableInBracket = Math.min(monthlyTaxableIncome, bracketMax) - bracket.min;

      if (taxableInBracket > 0) {
        const taxInBracket = taxableInBracket * bracket.rate;
        monthlyIncomeTax += taxInBracket;

        breakdown.push({
          label: `Income Tax (₫${(bracket.min / 1000000).toFixed(0)}M - ${bracket.max ? '₫' + (bracket.max / 1000000).toFixed(0) + 'M' : 'above'})`,
          amount: -taxInBracket * 12,
          percentage: (taxInBracket * 12 / annualGross) * 100,
          explanation: `${(bracket.rate * 100)}% on ₫${(taxableInBracket / 1000000).toFixed(1)}M/month`,
          category: 'tax',
        });
      }

      if (!bracket.max || monthlyTaxableIncome <= bracket.max) break;
    }

    const incomeTax = monthlyIncomeTax * 12;
    const netSalary = annualGross - totalSocial - incomeTax;

    breakdown.push({
      label: 'Net Salary',
      amount: netSalary,
      percentage: (netSalary / annualGross) * 100,
      explanation: 'Your take-home salary after all deductions',
      category: 'net',
    });

    return {
      grossSalary: input.frequency === 'monthly' ? monthlyGross : annualGross,
      netSalary: input.frequency === 'monthly' ? netSalary / 12 : netSalary,
      totalTax: incomeTax,
      totalSocial,
      effectiveRate: ((incomeTax + totalSocial) / annualGross) * 100,
      breakdown,
      country: 'vietnam',
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
}
