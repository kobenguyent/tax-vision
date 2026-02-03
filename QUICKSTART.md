# Quick Start Guide

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## Using the Calculator

### Single Calculator Mode (Ctrl+1)
1. Enter your salary amount
2. Select frequency (Monthly/Annual)
3. Choose calculation direction (Gross→Net or Net→Gross)
4. Select your country
5. Fill in personal details (age, marital status, dependents)
6. For Germany: select your state and church tax status
7. View detailed breakdown and charts
8. Click "Share URL" to share your calculation

### Comparison Mode (Ctrl+2)
1. Enter your salary and personal details once
2. See results for all 4 countries simultaneously
3. Click column headers to sort
4. Best values are highlighted with 🏆

## Keyboard Shortcuts
- **Ctrl+1** (or Cmd+1 on Mac): Switch to Single Calculator
- **Ctrl+2** (or Cmd+2 on Mac): Switch to Comparison Mode

## Features

### Supported Countries
- 🇩🇪 **Germany**: Progressive tax, solidarity surcharge, church tax, social contributions
- 🇳🇱 **Netherlands**: Combined tax+social brackets, tax credits
- 🇸🇬 **Singapore**: Progressive tax, age-based CPF contributions
- 🇻🇳 **Vietnam**: 7-tier progressive system, dependent deductions

### Calculation Modes
- **Gross → Net**: Calculate take-home from gross salary
- **Net → Gross**: Calculate required gross for target net salary

### Visualizations
- **Pie Chart**: See tax composition breakdown
- **Bar Chart**: Compare individual tax components

### Sharing
- Click "Share URL" to copy a shareable link
- All calculation parameters are encoded in the URL
- Recipients can see your exact calculation

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

Build output will be in the `dist/` directory.

## Updating Tax Rates

Tax rates are stored in JSON files in `src/lib/config/`:
- `germany.json`
- `netherlands.json`
- `singapore.json`
- `vietnam.json`

To update rates:
1. Edit the relevant JSON file
2. Rebuild the application: `npm run build`
3. No code changes required!

## Troubleshooting

### Port 5173 already in use
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests failing
```bash
# Clear test cache
npm test -- --clearCache
npm test
```

## Project Structure

```
tax-vision/
├── src/
│   ├── components/          # React components
│   │   ├── Calculator/      # Single calculator
│   │   ├── Comparison/      # Comparison mode
│   │   └── Charts/          # Visualizations
│   ├── lib/
│   │   ├── calculators/     # Tax calculation engines
│   │   ├── config/          # Tax rates (JSON)
│   │   ├── store/           # State management
│   │   └── utils.ts         # Utilities
│   ├── types/               # TypeScript types
│   ├── tests/               # Unit tests
│   └── App.tsx              # Main app
├── public/                  # Static assets
├── README.md                # Full documentation
└── package.json             # Dependencies
```

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review IMPLEMENTATION_SUMMARY.md for technical details
3. Open an issue on the repository

## Disclaimer

Tax calculations are for informational purposes only. Always consult a qualified tax professional for accurate tax advice specific to your situation.
