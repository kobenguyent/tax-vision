import { useState, useMemo } from 'react';
import { calculate } from '@/lib/calculators';
import { formatCurrency } from '@/lib/utils';
import type { TaxInput, TaxResult, Country } from '@/types';

const countries: Country[] = ['germany', 'netherlands', 'singapore', 'vietnam'];

export function ComparisonPage() {
  const [input, setInput] = useState<Omit<TaxInput, 'country'>>({
    amount: 50000,
    frequency: 'annual',
    direction: 'grossToNet',
    maritalStatus: 'single',
    dependents: 0,
    age: 30,
  });

  const [sortBy, setSortBy] = useState<'country' | 'net' | 'tax'>('net');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const results = useMemo(() => {
    return countries.map(country => {
      try {
        return calculate({ ...input, country });
      } catch (error) {
        console.error(`Error calculating for ${country}:`, error);
        return null;
      }
    }).filter((r): r is TaxResult => r !== null);
  }, [input]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'country') {
        comparison = a.country.localeCompare(b.country);
      } else if (sortBy === 'net') {
        comparison = a.netSalary - b.netSalary;
      } else if (sortBy === 'tax') {
        comparison = (a.totalTax + a.totalSocial) - (b.totalTax + b.totalSocial);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [results, sortBy, sortOrder]);

  const bestNet = Math.max(...results.map(r => r.netSalary));
  const lowestTax = Math.min(...results.map(r => r.totalTax + r.totalSocial));

  const toggleSort = (column: 'country' | 'net' | 'tax') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Compare Across Countries</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {input.direction === 'grossToNet' ? 'Gross Salary' : 'Net Salary'}
            </label>
            <input
              type="number"
              value={input.amount}
              onChange={(e) => setInput({ ...input, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={input.frequency}
              onChange={(e) => setInput({ ...input, frequency: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direction
            </label>
            <select
              value={input.direction}
              onChange={(e) => setInput({ ...input, direction: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="grossToNet">Gross → Net</option>
              <option value="netToGross">Net → Gross</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={input.age}
              onChange={(e) => setInput({ ...input, age: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marital Status
            </label>
            <select
              value={input.maritalStatus}
              onChange={(e) => setInput({ ...input, maritalStatus: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dependents
            </label>
            <input
              type="number"
              value={input.dependents}
              onChange={(e) => setInput({ ...input, dependents: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Country {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross
                </th>
                <th
                  onClick={() => toggleSort('net')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Net {sortBy === 'net' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => toggleSort('tax')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Total Deductions {sortBy === 'tax' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedResults.map((result) => {
                const isHighlightNet = result.netSalary === bestNet;
                const isHighlightTax = (result.totalTax + result.totalSocial) === lowestTax;

                return (
                  <tr key={result.country} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {result.country === 'germany' && '🇩🇪 Germany'}
                        {result.country === 'netherlands' && '🇳🇱 Netherlands'}
                        {result.country === 'singapore' && '🇸🇬 Singapore'}
                        {result.country === 'vietnam' && '🇻🇳 Vietnam'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(result.grossSalary, result.country)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                      isHighlightNet ? 'text-green-700 bg-green-50' : 'text-gray-900'
                    }`}>
                      {formatCurrency(result.netSalary, result.country)}
                      {isHighlightNet && ' 🏆'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                      isHighlightTax ? 'text-green-700 bg-green-50 font-semibold' : 'text-gray-900'
                    }`}>
                      {formatCurrency(result.totalTax + result.totalSocial, result.country)}
                      {isHighlightTax && ' 🏆'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {result.effectiveRate.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
