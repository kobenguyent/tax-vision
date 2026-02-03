import type { TaxInput, TaxResult, TaxBreakdownItem } from '@/types';
import { getConfig } from '../config';

export class JapanCalculator {
  private config = getConfig('japan');

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

    // Social insurance (employee pays their share)
    const employeeShare = this.config.socialInsurance.employeeShare;
    const pensionBase = Math.min(annualGross, this.config.socialInsurance.pension.ceiling);
    const pension = pensionBase * this.config.socialInsurance.pension.rate * employeeShare;
    
    const health = annualGross * this.config.socialInsurance.health.rate * employeeShare;
    const employment = annualGross * this.config.socialInsurance.employment.rate * employeeShare;
    
    let care = 0;
    if (input.age >= this.config.socialInsurance.care.minAge) {
      care = annualGross * this.config.socialInsurance.care.rate * employeeShare;
    }

    const totalSocial = pension + health + employment + care;

    breakdown.push({
      label: 'Pension Insurance',
      amount: -pension,
      percentage: (pension / annualGross) * 100,
      explanation: `Employee contribution (9.15% of gross up to ¥${this.config.socialInsurance.pension.ceiling.toLocaleString()})`,
      category: 'social',
    });

    breakdown.push({
      label: 'Health Insurance',
      amount: -health,
      percentage: (health / annualGross) * 100,
      explanation: 'Employee contribution (5% of gross)',
      category: 'social',
    });

    breakdown.push({
      label: 'Employment Insurance',
      amount: -employment,
      percentage: (employment / annualGross) * 100,
      explanation: 'Employee contribution (0.55% of gross)',
      category: 'social',
    });

    if (care > 0) {
      breakdown.push({
        label: 'Long-Term Care Insurance',
        amount: -care,
        percentage: (care / annualGross) * 100,
        explanation: `Employee contribution (0.795% of gross, age ${input.age}+)`,
        category: 'social',
      });
    }

    // Taxable income after social insurance and exemptions
    const incomeAfterSocial = annualGross - totalSocial;
    
    let exemptions = this.config.basicExemption;
    if (input.maritalStatus === 'married') {
      exemptions += this.config.spouseExemption;
    }
    exemptions += input.dependents * this.config.dependentExemption;

    breakdown.push({
      label: 'Basic Exemption',
      amount: 0,
      percentage: 0,
      explanation: `Tax-free allowance (¥${this.config.basicExemption.toLocaleString()})`,
      category: 'deduction',
    });

    if (input.maritalStatus === 'married') {
      breakdown.push({
        label: 'Spouse Exemption',
        amount: 0,
        percentage: 0,
        explanation: `Spouse exemption (¥${this.config.spouseExemption.toLocaleString()})`,
        category: 'deduction',
      });
    }

    if (input.dependents > 0) {
      breakdown.push({
        label: 'Dependent Exemptions',
        amount: 0,
        percentage: 0,
        explanation: `¥${this.config.dependentExemption.toLocaleString()} × ${input.dependents} dependents`,
        category: 'deduction',
      });
    }

    const taxableIncome = Math.max(0, incomeAfterSocial - exemptions);

    // Calculate income tax
    const incomeTax = this.calculateIncomeTax(taxableIncome);
    const reconstructionTax = incomeTax * this.config.reconstructionTax;
    const residentTax = taxableIncome * this.config.residentTax.rate + this.config.residentTax.perCapita;

    breakdown.push({
      label: 'Income Tax',
      amount: -incomeTax,
      percentage: (incomeTax / annualGross) * 100,
      explanation: `Progressive income tax on taxable income (¥${taxableIncome.toLocaleString()})`,
      category: 'tax',
    });

    breakdown.push({
      label: 'Reconstruction Tax',
      amount: -reconstructionTax,
      percentage: (reconstructionTax / annualGross) * 100,
      explanation: '2.1% surcharge on income tax',
      category: 'tax',
    });

    breakdown.push({
      label: 'Resident Tax',
      amount: -residentTax,
      percentage: (residentTax / annualGross) * 100,
      explanation: '10% of taxable income + per-capita charge',
      category: 'tax',
    });

    const totalTax = incomeTax + reconstructionTax + residentTax;
    const netSalary = annualGross - totalSocial - totalTax;

    breakdown.push({
      label: 'Net Salary',
      amount: netSalary,
      percentage: (netSalary / annualGross) * 100,
      explanation: 'Your take-home salary after all deductions',
      category: 'net',
    });

    return {
      grossSalary: input.frequency === 'monthly' ? input.amount : annualGross,
      netSalary: input.frequency === 'monthly' ? netSalary / 12 : netSalary,
      totalTax,
      totalSocial,
      effectiveRate: ((totalTax + totalSocial) / annualGross) * 100,
      breakdown,
      frequency: input.frequency,
      country: 'japan',
    };
  }

  calculateNetToGross(input: TaxInput): TaxResult {
    const targetNet = input.frequency === 'monthly' ? input.amount * 12 : input.amount;
    let low = targetNet;
    let high = targetNet * 2;
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

    let tax = 0;
    const brackets = this.config.taxBrackets;

    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const min = bracket.min;
      const max = bracket.max || Infinity;

      if (taxableIncome > min) {
        const taxableInBracket = Math.min(taxableIncome, max) - min;
        tax += taxableInBracket * bracket.rate;
      }

      if (taxableIncome <= max) break;
    }

    return tax;
  }
}
