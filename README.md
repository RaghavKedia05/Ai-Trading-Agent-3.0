# StockWise

StockWise is a modern, responsive stock-research interface focused on the Indian equity market. It helps investors explore companies, compare financial metrics, review transparent BUY/HOLD/SELL research, track watchlists, screen opportunities, and follow market activity from one consistent workspace.

The current release is a frontend-only product prototype. All prices, fundamentals, recommendations, and news are realistic demo data stored locally in JSON files. Live market APIs will be integrated after the product experience is finalized.

> **Risk disclaimer:** StockWise provides research and educational information only. It does not constitute investment advice. Investments in securities are subject to market risks.

## Product Experience

### Homepage

- Responsive fintech navigation and stock-search autocomplete
- Market overview for NIFTY 50, SENSEX, BANK NIFTY, and NIFTY IT
- Recommendation cards with target price, expected return, risk, horizon, and confidence
- Market movers with gainers, losers, activity, and 52-week-high views
- Platform capabilities and market research feed

### Stock Research

- Company identity, exchange, sector, market status, price, and daily movement
- Interactive period controls and price chart
- BUY/HOLD/SELL recommendation with target and confidence
- Bull, base, and bear scenarios
- Market capitalization, P/E, EPS, ROE, leverage, dividend, and growth metrics
- Fundamental, technical, valuation, and risk scores
- Strengths, risks, quarterly performance, peers, news, and analyst consensus
- Watchlist and price-alert actions

### Screener

- Company and symbol search
- Sector, recommendation, and risk filters
- P/E and ROE range controls
- Sortable-style results table with direct analysis links
- Responsive table, reset control, pagination state, and empty results state

### Investor Dashboard

- Watchlist summary and recommended opportunities
- Portfolio placeholder and price-alert summary
- Recently viewed overview
- Index cards and sector-performance heatmap
- Daily market news

### Supporting Routes

- Recommendations with BUY/HOLD/SELL tabs
- Persistent in-session watchlist
- Market news and research feed
- Stock detail URLs such as `/stocks/RELIANCE`
- Accessible 404 page

## Technology

| Technology | Purpose |
|---|---|
| React 19 | Component-based interface |
| TypeScript | Static typing and safer refactoring |
| Tailwind CSS | Responsive design system |
| Recharts | Price, financial, and sparkline charts |
| Lucide React | Consistent interface icons |
| Vite | Development server and production bundling |
| History API | Lightweight client-side routing without a router dependency |
| ESLint | Static code-quality checks |

## Application Flow

```text
Mock JSON market data
        |
        v
Typed Stock, Market, and News models
        |
        v
Reusable cards, charts, tables, navigation, and watchlist state
        |
        v
Home / Dashboard / Screener / Recommendations / Watchlist / News / Stock Details
```

The JSON-first data boundary keeps presentation code separate from data sourcing. A future API integration can replace the files in `src/data/` while preserving the component and page architecture.

## Project Structure

```text
.
|-- src/
|   |-- components/          # Navigation, footer, charts, cards, and shared UI
|   |-- data/                # Indian-market demo JSON
|   |-- pages/               # Product routes
|   |-- state/               # Watchlist state
|   |-- App.tsx              # Page selection and loading state
|   |-- router.tsx           # History API navigation
|   |-- types.ts             # Shared data contracts
|   `-- index.css            # Tailwind layers and responsive UI styles
|-- index.html
|-- package.json
|-- tailwind.config.js
|-- vite.config.ts
`-- tsconfig.json
```

## Run Locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Quality Checks

Run static analysis:

```bash
npm run lint
```

Create a type-checked production bundle:

```bash
npm run build
```

Inspect the production bundle locally:

```bash
npm run preview
```

Audit production dependencies:

```bash
npm audit --omit=dev
```

## Demo Data

The application includes sample Indian-market data for:

- Reliance Industries
- Tata Consultancy Services
- HDFC Bank
- Infosys
- ICICI Bank
- Bharti Airtel

Demo data is located in:

```text
src/data/stocks.json
src/data/markets.json
src/data/news.json
```

It must not be treated as current market information or used to make an investment decision.

## Current Scope

Included:

- Complete responsive frontend
- Functional client-side navigation
- Search, filtering, watchlist, charts, and UI states
- API-ready mock data architecture

Not included yet:

- Backend services
- Authentication
- Live market-data APIs
- Persistent user accounts or watchlists
- Portfolio brokerage integration
- Notifications or payment systems

## License

No license is currently included. Add an explicit license before redistribution or accepting external contributions.
