import unittest

import numpy as np
import pandas as pd

from src.indicators import add_indicators


def price_frame(close: np.ndarray) -> pd.DataFrame:
    index = pd.date_range("2024-01-01", periods=len(close), freq="B")
    return pd.DataFrame(
        {
            "Open": close - 0.25,
            "High": close + 1,
            "Low": close - 1,
            "Close": close,
            "Volume": np.full(len(close), 1_000_000),
        },
        index=index,
    )


class IndicatorTests(unittest.TestCase):
    def test_does_not_mutate_input(self):
        frame = price_frame(np.linspace(100, 200, 220))
        add_indicators(frame)
        self.assertNotIn("RSI", frame.columns)

    def test_trending_series_has_expected_indicators(self):
        result = add_indicators(price_frame(np.linspace(100, 200, 220)))
        latest = result.iloc[-1]
        self.assertAlmostEqual(latest["RSI"], 100.0)
        self.assertGreater(latest["MACD"], latest["MACD_SIGNAL"])
        self.assertFalse(pd.isna(latest["MA200"]))
        self.assertGreater(latest["ATR14"], 0)

    def test_flat_series_has_neutral_rsi(self):
        result = add_indicators(price_frame(np.full(60, 100.0)))
        self.assertAlmostEqual(result.iloc[-1]["RSI"], 50.0)


if __name__ == "__main__":
    unittest.main()
