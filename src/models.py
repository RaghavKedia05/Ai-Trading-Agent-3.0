from dataclasses import dataclass

import pandas as pd


@dataclass(frozen=True)
class InstrumentInfo:
    symbol: str
    name: str
    exchange: str
    currency: str
    quote_type: str


@dataclass(frozen=True)
class SignalResult:
    verdict: str
    score: int
    max_score: int
    strength: float
    confidence: float
    confidence_label: str
    reasons: tuple[str, ...]
    cautions: tuple[str, ...]


@dataclass(frozen=True)
class BacktestResult:
    equity: pd.DataFrame
    strategy_return: float
    benchmark_return: float
    max_drawdown: float
    annualized_volatility: float
    sharpe_ratio: float
    trades: int
