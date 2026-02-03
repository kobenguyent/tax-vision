import { CalculatorForm } from './CalculatorForm';
import { ResultsBreakdown } from './ResultsBreakdown';
import { TaxChart } from '../Charts/TaxChart';

export function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalculatorForm />
        <ResultsBreakdown />
      </div>
      <TaxChart />
    </div>
  );
}
