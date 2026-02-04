import type { TaxInput, TaxResult, TaxBreakdownItem } from '@/types';
import { getConfig } from '../config';

export class SingaporeCalculator {
  private config = getConfig('singapore');

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

    // Calculate income tax
    let incomeTax = 0;
    const brackets = this.config.taxBrackets;

    for (const bracket of brackets) {
      if (annualGross <= bracket.min) break;

      const bracketMax = bracket.max || annualGross;
      const taxableInBracket = Math.min(annualGross, bracketMax) - bracket.min;

      if (taxableInBracket > 0 && bracket.rate > 0) {
        const taxInBracket = taxableInBracket * bracket.rate;
        incomeTax += taxInBracket;

        breakdown.push({
          label: `Income Tax (S$${bracket.min.toLocaleString()} - ${bracket.max ? 'S$' + bracket.max.toLocaleString() : 'above'})`,
          amount: -taxInBracket,
          percentage: (taxInBracket / annualGross) * 100,
          explanation: `${(bracket.rate * 100)}% on S$${taxableInBracket.toLocaleString()}`,
          category: 'tax',
        });
      }

      if (!bracket.max || annualGross <= bracket.max) break;
    }

    // Calculate CPF contributions
    const cpfGroup = this.getCPFAgeGroup(input.age);
    const monthlySalary = annualGross / 12;
    const cappedMonthlySalary = Math.min(monthlySalary, this.config.cpf.salaryCeiling);
    const cpfEmployee = cappedMonthlySalary * cpfGroup.employee * 12;

    breakdown.push({
      label: 'CPF Employee Contribution',
      amount: -cpfEmployee,
      percentage: (cpfEmployee / annualGross) * 100,
      explanation: `${(cpfGroup.employee * 100)}% employee CPF contribution (capped at S$${this.config.cpf.salaryCeiling.toLocaleString()}/month)`,
      category: 'social',
    });

    // CPF allocation breakdown
    const allocation = cpfGroup.allocation;
    const cpfOA = cpfEmployee * allocation.oa;
    const cpfSA = cpfEmployee * allocation.sa;
    const cpfMA = cpfEmployee * allocation.ma;

    breakdown.push({
      label: '  → Ordinary Account (OA)',
      amount: cpfOA,
      percentage: (cpfOA / annualGross) * 100,
      explanation: `${(allocation.oa * 100)}% of CPF goes to OA (housing, investments)`,
      category: 'social',
    });

    breakdown.push({
      label: '  → Special Account (SA)',
      amount: cpfSA,
      percentage: (cpfSA / annualGross) * 100,
      explanation: `${(allocation.sa * 100)}% of CPF goes to SA (retirement)`,
      category: 'social',
    });

    breakdown.push({
      label: '  → Medisave Account (MA)',
      amount: cpfMA,
      percentage: (cpfMA / annualGross) * 100,
      explanation: `${(allocation.ma * 100)}% of CPF goes to MA (healthcare)`,
      category: 'social',
    });

    const netSalary = annualGross - incomeTax - cpfEmployee;

    breakdown.push({
      label: 'Net Salary',
      amount: netSalary,
      percentage: (netSalary / annualGross) * 100,
      explanation: 'Your take-home salary after tax and CPF',
      category: 'net',
    });

    return {
      grossSalary: input.frequency === 'monthly' ? annualGross / 12 : annualGross,
      netSalary: input.frequency === 'monthly' ? netSalary / 12 : netSalary,
      totalTax: incomeTax,
      totalSocial: cpfEmployee,
      effectiveRate: ((incomeTax + cpfEmployee) / annualGross) * 100,
      breakdown,
      country: 'singapore',
      frequency: input.frequency,
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

  private getCPFAgeGroup(age: number) {
    if (age <= 55) return this.config.cpf.ageGroups.below55;
    if (age <= 60) return this.config.cpf.ageGroups['55to60'];
    if (age <= 65) return this.config.cpf.ageGroups['60to65'];
    if (age <= 70) return this.config.cpf.ageGroups['65to70'];
    return this.config.cpf.ageGroups.above70;
  }
}
