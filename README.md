# Tax Vision - Gross-Net Salary Calculator

A comprehensive web application for calculating salary conversions between gross and net (bidirectional) across multiple countries in EU and Asia.

## Features

- **Bidirectional Calculation**: Convert from gross to net or net to gross salary
- **Multi-Country Support**: Germany, Netherlands, Singapore, Vietnam
- **Comprehensive Tax Rules**: 
  - Progressive tax brackets
  - Social security contributions
  - Regional variations (Germany)
  - Age-based calculations (Singapore CPF)
  - Dependent deductions (Vietnam)
  - Church tax (Germany)
  - Tax credits (Netherlands)
- **Two Modes**:
  - **Single Calculator**: Detailed breakdown for one country
  - **Comparison Mode**: Compare results across all countries simultaneously
- **Visual Analytics**: Interactive pie and bar charts
- **URL Sharing**: Share calculations via URL
- **Calculation History**: Automatically saved in browser (last 50 calculations)
- **Keyboard Shortcuts**: Ctrl+1 (Single), Ctrl+2 (Comparison)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

The app will be available at `http://localhost:5173`

## Project Structure

```
tax-vision/
├── src/
│   ├── components/
│   │   ├── Calculator/      # Single calculator components
│   │   ├── Comparison/      # Comparison mode components
│   │   └── Charts/          # Visualization components
│   ├── lib/
│   │   ├── calculators/     # Tax calculation engines
│   │   ├── config/          # Tax rates & thresholds (JSON)
│   │   ├── store/           # Zustand state management
│   │   └── utils.ts         # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── App.tsx              # Main application component
├── public/
└── tests/
```

## Tax Calculation Methodology

### Germany (2026)
- **Progressive Tax**: 0% up to €12,348, then 14-42% (45% above ~€277k)
- **Tax Classes (Steuerklasse)**: 
  - Class I: Single, no children (standard allowance)
  - Class II: Single parent (standard allowance + benefits)
  - Class III: Married, higher earner (double allowance)
  - Class IV: Married, equal earners (standard allowance)
  - Class V: Married, lower earner (no allowance)
  - Class VI: Second job (no allowance)
- **Solidarity Surcharge**: 5.5% on income tax (only for high earners)
- **Church Tax**: 8-9% of income tax (optional, varies by state)
- **Social Contributions**: ~20% total
  - Pension: 9.3% (capped at €101,400)
  - Health: 7.3% + 2.9% supplementary
  - Unemployment: 1.3% (capped at €101,400)
  - Care: 1.8-2.3% (varies by number of children under 25)
    - No children: 2.3%
    - 1 child: 1.7%
    - 2 children: 1.45%
    - 3 children: 1.2%
    - 4 children: 0.95%
    - 5+ children: 0.7%

### Netherlands (2026)
- **Three Tax Brackets** (combined tax + social):
  - €0-€38,883: 35.70%
  - €38,884-€79,137: 37.56%
  - €79,138+: 49.50%
- **Tax Credits**:
  - General tax credit (up to €3,362)
  - Labor tax credit (up to €5,672)

### Singapore (2026)
- **Progressive Tax**: 0% up to S$20k, then 2-24%
- **CPF Contributions**: 20% employee (capped at S$8,000/month)
  - Age-based rates (55-60: 15.5%, 60-65: 12.5%)
  - Split into OA (23%), SA (6%), MA (8%) for age ≤55

### Vietnam (2026)
- **7-Tier Progressive System**: 5% to 35%
- **Calculation Order**:
  1. Gross Salary
  2. Subtract Social Insurance (10.5% total: 8% social + 1.5% health + 1% unemployment)
  3. = Income Before Tax
  4. Subtract Personal Deduction (₫15.5M/month)
  5. Subtract Dependent Deductions (₫6.2M/month per dependent)
  6. = Taxable Income (monthly)
  7. Apply Progressive Tax on monthly taxable income
  8. Net = Gross - Insurance - Tax
- **Social Insurance**: Capped at ₫46.8M for social/health, ₫106.2M for unemployment
- **Note**: Tax is calculated on monthly taxable income after all deductions

## Updating Tax Rates

Tax rates are stored in JSON files in `src/lib/config/`. To update rates:

1. Edit the relevant country JSON file (e.g., `germany.json`)
2. Update brackets, rates, thresholds, or caps
3. Rebuild the application

No code changes required for rate updates!

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Deployment

The app is a static SPA and can be deployed to:
- Vercel: `vercel deploy`
- Netlify: `netlify deploy --prod`
- AWS S3 + CloudFront
- GitHub Pages

## Disclaimer

Tax rates are based on 2026 regulations and are for informational purposes only. The calculator provides estimates that may differ from actual payroll calculations due to:

- Complex progressive tax formulas (especially Germany's geometric progression)
- Regional variations and specific employer policies
- Individual circumstances not captured in the calculator

Always consult a qualified tax professional or use official government calculators for accurate tax advice specific to your situation.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
