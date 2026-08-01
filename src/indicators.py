import numpy as np
import pandas as pd


def add_indicators(frame: pd.DataFrame) -> pd.DataFrame:
    """Return a copy with conventional trend, momentum, and risk indicators."""
    data = frame.copy()
    close = data["Close"]

    data["MA20"] = close.rolling(20, min_periods=20).mean()
    data["MA50"] = close.rolling(50, min_periods=50).mean()
    data["MA200"] = close.rolling(200, min_periods=200).mean()

    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    average_gain = gain.ewm(alpha=1 / 14, adjust=False, min_periods=14).mean()
    average_loss = loss.ewm(alpha=1 / 14, adjust=False, min_periods=14).mean()
    relative_strength = average_gain / average_loss.replace(0, np.nan)
    data["RSI"] = 100 - (100 / (1 + relative_strength))
    data.loc[(average_loss == 0) & (average_gain > 0), "RSI"] = 100.0
    data.loc[(average_loss == 0) & (average_gain == 0), "RSI"] = 50.0

    ema12 = close.ewm(span=12, adjust=False, min_periods=12).mean()
    ema26 = close.ewm(span=26, adjust=False, min_periods=26).mean()
    data["MACD"] = ema12 - ema26
    data["MACD_SIGNAL"] = data["MACD"].ewm(span=9, adjust=False, min_periods=9).mean()
    data["MACD_HIST"] = data["MACD"] - data["MACD_SIGNAL"]

    rolling_std = close.rolling(20, min_periods=20).std()
    data["BB_UPPER"] = data["MA20"] + (2 * rolling_std)
    data["BB_LOWER"] = data["MA20"] - (2 * rolling_std)

    previous_close = close.shift(1)
    true_range = pd.concat(
        [
            data["High"] - data["Low"],
            (data["High"] - previous_close).abs(),
            (data["Low"] - previous_close).abs(),
        ],
        axis=1,
    ).max(axis=1)
    data["ATR14"] = true_range.ewm(alpha=1 / 14, adjust=False, min_periods=14).mean()
    data["AVG_VOLUME20"] = data["Volume"].rolling(20, min_periods=20).mean()
    data["RETURN"] = close.pct_change(fill_method=None)
    return data
