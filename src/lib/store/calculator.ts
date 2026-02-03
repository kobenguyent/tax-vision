import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaxInput, TaxResult, CalculationHistory } from '@/types';

interface CalculatorState {
  input: TaxInput;
  result: TaxResult | null;
  history: CalculationHistory[];
  setInput: (input: Partial<TaxInput>) => void;
  setResult: (result: TaxResult) => void;
  addToHistory: (item: CalculationHistory) => void;
  clearHistory: () => void;
  restoreFromHistory: (item: CalculationHistory) => void;
}

const defaultInput: TaxInput = {
  amount: 50000,
  frequency: 'annual',
  country: 'germany',
  direction: 'grossToNet',
  maritalStatus: 'single',
  dependents: 0,
  age: 30,
  insuranceClass: 1,
  region: 'BE',
  churchTax: false,
  healthInsuranceRate: 1.7,
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      input: defaultInput,
      result: null,
      history: [],
      setInput: (newInput) =>
        set((state) => ({
          input: { ...state.input, ...newInput },
        })),
      setResult: (result) => set({ result }),
      addToHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, 50),
        })),
      clearHistory: () => set({ history: [] }),
      restoreFromHistory: (item) =>
        set({
          input: item.input,
          result: item.result,
        }),
    }),
    {
      name: 'tax-vision-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
);
