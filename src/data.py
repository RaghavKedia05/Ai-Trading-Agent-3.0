import re
from datetime import timedelta

import pandas as pd
import yfinance as yf

from .models import InstrumentInfo

SYMBOL_PATTERN = re.compile(r"^[A-Z0-9.^=-]{1,20}$")
DISPLAY_PERIODS = {
    "1 Month": "1mo",
    "3 Months": "3mo",
    "6 Months": "6mo",
    "1 Year": "1y",
    "2 Years": "2y",
    "5 Years": "5y",
}
PERIOD_OFFSETS = {
    "1mo": pd.DateOffset(months=1),
    "3mo": pd.DateOffset(months=3),
    "6mo": pd.DateOffset(months=6),
    "1y": pd.DateOffset(years=1),
    "2y": pd.DateOffset(years=2),
    "5y": pd.DateOffset(years=5),
}


class MarketDataError(RuntimeError):
    """Raised when market data cannot be retrieved or validated."""


def normalize_symbol(value: str) -> str:
    symbol = value.strip().upper()
    if not symbol:
        raise ValueError("Enter a stock or ETF symbol.")
    if not SYMBOL_PATTERN.fullmatch(symbol):
        raise ValueError("Use a valid symbol such as AAPL, RELIANCE.NS, or BRK-B.")
    return symbol


def _flatten_columns(frame: pd.DataFrame) -> pd.DataFrame:
    if not isinstance(frame.columns, pd.MultiIndex):
        return frame

    price_fields = {"Open", "High", "Low", "Close", "Adj Close", "Volume"}
    first_level = set(frame.columns.get_level_values(0))
    field_level = 0 if first_level & price_fields else 1
    result = frame.copy()
    result.columns = result.columns.get_level_values(field_level)
    return result


def download_history(symbol: str, display_period: str) -> pd.DataFrame:
    if display_period not in PERIOD_OFFSETS:
        raise ValueError(f"Unsupported period: {display_period}")

    # Always fetch indicator warm-up history, then trim only for presentation.
    fetch_period = "2y" if display_period in {"1mo", "3mo", "6mo", "1y"} else "10y"
    try:
        frame = yf.download(
            symbol,
            period=fetch_period,
            interval="1d",
            auto_adjust=True,
            progress=False,
            threads=False,
        )
    except Exception as exc:
        raise MarketDataError(f"Market data request failed: {exc}") from exc

    frame = _flatten_columns(frame)
    required = {"Open", "High", "Low", "Close", "Volume"}
    missing = required.difference(frame.columns)
    if frame.empty:
        raise MarketDataError(f"No price history was returned for {symbol}.")
    if missing:
        raise MarketDataError(f"The data provider omitted: {', '.join(sorted(missing))}.")

    result = frame.loc[:, ["Open", "High", "Low", "Close", "Volume"]].copy()
    result = result.apply(pd.to_numeric, errors="coerce").dropna(subset=["Close"])
    result = result[~result.index.duplicated(keep="last")].sort_index()
    if len(result) < 50:
        raise MarketDataError("At least 50 daily observations are required for analysis.")
    return result


def display_slice(frame: pd.DataFrame, period: str) -> pd.DataFrame:
    cutoff = frame.index.max() - PERIOD_OFFSETS[period]
    return frame.loc[frame.index >= cutoff].copy()


def get_instrument_info(symbol: str) -> InstrumentInfo:
    defaults = InstrumentInfo(symbol, symbol, "", "USD", "Equity")
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.get_info()
        return InstrumentInfo(
            symbol=symbol,
            name=info.get("shortName") or info.get("longName") or symbol,
            exchange=info.get("exchange") or info.get("fullExchangeName") or "",
            currency=info.get("currency") or defaults.currency,
            quote_type=(info.get("quoteType") or defaults.quote_type).title(),
        )
    except Exception:
        return defaults


def is_stale(frame: pd.DataFrame) -> bool:
    last_date = pd.Timestamp(frame.index.max()).tz_localize(None).date()
    return last_date < (pd.Timestamp.now().date() - timedelta(days=4))
