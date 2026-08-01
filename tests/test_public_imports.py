import unittest


class PublicImportTests(unittest.TestCase):
    def test_application_dependencies_are_exported(self):
        from src.charts import confidence_gauge, equity_chart, risk_chart, technical_chart
        from src.data import download_history, normalize_symbol
        from src.indicators import add_indicators
        from src.strategy import evaluate_signal, run_backtest

        exports = (
            confidence_gauge,
            equity_chart,
            risk_chart,
            technical_chart,
            download_history,
            normalize_symbol,
            add_indicators,
            evaluate_signal,
            run_backtest,
        )
        self.assertTrue(all(callable(item) for item in exports))


if __name__ == "__main__":
    unittest.main()
