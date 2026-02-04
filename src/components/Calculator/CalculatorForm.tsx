import { useCalculatorStore } from '@/lib/store/calculator';
import { calculate } from '@/lib/calculators';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UmamiEvents } from '@/lib/analytics';

export function CalculatorForm() {
  const { input, setInput, setResult, addToHistory } = useCalculatorStore();
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const result = calculate(input);
      setResult(result);
      addToHistory({
        id: Date.now().toString(),
        timestamp: Date.now(),
        input,
        result,
      });
      UmamiEvents.calculationCompleted(input.country, input.direction);
    } catch (error) {
      console.error('Calculation error:', error);
      UmamiEvents.calculationError(input.country, error instanceof Error ? error.message : 'Unknown error');
    }
  }, [input]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('calculator')}</h2>

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {input.direction === 'grossToNet' ? t('grossSalary') : t('netSalary')}
          </label>
          <input
            type="number"
            value={input.amount}
            onChange={(e) => setInput({ amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('paymentFrequency')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setInput({ frequency: 'monthly' });
                UmamiEvents.frequencyChanged('monthly');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                input.frequency === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => {
                setInput({ frequency: 'annual' });
                UmamiEvents.frequencyChanged('annual');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                input.frequency === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('annual')}
            </button>
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('direction')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setInput({ direction: 'grossToNet' });
                UmamiEvents.directionChanged('grossToNet');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                input.direction === 'grossToNet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('grossToNet')}
            </button>
            <button
              onClick={() => {
                setInput({ direction: 'netToGross' });
                UmamiEvents.directionChanged('netToGross');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                input.direction === 'netToGross'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('netToGross')}
            </button>
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('country')}
          </label>
          <select
            value={input.country}
            onChange={(e) => {
              const newCountry = e.target.value as any;
              const prevCountry = input.country;
              setInput({ country: newCountry });
              UmamiEvents.countryChanged(newCountry, prevCountry);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="germany">{t('germany')}</option>
            <option value="netherlands">{t('netherlands')}</option>
            <option value="singapore">{t('singapore')}</option>
            <option value="vietnam">{t('vietnam')}</option>
            <option value="japan">{t('japan')}</option>
          </select>
        </div>

        {/* Age - only for Singapore and Japan */}
        {(input.country === 'singapore' || input.country === 'japan') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={input.age}
              onChange={(e) => setInput({ age: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Marital Status - only for Germany */}
        {input.country === 'germany' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('age')}
            </label>
            <input
              type="number"
              value={input.age}
              onChange={(e) => setInput({ age: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Marital Status - only for Germany */}
        {input.country === 'germany' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('maritalStatus')}
            </label>
            <select
              value={input.maritalStatus}
              onChange={(e) => {
                const newStatus = e.target.value as any;
                setInput({ maritalStatus: newStatus });
                UmamiEvents.maritalStatusChanged(newStatus, input.country);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">{t('single')}</option>
              <option value="married">{t('married')}</option>
              <option value="divorced">{t('divorced')}</option>
              <option value="widowed">{t('widowed')}</option>
            </select>
          </div>
        )}

        {/* Dependents - only for Germany and Vietnam */}
        {(input.country === 'germany' || input.country === 'vietnam') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dependents')}
            </label>
            <input
              type="number"
              value={input.dependents}
              onChange={(e) => {
                const count = parseInt(e.target.value) || 0;
                setInput({ dependents: count });
                UmamiEvents.dependentsChanged(count, input.country);
              }}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Germany-specific fields */}
        {input.country === 'germany' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('taxClass')}
              </label>
              <select
                value={input.insuranceClass || 1}
                onChange={(e) => {
                  const insuranceClass = parseInt(e.target.value);
                  setInput({ insuranceClass });
                  UmamiEvents.insuranceClassChanged(insuranceClass, input.country);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">Class I - Single, no children</option>
                <option value="2">Class II - Single parent</option>
                <option value="3">Class III - Married, higher earner</option>
                <option value="4">Class IV - Married, equal earners</option>
                <option value="5">Class V - Married, lower earner</option>
                <option value="6">Class VI - Second job</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('federalState')}
              </label>
              <select
                value={input.region || 'BE'}
                onChange={(e) => {
                  const region = e.target.value;
                  setInput({ region });
                  UmamiEvents.regionChanged(region, input.country);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BW">Baden-Württemberg</option>
                <option value="BY">Bavaria</option>
                <option value="BE">Berlin</option>
                <option value="BB">Brandenburg</option>
                <option value="HB">Bremen</option>
                <option value="HH">Hamburg</option>
                <option value="HE">Hesse</option>
                <option value="MV">Mecklenburg-Vorpommern</option>
                <option value="NI">Lower Saxony</option>
                <option value="NW">North Rhine-Westphalia</option>
                <option value="RP">Rhineland-Palatinate</option>
                <option value="SL">Saarland</option>
                <option value="SN">Saxony</option>
                <option value="ST">Saxony-Anhalt</option>
                <option value="SH">Schleswig-Holstein</option>
                <option value="TH">Thuringia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('healthInsuranceRate')}
              </label>
              <input
                type="number"
                step="0.1"
                value={input.healthInsuranceRate || 1.7}
                onChange={(e) => setInput({ healthInsuranceRate: parseFloat(e.target.value) || 1.7 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={input.churchTax || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setInput({ churchTax: checked });
                  UmamiEvents.churchTaxToggled(checked, input.country);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                {t('churchTaxMember')}
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
