import unittest

from src.data import normalize_symbol


class NormalizeSymbolTests(unittest.TestCase):
    def test_normalizes_exchange_symbol(self):
        self.assertEqual(normalize_symbol(" reliance.ns "), "RELIANCE.NS")

    def test_accepts_common_symbol_characters(self):
        for symbol in ("AAPL", "BRK-B", "^GSPC", "BTC-USD"):
            with self.subTest(symbol=symbol):
                self.assertEqual(normalize_symbol(symbol), symbol)

    def test_rejects_empty_or_unsafe_input(self):
        for symbol in ("", "AAPL; rm", "AAPL/USD", "A" * 21):
            with self.subTest(symbol=symbol):
                with self.assertRaises(ValueError):
                    normalize_symbol(symbol)


if __name__ == "__main__":
    unittest.main()
