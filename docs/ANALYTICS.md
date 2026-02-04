# Analytics Integration - Umami

This project uses [Umami](https://umami.is/) for privacy-focused web analytics.

## Configuration

The Umami tracking script is integrated in `index.html`:

```html
<script async defer src="https://cloud.umami.is/script.js" data-website-id="YOUR-WEBSITE-ID"></script>
```

**Website ID**: `69548a17-9535-4905-9fb1-a00daf068be7`

## Custom Event Tracking

Beyond automatic pageview tracking, we track comprehensive user interactions:

### Tracked Events

| Event | Description | Properties | Component |
|-------|-------------|------------|-----------|
| **Calculation Events** |
| `calculation-completed` | User completes a salary calculation | `country`, `direction` | CalculatorForm |
| `calculation-error` | Calculation fails | `country`, `error` | CalculatorForm |
| **Mode & Navigation** |
| `mode-switch` | User switches between single/comparison | `mode` | App |
| `language-changed` | User changes UI language | `language`, `prevLanguage` | App |
| **Input Changes** |
| `country-changed` | User changes country selection | `country`, `prevCountry` | CalculatorForm |
| `frequency-changed` | User changes payment frequency | `frequency` | CalculatorForm |
| `direction-changed` | User changes calculation direction | `direction` | CalculatorForm |
| `marital-status-changed` | User changes marital status | `status`, `country` | CalculatorForm |
| `dependents-changed` | User changes number of dependents | `count`, `country` | CalculatorForm |
| `region-changed` | User changes region/state | `region`, `country` | CalculatorForm |
| `insurance-class-changed` | User changes tax class (Germany) | `insuranceClass`, `country` | CalculatorForm |
| `church-tax-toggled` | User toggles church tax (Germany) | `enabled`, `country` | CalculatorForm |
| **Sharing & Output** |
| `url-shared` | User shares calculation via URL | `country` | ResultsBreakdown |
| `results-copied` | User copies results to clipboard | `country` | ResultsBreakdown |
| **History** |
| `history-restored` | User restores from history | `country` | (Future) |
| `history-cleared` | User clears calculation history | - | (Future) |
| `history-item-selected` | User selects history item | `itemAge` | (Future) |
| **Visualizations** |
| `chart-viewed` | User views/switches chart type | `chartType` | TaxChart |
| `chart-interaction` | User clicks on chart element | `chartType`, `action` | TaxChart |
| **Comparison Mode** |
| `comparison-sorted` | User sorts comparison table | `column` | ComparisonPage |

### Implementation

Events are tracked via `src/lib/analytics.ts`:

```typescript
import { UmamiEvents } from '@/lib/analytics';

// Track a calculation
UmamiEvents.calculationCompleted('germany', 'grossToNet');

// Track mode switch
UmamiEvents.switchToComparisonMode();

// Track country change
UmamiEvents.countryChanged('singapore', 'germany');

// Track language change
UmamiEvents.languageChanged('de', 'en');
```

### Adding New Events

1. Add the event function to `UmamiEvents` in `src/lib/analytics.ts`
2. Call it at the appropriate interaction point
3. Document it in this table

## Key Insights Available

With this tracking, you can analyze:
- **Most popular countries** - Which tax systems users are most interested in
- **Calculation patterns** - Gross→Net vs Net→Gross usage
- **User preferences** - Language distribution, most used features
- **Input behavior** - Which fields users modify most often
- **Feature adoption** - Single vs Comparison mode usage
- **Visualization engagement** - Pie vs Bar chart preferences

## Accessing Analytics

View analytics at: [https://cloud.umami.is/](https://cloud.umami.is/)

## Privacy

Umami is GDPR-compliant and privacy-focused:
- No cookies used
- No personal data collected
- No cross-site tracking
- All data anonymized
- Salary amounts are never tracked

## Changing Website ID

To use a different Umami instance or website:

1. Update the `data-website-id` in `index.html`
2. Rebuild: `npm run build`
3. Deploy

## Disabling Analytics

To disable tracking:

```html
<!-- Comment out or remove this line in index.html -->
<script async defer src="https://cloud.umami.is/script.js" data-website-id="..."></script>
```

To disable specific events, remove the `UmamiEvents.*` calls from components.
