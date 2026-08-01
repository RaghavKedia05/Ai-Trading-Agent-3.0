# Market Signal Lab

Market Signal Lab is an interactive stock-analysis dashboard for stocks, ETFs, indexes, and other instruments supported by Yahoo Finance. It converts the latest available adjusted daily market data into explainable indicators, a BUY/HOLD/SELL recommendation, a technical-confidence score, and a historical strategy simulation.

The project is built for market research and education. It does not provide personalized financial advice or guarantee future performance.

## Why It Matters

Technical dashboards often show many indicators without explaining how they relate to a conclusion. Market Signal Lab focuses on transparency:

- Every signal is produced by documented rules.
- Every score contribution is visible to the user.
- Confidence measures rule agreement and data coverage, not an invented prediction probability.
- Historical results are compared with buy-and-hold and include transaction costs.
- The code is separated into focused modules that are easy to test and extend.

## Key Features

- Symbol validation with support for formats such as `AAPL`, `RELIANCE.NS`, `BRK-B`, and `BTC-USD`
- Adjusted daily OHLCV market data and instrument metadata
- Moving averages, Wilder RSI, MACD, Bollinger Bands, ATR, and relative volume
- Explainable BUY, HOLD, or SELL technical recommendation
- Technical-confidence percentage with Low, Moderate, and High labels
- Synchronized candlestick, volume, RSI, and MACD charts
- Long/flat/short historical strategy simulation
- Strategy return, benchmark return, maximum drawdown, Sharpe ratio, and entry count
- Processed data table and CSV export
- Responsive Streamlit interface with caching and data-freshness warnings

## How It Works

```text
User selects a symbol and range
             |
             v
Validate symbol and download adjusted Yahoo Finance data
             |
             v
Calculate trend, momentum, volatility, and volume indicators
             |
             v
Apply transparent weighted signal rules
             |
             v
Display verdict, confidence, evidence, charts, and risk context
             |
             v
Run the same rules historically and compare with buy-and-hold
```

Extra warm-up history is downloaded before the selected chart range. This allows long-window indicators such as MA200 to remain valid even when the user views a shorter period.

## Dashboard Metrics

| Metric | What it shows | Why it is useful |
|---|---|---|
| **Last Close** | Latest adjusted closing price and one-session change | Provides the current price reference used by the analysis |
| **Recommendation** | BUY, HOLD, or SELL verdict | Summarizes the weighted technical rules |
| **Confidence** | Clarity of the verdict and indicator coverage | Shows how consistently the available rules support the displayed state |
| **RSI (14)** | Smoothed momentum on a 0-100 scale | Highlights potentially oversold (`<30`) or overbought (`>70`) conditions |
| **Relative Volume** | Latest volume divided by its 20-session average | Shows whether participation is unusually high or low |
| **ATR (14)** | Smoothed true range in price units | Provides recent volatility and risk context without predicting direction |

Confidence is **not** a win probability. A high percentage means the implemented indicators clearly agree with the displayed technical state.

## Indicators

| Indicator | Calculation | Role |
|---|---|---|
| **MA20** | 20-session simple moving average | Short-term price trend |
| **MA50** | 50-session simple moving average | Intermediate trend |
| **MA200** | 200-session simple moving average | Long-term trend and market regime |
| **RSI (14)** | Wilder-smoothed average gains vs. losses | Momentum and stretched conditions |
| **MACD** | EMA12 minus EMA26 | Direction and strength of momentum |
| **MACD Signal** | 9-session EMA of MACD | Momentum crossover reference |
| **Bollinger Bands** | MA20 plus/minus two standard deviations | Price position relative to recent volatility |
| **ATR (14)** | Wilder-smoothed true range | Typical recent price movement |
| **Relative Volume** | Volume divided by average volume over 20 sessions | Current market participation |

Indicators summarize historical behavior and can lag changing market conditions. They should be evaluated together rather than treated as isolated trading instructions.

## Signal Model

The dashboard uses a transparent weighted rules engine:

| Rule | Bullish | Bearish | Weight |
|---|---|---|---:|
| Long-term trend | MA50 above MA200 | MA50 below MA200 | 2 |
| RSI | Below 30 | Above 70 | 2 |
| Momentum | MACD above signal line | MACD below signal line | 1 |
| Short-term trend | Close above MA20 | Close below MA20 | 1 |

```text
Normalized score = raw score / available rule weight
```

- Score `>= +0.50`: **BUY**
- Score `<= -0.50`: **SELL**
- Score between those thresholds: **HOLD**

The confidence calculation combines verdict clarity with the percentage of available indicator weight. It describes internal agreement only; it is not calibrated against future returns.

## Backtesting

The backtest maps signals to positions:

- BUY: long (`+1`)
- HOLD: flat (`0`)
- SELL: short (`-1`)

Signals are shifted by one session before returns are applied, preventing direct same-bar look-ahead. Position changes include a default cost of 10 basis points.

| Result | Meaning |
|---|---|
| **Strategy Return** | Compounded return of the simulated rules after modeled costs |
| **Buy & Hold** | Passive benchmark return over the same history |
| **Maximum Drawdown** | Largest historical decline from a previous strategy peak |
| **Sharpe Ratio** | Annualized return-to-volatility measure using a zero risk-free rate |
| **Entries** | Number of new non-zero long or short positions |

The simulation does not model taxes, detailed slippage, bid/ask spread, market impact, short-borrow constraints, or partial fills.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Python** | Application and analysis language |
| **Streamlit** | Interactive dashboard and caching |
| **pandas** | Time-series processing and tabular calculations |
| **NumPy** | Numerical operations and vectorized strategy logic |
| **Plotly** | Interactive financial and performance charts |
| **yfinance** | Yahoo Finance market data and metadata |
| **pytest** | Automated test suite |
| **Ruff** | Formatting and static code checks |

### StockWise Frontend

The `frontend/` workspace provides the full multi-page StockWise product experience requested for the platform.

| Technology | Purpose |
|---|---|
| **React + TypeScript** | Component-based, type-safe application UI |
| **Tailwind CSS** | Responsive design system and layout |
| **History API router** | Lightweight client-side navigation and stock-detail routes |
| **Recharts** | Price, financial, and sparkline visualizations |
| **Lucide React** | Accessible interface icons |
| **Vite** | Development server and optimized production builds |

All frontend market content is clearly labeled demo data and stored in JSON files under `frontend/src/data/`, allowing live APIs to replace it later without restructuring the page components.

## Project Structure

```text
.
|-- app.py                  # Streamlit interface and view composition
|-- src/
|   |-- charts.py           # Plotly charts and visual configuration
|   |-- data.py             # Validation, market data, metadata, and caching inputs
|   |-- indicators.py       # Indicator calculations
|   |-- models.py           # Shared immutable result models
|   `-- strategy.py         # Signals, confidence, and backtesting
|-- tests/                  # Data, indicator, strategy, and import tests
|-- frontend/               # React and TypeScript StockWise product UI
|   |-- src/components/     # Navigation, charts, cards, tables, and layout
|   |-- src/data/           # API-ready Indian market mock JSON
|   |-- src/pages/          # Home, dashboard, screener, stock, news, and watchlist
|   `-- package.json        # Frontend scripts and dependencies
|-- .streamlit/config.toml  # Streamlit theme and server settings
|-- requirements.txt        # Runtime dependencies
|-- requirements-dev.txt    # Development dependencies
`-- pyproject.toml          # pytest and Ruff configuration
```

## Getting Started

Python 3.10 or newer is recommended.

```bash
git clone <repository-url>
cd Ai-Trading-Agent-3.0
python -m venv .venv
```

Activate the environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install and run:

```bash
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

Open `http://localhost:8501` if it does not open automatically.

### Run the StockWise frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Create a production frontend bundle with:

```bash
npm run build
```

## Testing

```bash
python -m pip install -r requirements-dev.txt
python -m pytest
python -m ruff check .
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

The tests cover symbol validation, indicator edge cases, signal and confidence behavior, backtest integrity, and public application imports.

## Deployment

The application can be deployed on Streamlit Community Cloud:

1. Push the repository to GitHub.
2. Create a Streamlit application from the repository.
3. Select `app.py` as the entry point.
4. Deploy with a supported Python version.

No API secret is required for the default Yahoo Finance integration, but the deployed application must have outbound network access.

## Limitations

- Yahoo Finance is suitable for research but is not an execution-grade market feed.
- Technical indicators are backward-looking and can produce false or delayed signals.
- The rule weights have not been optimized for a particular asset or market regime.
- Confidence measures technical agreement, not expected return or trading success.
- Backtest results are historical and do not guarantee future performance.
- Daily data cannot fully represent intraday execution, liquidity, or price gaps.

Use Market Signal Lab to explore evidence and understand indicator relationships, not as the sole basis for an investment decision.

## License

No license is currently included. Add an explicit license before redistribution or accepting external contributions.
