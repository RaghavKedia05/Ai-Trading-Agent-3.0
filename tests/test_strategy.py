import unittest

import numpy as np
import pandas as pd

from src.indicators import add_indicators
from src.strategy import evaluate_signal, run_backtest


class StrategyTests(unittest.TestCase):
    def test_bullish_signal_is_explainable(self):
        row = pd.Series(
            {
                "Close": 110.0,
                "MA20": 105.0,
                "MA50": 100.0,
                "MA200": 90.0,
                "RSI": 25.0,
                "MACD": 2.0,
                "MACD_SIGNAL": 1.0,
            }
        )
        signal = evaluate_signal(row)
        self.assertEqual(signal.verdict, "BULLISH")
        self.assertEqual(signal.score, 6)
        self.assertEqual(signal.max_score, 6)
        self.assertEqual(signal.strength, 100.0)
        self.assertEqual(signal.confidence, 100.0)
        self.assertEqual(signal.confidence_label, "High")
        self.assertTrue(signal.reasons)

    def test_neutral_signal_has_bounded_confidence(self):
        row = pd.Series(
            {
                "Close": 100.0,
                "MA20": 105.0,
                "MA50": 100.0,
                "MA200": 90.0,
                "RSI": 50.0,
                "MACD": 0.5,
                "MACD_SIGNAL": 1.0,
            }
        )
        signal = evaluate_signal(row)
        self.assertEqual(signal.verdict, "NEUTRAL")
        self.assertGreaterEqual(signal.confidence, 0)
        self.assertLessEqual(signal.confidence, 100)

    def test_backtest_outputs_finite_metrics(self):
        close = 100 + np.sin(np.arange(320) / 10) * 8 + np.arange(320) * 0.08
        index = pd.date_range("2023-01-02", periods=len(close), freq="B")
        frame = pd.DataFrame(
            {
                "Open": close - 0.2,
                "High": close + 1,
                "Low": close - 1,
                "Close": close,
                "Volume": np.full(len(close), 500_000),
            },
            index=index,
        )
        result = run_backtest(add_indicators(frame))
        self.assertEqual(len(result.equity), len(frame))
        self.assertTrue(np.isfinite(result.strategy_return))
        self.assertLessEqual(result.max_drawdown, 0)
        self.assertGreaterEqual(result.trades, 0)


if __name__ == "__main__":
    unittest.main()
