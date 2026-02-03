import { useCalculatorStore } from '@/lib/store/calculator';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { breakdownTranslations } from '@/lib/breakdownTranslations';

export function ResultsBreakdown() {
  const { result } = useCalculatorStore();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">{t('enterAmount')}</p>
      </div>
    );
  }

  const handleCopy = () => {
    const text = `${t('grossSalary')}: ${formatCurrency(result.grossSalary, result.country)}\n${t('netSalary')}: ${formatCurrency(result.netSalary, result.country)}\n${t('effectiveTaxRate')}: ${result.effectiveRate.toFixed(2)}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('results')}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            Share URL
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">{t('grossSalary')}</p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(result.grossSalary, result.country)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {result.frequency === 'monthly' ? t('monthly') : t('annual')}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">{t('netSalary')}</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(result.netSalary, result.country)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {result.frequency === 'monthly' ? t('monthly') : t('annual')}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">{t('totalDeductions')}</p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(result.totalTax + result.totalSocial, result.country)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {t('tax')}: {formatCurrency(result.totalTax, result.country)}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-medium">{t('effectiveTaxRate')}</p>
          <p className="text-2xl font-bold text-purple-900">
            {result.effectiveRate.toFixed(2)}%
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {t('ofGrossSalary')}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{t('detailedBreakdown')}</h3>
        <div className="space-y-1">
          {result.breakdown.map((item, index) => {
            const displayAmount = result.frequency === 'monthly' ? item.amount / 12 : item.amount;
            return (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  item.category === 'income'
                    ? 'bg-green-50'
                    : item.category === 'net'
                    ? 'bg-blue-50 font-semibold'
                    : item.category === 'deduction'
                    ? 'bg-yellow-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {breakdownTranslations[item.label] ? t(breakdownTranslations[item.label]) : item.label}
                  </p>
                  <p className="text-xs text-gray-600">{item.explanation}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    displayAmount >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(Math.abs(displayAmount), result.country)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
