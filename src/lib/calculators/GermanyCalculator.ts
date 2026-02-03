import type { TaxInput, TaxResult, TaxBreakdownItem } from '@/types';
import { getConfig } from '../config';

export class GermanyCalculator {
  private config = getConfig('germany');

  calculateGrossToNet(input: TaxInput): TaxResult {
    const annualGross = input.frequency === 'monthly' ? input.amount * 12 : input.amount;
    const breakdown: TaxBreakdownItem[] = [];
    const taxClass = input.insuranceClass || 1;

    breakdown.push({
      label: 'Gross Salary',
      amount: annualGross,
      percentage: 100,
      explanation: `Your total annual gross salary (Tax Class ${taxClass})`,
      category: 'income',
    });

    // Adjust basic allowance based on tax class
    let basicAllowance = this.config.basicAllowance;
    if (taxClass === 3) {
      // Class III gets double basic allowance
      basicAllowance = this.config.basicAllowance * 2;
    } else if (taxClass === 5 || taxClass === 6) {
      // Class V and VI get no basic allowance
      basicAllowance = 0;
    }

    // Social contributions (employee pays 50%)
    const pensionBase = Math.min(annualGross, this.config.socialContributions.pension.ceiling);
    const pension = pensionBase * this.config.socialContributions.pension.rate;
    
    const health = annualGross * this.config.socialContributions.health.rate;
    const additionalRate = (input.healthInsuranceRate || this.config.socialContributions.health.defaultAdditionalRate * 100) / 100;
    const healthAdditional = annualGross * additionalRate;
    
    const unemploymentBase = Math.min(annualGross, this.config.socialContributions.unemployment.ceiling);
    const unemployment = unemploymentBase * this.config.socialContributions.unemployment.rate;
    
    // Care insurance rate based on number of children
    let careRate = this.config.socialContributions.care.baseRate;
    if (input.dependents === 0) {
      careRate = this.config.socialContributions.care.rates.noChildren;
    } else if (input.dependents === 1) {
      careRate = this.config.socialContributions.care.rates.oneChild;
    } else if (input.dependents === 2) {
      careRate = this.config.socialContributions.care.rates.twoChildren;
    } else if (input.dependents === 3) {
      careRate = this.config.socialContributions.care.rates.threeChildren;
    } else if (input.dependents === 4) {
      careRate = this.config.socialContributions.care.rates.fourChildren;
    } else if (input.dependents >= 5) {
      careRate = this.config.socialContributions.care.rates.fiveOrMore;
    }
    const care = annualGross * careRate;

    const totalSocial = pension + health + healthAdditional + unemployment + care;

    breakdown.push({
      label: 'Pension Insurance',
      amount: -pension,
      percentage: (pension / annualGross) * 100,
      explanation: `Employee contribution (9.3% of gross up to €${this.config.socialContributions.pension.ceiling.toLocaleString()})`,
      category: 'social',
    });

    breakdown.push({
      label: 'Health Insurance',
      amount: -(health + healthAdditional),
      percentage: ((health + healthAdditional) / annualGross) * 100,
      explanation: `Employee contribution (7.3% base + ${(additionalRate * 100).toFixed(2)}% supplementary)`,
      category: 'social',
    });

    breakdown.push({
      label: 'Unemployment Insurance',
      amount: -unemployment,
      percentage: (unemployment / annualGross) * 100,
      explanation: `Employee contribution (1.3% of gross up to €${this.config.socialContributions.unemployment.ceiling.toLocaleString()})`,
      category: 'social',
    });

    breakdown.push({
      label: 'Care Insurance',
      amount: -care,
      percentage: (care / annualGross) * 100,
      explanation: `Employee contribution (${(careRate * 100).toFixed(2)}% based on ${input.dependents} ${input.dependents === 1 ? 'child' : 'children'})`,
      category: 'social',
    });

    // Income tax
    const taxableIncome = Math.max(0, annualGross - basicAllowance);
    const incomeTax = this.calculateIncomeTax(taxableIncome);

    if (basicAllowance > 0) {
      breakdown.push({
        label: 'Basic Allowance',
        amount: basicAllowance,
        percentage: (basicAllowance / annualGross) * 100,
        explanation: `Tax-free allowance (Grundfreibetrag) for Tax Class ${taxClass}`,
        category: 'deduction',
      });
    }

    breakdown.push({
      label: 'Income Tax',
      amount: -incomeTax,
      percentage: (incomeTax / annualGross) * 100,
      explanation: `Progressive income tax on taxable income (€${taxableIncome.toLocaleString()})`,
      category: 'tax',
    });

    // Solidarity surcharge
    let solidaritySurcharge = 0;
    if (incomeTax > this.config.solidaritySurcharge.threshold) {
      solidaritySurcharge = incomeTax * this.config.solidaritySurcharge.rate;
      breakdown.push({
        label: 'Solidarity Surcharge',
        amount: -solidaritySurcharge,
        percentage: (solidaritySurcharge / annualGross) * 100,
        explanation: `5.5% surcharge on income tax above €${this.config.solidaritySurcharge.threshold.toLocaleString()}`,
        category: 'tax',
      });
    }

    // Church tax
    let churchTax = 0;
    if (input.churchTax && input.region) {
      const rate = this.config.churchTax[input.region as keyof typeof this.config.churchTax] || this.config.churchTax.defaultRate;
      churchTax = incomeTax * rate;
      breakdown.push({
        label: 'Church Tax',
        amount: -churchTax,
        percentage: (churchTax / annualGross) * 100,
        explanation: `${(rate * 100)}% of income tax for church members in ${input.region}`,
        category: 'tax',
      });
    }

    const totalTax = incomeTax + solidaritySurcharge + churchTax;
    const netSalary = annualGross - totalSocial - totalTax;

    breakdown.push({
      label: 'Net Salary',
      amount: netSalary,
      percentage: (netSalary / annualGross) * 100,
      explanation: 'Your take-home salary after all deductions',
      category: 'net',
    });

    return {
      grossSalary: input.frequency === 'monthly' ? annualGross / 12 : annualGross,
      netSalary: input.frequency === 'monthly' ? netSalary / 12 : netSalary,
      totalTax,
      totalSocial,
      effectiveRate: ((totalTax + totalSocial) / annualGross) * 100,
      breakdown,
      country: 'germany',
      frequency: input.frequency,
    };
  }

  calculateNetToGross(input: TaxInput): TaxResult {
    const targetNet = input.frequency === 'monthly' ? input.amount * 12 : input.amount;
    let low = targetNet;
    let high = targetNet * 3;
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

  private calculateIncomeTax(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;

    const brackets = this.config.taxBrackets;
    // Zone 1: 0 to basic allowance - 0% tax
    const zone1Max = brackets[0].max;
    if (taxableIncome <= zone1Max) {
      return 0;
    }

    // Zone 2: Progressive 14% to ~24%
    const zone2Max = brackets[1].max;
    if (taxableIncome <= zone2Max) {
      const y = (taxableIncome - zone1Max) / 10000;
      const { a, b } = brackets[1].coefficients;
      return (a * y + b) * y;
    }

    // Zone 3: Progressive ~24% to 42%
    const zone3Max = brackets[2].max;
    if (taxableIncome <= zone3Max) {
      const z = (taxableIncome - zone2Max) / 10000;
      const { a, b, base } = brackets[2].coefficients;
      return (a * z + b) * z + base;
    }

    // Zone 4: flat 42%
    const zone4Max = brackets[3].max;
    const zone4Rate = brackets[3].rate;
    const zone4Deduction = brackets[3].deduction;
    if (taxableIncome <= zone4Max) {
      return taxableIncome * zone4Rate - zone4Deduction;
    }

    // Zone 5: flat 45%
    const zone5Rate = brackets[4].rate;
    const zone5Deduction = brackets[4].deduction;
    return taxableIncome * zone5Rate - zone5Deduction;
  }
}
