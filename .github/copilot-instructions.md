# Tax Vision - Copilot Instructions

## Build, Test, and Lint Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests with Vitest
npm test -- --watch      # Watch mode
npm test -- calculators  # Run specific test file (pattern matching)
npm test -- --clearCache # Clear test cache if issues occur

# Note: No linting configured yet
```

## Architecture Overview

### Tax Calculation Engine

The app uses a **factory pattern** for tax calculations across multiple countries:

- `CalculatorFactory` (src/lib/calculators/index.ts) routes to country-specific calculators
- Each calculator extends a common interface with `calculateGrossToNet()` and `calculateNetToGross()` methods
- **Bidirectional calculation**: Net-to-gross uses iterative approximation (binary search) to find the gross amount that yields the target net

### Configuration-Driven Tax Rules

Tax rates are **externalized to JSON files** in `src/lib/config/`:
- `germany.json`, `netherlands.json`, `singapore.json`, `vietnam.json`, `japan.json`
- Each contains brackets, rates, thresholds, caps, and regional variations
- **No code changes needed to update tax rates** - just edit JSON and rebuild

### State Management

**Zustand** stores are used for:
- `calculator.ts`: Current calculation inputs/results and history (persisted to localStorage, max 50 items)
- `urlSync.ts`: Syncs state with URL query params for shareable links

### Two Operating Modes

1. **Single Calculator**: Detailed breakdown with charts (Ctrl+1)
2. **Comparison Mode**: All countries side-by-side (Ctrl+2)

Components are organized accordingly:
- `src/components/Calculator/` - Single mode
- `src/components/Comparison/` - Comparison mode
- `src/components/Charts/` - Recharts visualizations (pie/bar)

## Key Conventions

### Country Calculator Structure

Each calculator (e.g., `GermanyCalculator.ts`) follows this pattern:

```typescript
class CountryCalculator {
  private config = getConfig('country');
  
  calculateGrossToNet(input: TaxInput): TaxResult {
    // 1. Annualize if monthly
    // 2. Calculate social contributions (order matters for some countries!)
    // 3. Calculate income tax (progressive brackets)
    // 4. Apply special rules (solidarity surcharge, church tax, etc.)
    // 5. Build detailed breakdown array
    // 6. Return TaxResult with gross, net, and itemized breakdown
  }
  
  calculateNetToGross(input: TaxInput): TaxResult {
    // Binary search: iterate to find gross that yields target net
  }
}
```

### Tax Calculation Ordering (Critical!)

**Germany**: Social contributions calculated on gross, then income tax on (gross - social)
**Netherlands**: Combined tax+social brackets applied together
**Singapore**: Tax calculated, then CPF deducted separately
**Vietnam**: Insurance deducted first, then tax on (gross - insurance - deductions)

The order is **country-specific** and must follow local regulations.

### Breakdown Items

All calculators return a `breakdown: TaxBreakdownItem[]` array with:
- `category`: 'income' | 'deduction' | 'tax' | 'social' | 'net'
- `label`, `amount`, `percentage`, `explanation`

This powers both the detail view and charts.

### Type Safety

All inputs/outputs use strictly typed interfaces in `src/types/index.ts`:
- `TaxInput`: User inputs (amount, country, marital status, etc.)
- `TaxResult`: Calculation results with breakdown
- No `any` types allowed

### Regional Variations

**Germany**: 16 states (Bundesländer) with different church tax rates (8-9%)
**Singapore**: Age-based CPF contribution rates (changes at 55, 60, 65)
**Vietnam**: Social insurance caps differ by contribution type

These are handled via conditional logic in calculators using input fields like `region`, `age`, `dependents`.

## Testing Strategy

Tests in `src/tests/calculators.test.ts` verify:
- Known salary amounts produce expected net/gross results
- Edge cases (min/max brackets, regional differences)
- Bidirectional consistency (gross→net→gross should match)

When adding a new country:
1. Create calculator class in `src/lib/calculators/`
2. Add JSON config in `src/lib/config/`
3. Add test cases with known good values
4. Register in `CalculatorFactory` switch statement
5. Update `Country` type in `src/types/index.ts`

## Internationalization

The app uses **i18next** for translations:
- `src/i18n.ts`: i18n initialization
- `src/lib/breakdownTranslations.ts`: Tax breakdown translations
- Translations are applied to tax breakdown labels and explanations

When adding tax calculation logic, ensure explanatory text is translatable.

## Deployment

GitHub Actions workflow (`.github/workflows/FE-deployment.yml`) handles CI/CD.
Build with `npm run build:github` for GitHub Pages deployment (sets base path).
