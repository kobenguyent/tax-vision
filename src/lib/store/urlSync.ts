import { useEffect } from 'react';
import { useCalculatorStore } from './calculator';
import type { TaxInput } from '@/types';

export function encodeToUrl(input: TaxInput): string {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  return `?${params.toString()}`;
}

export function decodeFromUrl(search: string): Partial<TaxInput> | null {
  const params = new URLSearchParams(search);
  if (params.toString() === '') return null;

  const input: Partial<TaxInput> = {};
  
  const amount = params.get('amount');
  if (amount) input.amount = parseFloat(amount);
  
  const frequency = params.get('frequency');
  if (frequency) input.frequency = frequency as 'monthly' | 'annual';
  
  const country = params.get('country');
  if (country) input.country = country as any;
  
  const direction = params.get('direction');
  if (direction) input.direction = direction as any;
  
  const maritalStatus = params.get('maritalStatus');
  if (maritalStatus) input.maritalStatus = maritalStatus as any;
  
  const dependents = params.get('dependents');
  if (dependents) input.dependents = parseInt(dependents);
  
  const age = params.get('age');
  if (age) input.age = parseInt(age);
  
  const region = params.get('region');
  if (region) input.region = region;
  
  const insuranceClass = params.get('insuranceClass');
  if (insuranceClass) input.insuranceClass = parseInt(insuranceClass);
  
  const churchTax = params.get('churchTax');
  if (churchTax) input.churchTax = churchTax === 'true';
  
  const churchTaxRate = params.get('churchTaxRate');
  if (churchTaxRate) input.churchTaxRate = parseFloat(churchTaxRate);
  
  const specialDeductions = params.get('specialDeductions');
  if (specialDeductions) input.specialDeductions = parseFloat(specialDeductions);
  
  return input;
}

export function useUrlSync() {
  const { input, setInput } = useCalculatorStore();

  useEffect(() => {
    const urlInput = decodeFromUrl(window.location.search);
    if (urlInput) {
      setInput(urlInput);
    }
  }, []);

  useEffect(() => {
    const url = encodeToUrl(input);
    window.history.replaceState({}, '', url);
  }, [input]);
}
