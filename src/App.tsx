import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorPage } from './components/Calculator/CalculatorPage';
import { ComparisonPage } from './components/Comparison/ComparisonPage';
import { Logo } from './components/Logo';
import { useUrlSync } from './lib/store/urlSync';
import { UmamiEvents } from './lib/analytics';

type Mode = 'single' | 'comparison';

function App() {
  const [mode, setMode] = useState<Mode>('single');
  const { t, i18n } = useTranslation();
  useUrlSync();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        setMode('single');
        UmamiEvents.switchToSingleMode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        setMode('comparison');
        UmamiEvents.switchToComparisonMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === 'comparison') setMode('comparison');
    else if (hash === 'single') setMode('single');
  }, []);

  useEffect(() => {
    window.location.hash = mode;
  }, [mode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Logo className="w-12 h-12" />
              <h1 className="text-4xl font-bold text-gray-900">{t('appTitle')}</h1>
            </div>
            <p className="text-gray-600">{t('appSubtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const prevLang = i18n.language;
                i18n.changeLanguage('en');
                UmamiEvents.languageChanged('en', prevLang);
              }}
              className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              EN
            </button>
            <button
              onClick={() => {
                const prevLang = i18n.language;
                i18n.changeLanguage('de');
                UmamiEvents.languageChanged('de', prevLang);
              }}
              className={`px-3 py-1 rounded ${i18n.language === 'de' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              DE
            </button>
            <button
              onClick={() => {
                const prevLang = i18n.language;
                i18n.changeLanguage('nl');
                UmamiEvents.languageChanged('nl', prevLang);
              }}
              className={`px-3 py-1 rounded ${i18n.language === 'nl' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              NL
            </button>
            <button
              onClick={() => {
                const prevLang = i18n.language;
                i18n.changeLanguage('vi');
                UmamiEvents.languageChanged('vi', prevLang);
              }}
              className={`px-3 py-1 rounded ${i18n.language === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              VI
            </button>
            <button
              onClick={() => {
                const prevLang = i18n.language;
                i18n.changeLanguage('ja');
                UmamiEvents.languageChanged('ja', prevLang);
              }}
              className={`px-3 py-1 rounded ${i18n.language === 'ja' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              JA
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setMode('single');
              UmamiEvents.switchToSingleMode();
            }}
            className={`px-6 py-3 font-medium transition-colors relative ${
              mode === 'single'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('singleCalculator')}
            <span className="ml-2 text-xs text-gray-400">(Ctrl+1)</span>
          </button>
          <button
            onClick={() => {
              setMode('comparison');
              UmamiEvents.switchToComparisonMode();
            }}
            className={`px-6 py-3 font-medium transition-colors relative ${
              mode === 'comparison'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('comparison')}
            <span className="ml-2 text-xs text-gray-400">(Ctrl+2)</span>
          </button>
        </div>

        {/* Content */}
        {mode === 'single' ? <CalculatorPage /> : <ComparisonPage />}

        {/* Footer */}
        <div className="mt-12 space-y-4">
          {/* Tax Disclaimer */}
          <div className="text-center text-sm text-gray-500">
            <p>Tax rates are based on 2026 regulations. Always consult a tax professional for accurate advice.</p>
          </div>
          
          {/* Privacy Notice */}
          <div className="max-w-4xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700 inline-flex items-center gap-2">
                🔒 {t('privacyTitle')}
              </h3>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700 mb-1">✅ {t('privacyTracked')}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-left">
                    <li>{t('privacyFeatures')}</li>
                    <li>{t('privacyLanguage')}</li>
                    <li>{t('privacyNavigation')}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">❌ {t('privacyNotTracked')}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-left">
                    <li>{t('privacySalary')}</li>
                    <li>{t('privacyPersonal')}</li>
                    <li>{t('privacyIP')}</li>
                  </ul>
                </div>
              </div>
              <p className="text-center pt-2 border-t border-gray-200">
                <span className="font-medium">{t('privacyGDPR')}</span> {t('privacyNoCookies')} • {t('privacyNoData')} • {t('privacyAnalytics')}{' '}
                <a 
                  href="https://umami.is/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Umami
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
