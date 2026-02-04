import { useCalculatorStore } from '@/lib/store/calculator';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UmamiEvents } from '@/lib/analytics';

export function TaxChart() {
  const { result } = useCalculatorStore();
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Track when chart is viewed
  useEffect(() => {
    if (result) {
      UmamiEvents.chartViewed(chartType);
    }
  }, [chartType, result]);

  if (!result) return null;

  const chartData = [
    { name: t('netSalary'), value: result.netSalary, color: '#10b981' },
    { name: t('tax'), value: result.totalTax, color: '#ef4444' },
    { name: t('totalDeductions'), value: result.totalSocial, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const barData = result.breakdown
    .filter(item => item.category === 'tax' || item.category === 'social')
    .map(item => ({
      name: item.label,
      value: Math.abs(item.amount),
    }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('visualization')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('pieChart')}
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('barChart')}
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={() => UmamiEvents.chartInteraction('pie', 'click')}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value.toFixed(0)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(0)} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
