export type Country = 'germany' | 'netherlands' | 'singapore' | 'vietnam' | 'japan';

export type PaymentFrequency = 'monthly' | 'annual';

export type CalculationDirection = 'grossToNet' | 'netToGross';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface TaxInput {
  amount: number;
  frequency: PaymentFrequency;
  country: Country;
  direction: CalculationDirection;
  maritalStatus: MaritalStatus;
  dependents: number;
  age: number;
  region?: string;
  insuranceClass?: number;
  churchTax?: boolean;
  churchTaxRate?: number;
  specialDeductions?: number;
  healthInsuranceRate?: number;
}

export interface TaxBreakdownItem {
  label: string;
  amount: number;
  percentage: number;
  explanation: string;
  category: 'income' | 'deduction' | 'tax' | 'social' | 'net';
}

export interface TaxResult {
  grossSalary: number;
  netSalary: number;
  totalTax: number;
  totalSocial: number;
  effectiveRate: number;
  breakdown: TaxBreakdownItem[];
  country: Country;
  frequency: PaymentFrequency;
}

export interface CalculationHistory {
  id: string;
  timestamp: number;
  input: TaxInput;
  result: TaxResult;
}
