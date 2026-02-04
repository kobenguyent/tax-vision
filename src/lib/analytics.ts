/**
 * Umami Analytics Helper
 * Track custom events for user interactions
 */

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, any>) => void;
    };
  }
}

/**
 * Track a custom event in Umami
 * @param event - Event name (e.g., "calculation-completed", "country-changed")
 * @param data - Optional event properties
 */
export function trackEvent(event: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(event, data);
  }
}

/**
 * Predefined events for common actions
 */
export const UmamiEvents = {
  // Calculation events
  calculationCompleted: (country: string, direction: string) =>
    trackEvent('calculation-completed', { country, direction }),
  
  calculationError: (country: string, error: string) =>
    trackEvent('calculation-error', { country, error }),
  
  // Mode switching
  switchToSingleMode: () => trackEvent('mode-switch', { mode: 'single' }),
  
  switchToComparisonMode: () => trackEvent('mode-switch', { mode: 'comparison' }),
  
  // Country selection
  countryChanged: (country: string, prevCountry?: string) =>
    trackEvent('country-changed', { country, prevCountry }),
  
  // Language switching
  languageChanged: (language: string, prevLanguage?: string) =>
    trackEvent('language-changed', { language, prevLanguage }),
  
  // Input changes
  frequencyChanged: (frequency: 'monthly' | 'annual') =>
    trackEvent('frequency-changed', { frequency }),
  
  directionChanged: (direction: 'grossToNet' | 'netToGross') =>
    trackEvent('direction-changed', { direction }),
  
  maritalStatusChanged: (status: string, country: string) =>
    trackEvent('marital-status-changed', { status, country }),
  
  dependentsChanged: (count: number, country: string) =>
    trackEvent('dependents-changed', { count, country }),
  
  regionChanged: (region: string, country: string) =>
    trackEvent('region-changed', { region, country }),
  
  insuranceClassChanged: (insuranceClass: number, country: string) =>
    trackEvent('insurance-class-changed', { insuranceClass, country }),
  
  churchTaxToggled: (enabled: boolean, country: string) =>
    trackEvent('church-tax-toggled', { enabled, country }),
  
  // Sharing
  urlShared: (country: string) =>
    trackEvent('url-shared', { country }),
  
  resultsCopied: (country: string) =>
    trackEvent('results-copied', { country }),
  
  // History
  historyRestored: (country: string) =>
    trackEvent('history-restored', { country }),
  
  historyCleared: () => trackEvent('history-cleared'),
  
  historyItemSelected: (itemAge: number) =>
    trackEvent('history-item-selected', { itemAge }),
  
  // Charts
  chartViewed: (chartType: 'pie' | 'bar') =>
    trackEvent('chart-viewed', { chartType }),
  
  chartInteraction: (chartType: 'pie' | 'bar', action: string) =>
    trackEvent('chart-interaction', { chartType, action }),
  
  // Comparison mode
  comparisonSorted: (column: string) =>
    trackEvent('comparison-sorted', { column }),
} as const;
