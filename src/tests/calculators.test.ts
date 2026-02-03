import { describe, it, expect } from 'vitest';
import { GermanyCalculator } from '../lib/calculators/GermanyCalculator';
import { NetherlandsCalculator } from '../lib/calculators/NetherlandsCalculator';
import { SingaporeCalculator } from '../lib/calculators/SingaporeCalculator';
import { VietnamCalculator } from '../lib/calculators/VietnamCalculator';
import type { TaxInput } from '../types';

describe('Tax Calculators', () => {
  const baseInput: TaxInput = {
    amount: 50000,
    frequency: 'annual',
    direction: 'grossToNet',
    maritalStatus: 'single',
    dependents: 0,
    age: 30,
    country: 'germany',
  };

  describe('GermanyCalculator', () => {
    it('should calculate gross to net correctly', () => {
      const calculator = new GermanyCalculator();
      const result = calculator.calculateGrossToNet(baseInput);
      
      expect(result.grossSalary).toBe(50000);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(50000);
      expect(result.effectiveRate).toBeGreaterThan(0);
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    it('should calculate net to gross correctly', () => {
      const calculator = new GermanyCalculator();
      const result = calculator.calculateNetToGross({ ...baseInput, direction: 'netToGross', amount: 35000 });
      
      expect(result.netSalary).toBeCloseTo(35000, -2);
      expect(result.grossSalary).toBeGreaterThan(35000);
    });

    it('should apply different tax classes correctly', () => {
      const calculator = new GermanyCalculator();
      
      // Tax Class I (single)
      const class1 = calculator.calculateGrossToNet({ ...baseInput, insuranceClass: 1 });
      
      // Tax Class III (married, higher earner - double basic allowance)
      const class3 = calculator.calculateGrossToNet({ ...baseInput, insuranceClass: 3 });
      
      // Tax Class V (married, lower earner - no basic allowance)
      const class5 = calculator.calculateGrossToNet({ ...baseInput, insuranceClass: 5 });
      
      // Class III should have highest net (double allowance)
      expect(class3.netSalary).toBeGreaterThan(class1.netSalary);
      
      // Class V should have lowest net (no allowance)
      expect(class5.netSalary).toBeLessThan(class1.netSalary);
      
      // Class III should have lower tax than Class I
      expect(class3.totalTax).toBeLessThan(class1.totalTax);
      
      // Class V should have higher tax than Class I
      expect(class5.totalTax).toBeGreaterThan(class1.totalTax);
    });
  });

  describe('NetherlandsCalculator', () => {
    it('should calculate gross to net correctly', () => {
      const calculator = new NetherlandsCalculator();
      const result = calculator.calculateGrossToNet({ ...baseInput, country: 'netherlands' });
      
      expect(result.grossSalary).toBe(50000);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(50000);
    });
  });

  describe('SingaporeCalculator', () => {
    it('should calculate gross to net correctly', () => {
      const calculator = new SingaporeCalculator();
      const result = calculator.calculateGrossToNet({ ...baseInput, country: 'singapore' });
      
      expect(result.grossSalary).toBe(50000);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(50000);
    });

    it('should apply age-based CPF rates', () => {
      const calculator = new SingaporeCalculator();
      const youngResult = calculator.calculateGrossToNet({ ...baseInput, country: 'singapore', age: 30 });
      const olderResult = calculator.calculateGrossToNet({ ...baseInput, country: 'singapore', age: 58 });
      
      expect(youngResult.totalSocial).toBeGreaterThan(olderResult.totalSocial);
    });
  });

  describe('VietnamCalculator', () => {
    it('should calculate gross to net correctly', () => {
      const calculator = new VietnamCalculator();
      const result = calculator.calculateGrossToNet({ ...baseInput, country: 'vietnam', amount: 20000000 });
      
      expect(result.grossSalary).toBe(20000000);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(20000000);
    });

    it('should apply dependent deductions', () => {
      const calculator = new VietnamCalculator();
      const noDependents = calculator.calculateGrossToNet({ ...baseInput, country: 'vietnam', amount: 50000000, frequency: 'monthly', dependents: 0 });
      const withDependents = calculator.calculateGrossToNet({ ...baseInput, country: 'vietnam', amount: 50000000, frequency: 'monthly', dependents: 2 });
      
      // With dependents should have lower tax, thus higher net
      expect(withDependents.totalTax).toBeLessThan(noDependents.totalTax);
    });
  });
});
