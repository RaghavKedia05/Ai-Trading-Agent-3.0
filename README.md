# Market Signal Lab

Market Signal Lab is an interactive technical-analysis and strategy-research dashboard built with Streamlit, pandas, Plotly, NumPy, and Yahoo Finance data. It turns adjusted daily market prices into explainable indicators, a transparent bullish/neutral/bearish signal, a technical-confidence score, and a historical strategy simulation.

The application is designed for:

- Investors who want a fast technical overview of a stock, ETF, index, or other supported instrument.
- Students learning how common market indicators relate to price, momentum, volatility, and volume.
- Developers who want a modular foundation for further quantitative research.

> **Important:** Market Signal Lab is an educational and research tool. It is not an automated trading system, financial adviser, or recommendation to buy or sell any security. Technical indicators are backward-looking and cannot guarantee future performance.

## Contents

- [What the Project Does](#what-the-project-does)
- [Dashboard Workflow](#dashboard-workflow)
- [Dashboard Metrics](#dashboard-metrics)
- [Technical Indicators](#technical-indicators)
- [Signal Method](#signal-method)
- [Technical Confidence](#technical-confidence)
- [Charts and Views](#charts-and-views)
- [Backtesting](#backtesting)
- [Data Processing](#data-processing)
- [Architecture](#architecture)
- [Installation](#installation)
- [Testing and Code Quality](#testing-and-code-quality)
- [Deployment](#deployment)
- [Limitations](#limitations)

## What the Project Does

For a selected market symbol and chart range, the application:

1. Validates and normalizes the symbol.
2. Downloads adjusted daily OHLCV data from Yahoo Finance.
3. Fetches additional warm-up history so long-window indicators are available even when the visible chart range is short.
4. Calculates trend, momentum, volatility, and volume indicators.
5. Applies a documented weighted-rule model to the most recent completed session.
6. Displays a bullish, neutral, or bearish technical verdict with the evidence behind it.
7. Estimates how clearly the available rules support that verdict.
8. Simulates how the same rules would have behaved historically.
9. Lets the user inspect and export the calculated dataset.

The signal engine is intentionally described as **rule-based technical analysis**, not artificial intelligence. Every score contribution can be inspected and reproduced.

## Dashboard Workflow

The main control bar contains:

| Control | Purpose |
|---|---|
| **Symbol** | Selects the market instrument. Examples: `AAPL`, `MSFT`, `RELIANCE.NS`, `BRK-B`, `^GSPC`, or `BTC-USD`. |
| **Chart range** | Controls how much processed history appears in charts and the data table. Available ranges are one month through five years. |
| **Refresh** | Clears the Streamlit data cache and requests current provider data. |

Market data is cached for 15 minutes and instrument metadata for one hour. This reduces unnecessary provider requests while still allowing manual refreshes.

## Dashboard Metrics

The metric row provides the fastest summary of current conditions.

### Last Close

The latest adjusted daily closing price, formatted in the instrument's reported currency.

The change below it compares the latest close with the previous trading session:

```text
Daily change = (latest close / previous close) - 1
```

**Why it matters:** The close is the reference price used by the indicators and strategy. The daily percentage change gives immediate context about the latest session, but one session alone does not establish a trend.

### Signal

The latest result from the weighted technical rules:

- **BULLISH:** the normalized score is at least `+0.50`.
- **NEUTRAL:** the normalized score is between `-0.50` and `+0.50`.
- **BEARISH:** the normalized score is at most `-0.50`.

The value below the verdict shows the raw score and maximum available score, such as `+4 / 6`.

**Why it matters:** The signal condenses several indicators into one readable state. It should always be interpreted together with its evidence, confidence, risk, and backtest rather than used alone.

### Confidence

A percentage representing the clarity of the current technical verdict and the availability of its required indicators. It is categorized as:

| Confidence | Label |
|---:|---|
| `80%` or above | High |
| `60%` to below `80%` | Moderate |
| Below `60%` | Low |

**Why it matters:** Higher confidence means the implemented rules more clearly support the displayed state and have sufficient data coverage. It does **not** mean there is that percentage chance of making money. See [Technical Confidence](#technical-confidence) for the exact method.

### RSI (14)

The latest 14-session Relative Strength Index using Wilder-style exponential smoothing.

| RSI range | Common interpretation |
|---:|---|
| Below `30` | Oversold or unusually weak momentum |
| `30` to `70` | Neutral momentum range |
| Above `70` | Overbought or unusually strong momentum |

**Why it matters:** RSI helps identify stretched momentum. Oversold does not automatically mean price will rise, and overbought does not automatically mean price will fall. Strong trends can keep RSI outside the neutral range for extended periods.

### Relative Volume

The latest volume divided by its 20-session average:

```text
Relative volume = latest volume / 20-session average volume
```

Examples:

- `1.00x` means volume is approximately average.
- `1.50x` means volume is 50% above its recent average.
- `0.70x` means volume is 30% below its recent average.

**Why it matters:** Volume can help assess participation behind a price move. A breakout on unusually high volume is often considered more meaningful than the same move on weak participation. Relative volume is contextual, not a directional signal by itself.

### ATR (14)

The 14-session Average True Range, expressed in the instrument's price currency. True range accounts for the current high-low range and gaps from the previous close.

**Why it matters:** ATR estimates typical price movement, not direction. A larger ATR indicates greater recent volatility. The Overview tab displays a two-ATR reference range around the latest close to provide risk context. This range is not a stop-loss or price target recommendation.

## Technical Indicators

### Simple Moving Averages

The project calculates arithmetic means of closing prices over three windows:

| Indicator | Window | Primary use |
|---|---:|---|
| **MA20** | 20 sessions | Short-term trend and price positioning |
| **MA50** | 50 sessions | Intermediate trend |
| **MA200** | 200 sessions | Long-term trend and market regime |

**Interpretation:**

- Price above MA20 is treated as positive short-term positioning.
- Price below MA20 is treated as negative short-term positioning.
- MA50 above MA200 indicates a positive long-term trend structure.
- MA50 below MA200 indicates a negative long-term trend structure.

Moving averages smooth noise but lag price. Crossovers usually confirm an existing move rather than predict the exact turning point.

### Relative Strength Index

RSI compares smoothed average gains with smoothed average losses over 14 sessions:

```text
Relative strength = average gain / average loss
RSI = 100 - (100 / (1 + relative strength))
```

The implementation uses Wilder-style smoothing with `alpha = 1/14`. Flat-price periods resolve to an RSI of `50`, and periods with gains but no losses resolve to `100`.

**Significance:** RSI measures the speed and persistence of recent price changes. It is most useful for identifying momentum extremes and divergences, but should be evaluated in the context of the broader trend.

### MACD

Moving Average Convergence Divergence compares two exponential moving averages:

```text
MACD = 12-session EMA - 26-session EMA
Signal line = 9-session EMA of MACD
Histogram = MACD - signal line
```

**Interpretation:**

- MACD above its signal line indicates positive momentum in the scoring model.
- MACD below its signal line indicates negative momentum.
- A growing positive histogram suggests bullish momentum is expanding.
- A falling or negative histogram suggests momentum is weakening or bearish.

**Significance:** MACD combines trend and momentum information. It can produce late signals in fast reversals and frequent false signals in sideways markets.

### Bollinger Bands

Bollinger Bands use the 20-session moving average and two rolling standard deviations:

```text
Upper band = MA20 + (2 x 20-session standard deviation)
Lower band = MA20 - (2 x 20-session standard deviation)
```

**Significance:** The bands visualize price relative to recent volatility. Narrow bands indicate lower realized volatility, while wider bands indicate higher volatility. Touching a band is not automatically a reversal signal; strong trends may travel along one band.

### Average True Range

True range is the largest of:

```text
current high - current low
absolute(current high - previous close)
absolute(current low - previous close)
```

ATR14 applies Wilder-style smoothing to true range.

**Significance:** ATR helps compare recent movement with position size, stops, and risk limits. Because ATR is measured in price units, comparing raw ATR across differently priced instruments can be misleading; an ATR percentage may be more appropriate for cross-asset comparison.

### Volume and Average Volume

`AVG_VOLUME20` is the simple 20-session mean of daily traded volume. It is used to calculate the Relative Volume metric.

**Significance:** Volume measures activity and participation. It can help confirm breakouts or identify unusually active sessions, but volume conventions differ across equities, indexes, currencies, and cryptocurrencies.

### Daily Return

The internal `RETURN` column is the percentage change in adjusted close from one session to the next.

```text
Return(t) = close(t) / close(t-1) - 1
```

**Significance:** Returns, rather than absolute price changes, allow performance to be compounded and compared across time.

## Signal Method

Each available rule contributes a signed value. The current implementation has a maximum absolute weight of six.

| Component | Bullish condition | Score | Bearish condition | Score | Weight |
|---|---|---:|---|---:|---:|
| Long-term trend | MA50 above MA200 | `+2` | MA50 below MA200 | `-2` | 2 |
| RSI momentum | RSI below 30 | `+2` | RSI above 70 | `-2` | 2 |
| MACD momentum | MACD above signal line | `+1` | MACD below signal line | `-1` | 1 |
| Short-term trend | Close above MA20 | `+1` | Close below MA20 | `-1` | 1 |

RSI between 30 and 70 contributes zero, although its weight remains available. If an indicator does not have enough data, its weight is excluded from the maximum available score.

```text
Normalized score = raw score / available maximum score
```

| Normalized score | Verdict |
|---:|---|
| At least `+0.50` | Bullish |
| Between `-0.50` and `+0.50` | Neutral |
| At most `-0.50` | Bearish |

The Signal Evidence panel lists each contribution, making the result auditable rather than opaque.

## Technical Confidence

Confidence measures **verdict clarity**, not predictive accuracy.

Two factors are used:

1. **Clarity:** How far the normalized score sits inside the displayed verdict region.
2. **Coverage:** The available indicator weight divided by the full weight of six.

```text
Coverage = available maximum score / 6
Coverage adjustment = 0.70 + (0.30 x coverage)
```

For bullish or bearish signals:

```text
Clarity = 50 + (50 x absolute normalized score)
```

For a neutral signal, confidence increases as the score approaches the center of the neutral region:

```text
Distance = minimum(absolute normalized score / 0.50, 1)
Clarity = 50 + (30 x (1 - distance))
```

Finally:

```text
Technical confidence = minimum(clarity x coverage adjustment, 100)
```

A high percentage means the current rules clearly agree on the displayed technical state. It is not calibrated from future outcomes and must not be interpreted as a win rate, expected return, or probability of price direction.

## Charts and Views

### Overview

The Overview tab combines:

- Adjusted closing price.
- Bollinger Bands for recent volatility context.
- A confidence gauge.
- Individual signal reasons.
- ATR and a two-ATR reference range.

This is intended to be the fastest decision-support view.

### Technicals

The Technicals tab contains synchronized panels with a shared date axis:

1. Candlestick price chart with MA20, MA50, and MA200.
2. Green/red volume bars based on the session direction.
3. RSI with 30 and 70 reference zones.
4. MACD, signal line, and histogram.

Hovering across the chart shows values for the same session. Legend items can be selected to hide or isolate individual series.

### Backtest

The Backtest tab compares the rule strategy with buy-and-hold and displays strategy return, benchmark return, maximum drawdown, Sharpe ratio, and entry count.

### Data

The Data tab displays the processed OHLCV and indicator columns. The table can be downloaded as CSV for independent analysis.

## Backtesting

The historical simulation applies the same normalized score to every eligible session:

| Signal | Position |
|---|---:|
| Bullish | `+1` long |
| Neutral | `0` flat |
| Bearish | `-1` short |

Positions are shifted by one session so a signal calculated from today's close is not applied to today's return. This prevents direct look-ahead bias.

### Backtest Metrics

#### Strategy Return

The compounded return of the simulated long/flat/short strategy after modeled position-change costs.

**Significance:** Shows the total historical growth or loss produced by the rules. It does not describe the path or risk taken to achieve that result.

#### Buy-and-Hold Return

The compounded return from continuously holding the instrument over the same downloaded history.

**Significance:** Provides a basic benchmark. A strategy that takes additional complexity or short exposure should be evaluated against a passive alternative.

#### Maximum Drawdown

The largest percentage decline in strategy equity from a previous peak:

```text
Drawdown = current equity / running peak equity - 1
```

**Significance:** Approximates the worst historical peak-to-trough loss. Smaller drawdowns are generally easier to tolerate, but the future can be worse than the historical sample.

#### Annualized Volatility

The engine calculates the standard deviation of daily strategy returns multiplied by the square root of 252.

```text
Annualized volatility = daily return standard deviation x sqrt(252)
```

**Significance:** Estimates how variable returns were on an annualized basis. It measures dispersion, not only downside risk.

#### Sharpe Ratio

```text
Sharpe ratio = mean daily strategy return / daily return standard deviation x sqrt(252)
```

The implementation currently assumes a zero risk-free rate.

**Significance:** Relates return to total volatility. Higher values indicate more return per unit of historical variability, but the metric can be unstable in small samples and assumes return characteristics that may not persist.

#### Entries

The number of times the simulation enters a non-zero long or short position after a position change.

**Significance:** Indicates strategy activity. More entries may increase exposure to trading costs, slippage, taxes, and execution constraints.

### Backtest Assumptions

- Daily adjusted close data is used.
- A signal is executed from the next session, avoiding direct same-bar look-ahead.
- Bullish, neutral, and bearish states map to long, flat, and short positions.
- Position changes cost 10 basis points by default.
- Returns are compounded.
- The model does not include taxes, dividends as separate cash flows, bid/ask spread, detailed slippage, market impact, short-borrow cost, short availability, liquidity limits, or partial fills.
- The simulation is not a substitute for walk-forward validation, out-of-sample testing, or paper trading.

## Data Processing

### Source

Market history and instrument metadata are retrieved through the `yfinance` package. Prices are requested with `auto_adjust=True`, so OHLC values reflect Yahoo Finance adjustment data.

Yahoo Finance is convenient for research but is not an exchange-certified or execution-grade market feed.

### Warm-Up History

Indicators need observations before they become valid. The application therefore downloads more data than it displays:

- One month through one year views fetch two years of history.
- Two-year and five-year views fetch ten years of history.

Indicators and backtests use the downloaded dataset, while charts and exported visible data are trimmed to the selected range.

### Validation and Safety

- Symbols are trimmed and converted to uppercase.
- Only common market-symbol characters are accepted.
- OHLCV columns are validated.
- Values are converted to numeric data.
- Duplicate dates are removed.
- Results are sorted chronologically.
- At least 50 daily observations are required.
- Data older than four calendar days is marked as potentially stale. This allows for normal weekends while warning about longer gaps.

## Architecture

```text
.
|-- app.py                  # Streamlit layout, controls, caching, and view composition
|-- src/
|   |-- __init__.py
|   |-- charts.py           # Plotly figures and shared chart styling
|   |-- data.py             # Symbol validation, data retrieval, metadata, and slicing
|   |-- indicators.py       # Trend, momentum, volatility, volume, and return calculations
|   |-- models.py           # Immutable result data classes
|   `-- strategy.py         # Signal evaluation, confidence, score series, and backtest
|-- tests/
|   |-- test_data.py        # Symbol validation tests
|   |-- test_indicators.py  # Indicator correctness and edge cases
|   `-- test_strategy.py    # Signal, confidence, and backtest tests
|-- .streamlit/config.toml  # Theme and Streamlit server configuration
|-- requirements.txt        # Runtime dependencies
|-- requirements-dev.txt    # Runtime, test, and lint dependencies
|-- pyproject.toml          # Ruff and pytest settings
`-- README.md
```

The separation keeps market access, calculations, decisions, charts, and UI composition independently understandable and testable.

## Installation

Python 3.10 or newer is recommended.

### 1. Clone and enter the repository

```bash
git clone <repository-url>
cd Ai-Trading-Agent-3.0
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Activate it on macOS or Linux:

```bash
source .venv/bin/activate
```

### 3. Install runtime dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Run the dashboard

```bash
python -m streamlit run app.py
```

Open `http://localhost:8501` if Streamlit does not open it automatically.

## Testing and Code Quality

Install development dependencies:

```bash
python -m pip install -r requirements-dev.txt
```

Run the test suite:

```bash
python -m pytest
```

Run static checks:

```bash
python -m ruff check .
```

Apply formatting:

```bash
python -m ruff format .
```

The automated tests cover:

- Symbol normalization and invalid input.
- Indicator behavior on trending and flat data.
- Input-frame immutability.
- Bullish and neutral signal evaluation.
- Confidence bounds and labels.
- Backtest output shape and metric integrity.

## Deployment

### Streamlit Community Cloud

1. Push the repository to GitHub.
2. Create a new Streamlit Community Cloud application.
3. Select the repository and branch.
4. Set `app.py` as the entry point.
5. Select a supported Python version and deploy.

The default Yahoo Finance integration does not require application secrets. Network access to the provider is required.

## Limitations

- Technical indicators summarize historical market behavior and may lag rapid changes.
- The weighted rules were not trained, optimized, or validated for a specific instrument or regime.
- Confidence represents internal rule clarity, not forecast accuracy.
- Results may be sensitive to the selected provider, adjusted-price history, missing data, and corporate-action corrections.
- Yahoo Finance availability and response formats may change.
- Daily data cannot model intraday execution or gaps with full realism.
- Short positions may be impossible or expensive to execute in practice.
- Historical results are exposed to selection bias, market-regime bias, and overinterpretation.

Use the dashboard to support research, compare evidence, and learn how indicators interact. Do not use it as the sole basis for a financial decision.

## License

No license file is currently included. Add an explicit license before redistributing or accepting external contributions.
