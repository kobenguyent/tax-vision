# Tracking Coverage Summary

This document provides a visual overview of all tracked user interactions in the Tax Vision application.

## Event Categories

### 🔢 Calculation Events (2)
- ✅ Calculation completed (tracks country + direction)
- ✅ Calculation errors

### 🎯 Mode & Navigation (2)
- ✅ Mode switching (Single ↔ Comparison)
- ✅ Language changes (EN, DE, NL, VI, JA)

### 📝 Input Field Changes (8)
- ✅ Country selection
- ✅ Payment frequency (Monthly/Annual)
- ✅ Calculation direction (Gross→Net / Net→Gross)
- ✅ Marital status (Germany)
- ✅ Number of dependents (Germany, Vietnam)
- ✅ Region/Federal state (Germany)
- ✅ Tax/Insurance class (Germany)
- ✅ Church tax toggle (Germany)

### 📤 Sharing & Output (2)
- ✅ URL sharing
- ✅ Results copied to clipboard

### 📊 Visualizations (2)
- ✅ Chart type viewed (Pie/Bar)
- ✅ Chart interactions (clicks)

### 📋 Comparison Mode (1)
- ✅ Column sorting

### 📜 History (3 - Prepared for future)
- ⏳ History item restored
- ⏳ History cleared
- ⏳ History item selected

## Coverage by Component

### App.tsx
- [x] Mode switching (keyboard shortcuts + buttons)
- [x] Language switching (5 languages)

### CalculatorForm.tsx
- [x] All input field changes
- [x] Country-specific field tracking
- [x] Calculation triggers

### ResultsBreakdown.tsx
- [x] Copy results button
- [x] Share URL button

### TaxChart.tsx
- [x] Chart type switching
- [x] Chart element clicks
- [x] View tracking

### ComparisonPage.tsx
- [x] Column sorting

## Privacy Considerations

**What is tracked:**
- User interaction patterns (which features are used)
- Feature preferences (chart types, modes, languages)
- Country selections (which tax systems interest users)
- Input field changes (frequency of modifications)

**What is NOT tracked:**
- ❌ Actual salary amounts
- ❌ Personal information
- ❌ User identity
- ❌ Session recordings
- ❌ Form field values

## Event Flow Example

```
User Journey: Calculate Germany Gross→Net salary
↓
1. pageview (automatic)
2. country-changed: { country: "germany", prevCountry: "netherlands" }
3. direction-changed: { direction: "grossToNet" }
4. frequency-changed: { frequency: "annual" }
5. dependents-changed: { count: 2, country: "germany" }
6. church-tax-toggled: { enabled: true, country: "germany" }
7. calculation-completed: { country: "germany", direction: "grossToNet" }
8. chart-viewed: { chartType: "pie" }
9. url-shared: { country: "germany" }
```

## Analytics Dashboard Metrics

Based on these events, you can track:

1. **Most Popular Features**
   - Single vs Comparison mode usage ratio
   - Chart preference (Pie vs Bar)
   - Language distribution

2. **User Behavior Patterns**
   - Average number of calculations per session
   - Most popular countries
   - Gross→Net vs Net→Gross ratio
   - Input field modification frequency

3. **Engagement Metrics**
   - URL sharing rate
   - Chart interaction rate
   - Multi-country comparison usage

4. **Technical Insights**
   - Error rate by country
   - Most common calculation errors

## Event Volume Estimate

For a typical user session:
- 1-2 pageviews
- 2-5 mode/navigation events
- 10-15 input changes
- 1-2 calculation events
- 1-3 visualization events
- 0-1 sharing events

**Total: ~15-28 events per active session**
