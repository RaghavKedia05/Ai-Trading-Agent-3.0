import math

import numpy as np
import pandas as pd

from .models import BacktestResult, SignalResult


def _available(value: object) -> bool:
    return value is not None and not pd.isna(value)


def _confidence(verdict: str, normalized_score: float, coverage: float) -> tuple[float, str]:
    """Estimate verdict clarity from rule agreement and indicator availability."""
    if verdict == "HOLD":
        distance_from_boundary = min(abs(normalized_score) / 0.5, 1.0)
        clarity = 50 + (30 * (1 - distance_from_boundary))
    else:
        clarity = 50 + (50 * abs(normalized_score))

    confidence = clarity * (0.7 + (0.3 * coverage))
    if confidence >= 80:
        label = "High"
    elif confidence >= 60:
        label = "Moderate"
    else:
        label = "Low"
    return min(confidence, 100.0), label


def evaluate_signal(row: pd.Series) -> SignalResult:
    score = 0
    max_score = 0
    reasons: list[str] = []
    cautions: list[str] = []

    if _available(row.get("MA50")) and _available(row.get("MA200")):
        max_score += 2
        if row["MA50"] > row["MA200"]:
            score += 2
            reasons.append("The 50-day average is above the 200-day trend (+2).")
        else:
            score -= 2
            reasons.append("The 50-day average is below the 200-day trend (-2).")
    else:
        cautions.append("The 200-day trend is not available yet.")

    if _available(row.get("RSI")):
        max_score += 2
        if row["RSI"] < 30:
            score += 2
            reasons.append(f"RSI is oversold at {row['RSI']:.1f} (+2).")
        elif row["RSI"] > 70:
            score -= 2
            reasons.append(f"RSI is overbought at {row['RSI']:.1f} (-2).")
        else:
            reasons.append(f"RSI is neutral at {row['RSI']:.1f} (0).")

    if _available(row.get("MACD")) and _available(row.get("MACD_SIGNAL")):
        max_score += 1
        if row["MACD"] > row["MACD_SIGNAL"]:
            score += 1
            reasons.append("MACD is above its signal line (+1).")
        else:
            score -= 1
            reasons.append("MACD is below its signal line (-1).")

    if _available(row.get("MA20")):
        max_score += 1
        if row["Close"] > row["MA20"]:
            score += 1
            reasons.append("Price is above its 20-day average (+1).")
        else:
            score -= 1
            reasons.append("Price is below its 20-day average (-1).")

    normalized = score / max_score if max_score else 0.0
    if normalized >= 0.5:
        verdict = "BUY"
    elif normalized <= -0.5:
        verdict = "SELL"
    else:
        verdict = "HOLD"

    confidence, confidence_label = _confidence(verdict, normalized, max_score / 6)

    return SignalResult(
        verdict=verdict,
        score=score,
        max_score=max_score,
        strength=abs(normalized) * 100,
        confidence=confidence,
        confidence_label=confidence_label,
        reasons=tuple(reasons),
        cautions=tuple(cautions),
    )


def signal_scores(frame: pd.DataFrame) -> pd.Series:
    score = pd.Series(0.0, index=frame.index)
    weight = pd.Series(0.0, index=frame.index)

    trend_ready = frame["MA50"].notna() & frame["MA200"].notna()
    score = score.add(np.where(trend_ready, np.where(frame["MA50"] > frame["MA200"], 2, -2), 0))
    weight = weight.add(np.where(trend_ready, 2, 0))

    rsi_ready = frame["RSI"].notna()
    rsi_score = np.select([frame["RSI"] < 30, frame["RSI"] > 70], [2, -2], default=0)
    score = score.add(np.where(rsi_ready, rsi_score, 0))
    weight = weight.add(np.where(rsi_ready, 2, 0))

    macd_ready = frame["MACD"].notna() & frame["MACD_SIGNAL"].notna()
    score = score.add(np.where(macd_ready, np.where(frame["MACD"] > frame["MACD_SIGNAL"], 1, -1), 0))
    weight = weight.add(np.where(macd_ready, 1, 0))

    ma20_ready = frame["MA20"].notna()
    score = score.add(np.where(ma20_ready, np.where(frame["Close"] > frame["MA20"], 1, -1), 0))
    weight = weight.add(np.where(ma20_ready, 1, 0))
    return score.div(weight.replace(0, np.nan)).fillna(0.0)


def run_backtest(frame: pd.DataFrame, trading_cost_bps: float = 10.0) -> BacktestResult:
    normalized_score = signal_scores(frame)
    desired_position = pd.Series(
        np.select([normalized_score >= 0.5, normalized_score <= -0.5], [1.0, -1.0], default=0.0),
        index=frame.index,
    )
    position = desired_position.shift(1).fillna(0.0)
    returns = frame["Close"].pct_change(fill_method=None).fillna(0.0)
    turnover = position.diff().abs().fillna(position.abs())
    cost = turnover * (trading_cost_bps / 10_000)
    strategy_returns = (position * returns) - cost

    equity = pd.DataFrame(
        {
            "Strategy": (1 + strategy_returns).cumprod(),
            "Buy & Hold": (1 + returns).cumprod(),
            "Position": position,
        },
        index=frame.index,
    )
    drawdown = equity["Strategy"] / equity["Strategy"].cummax() - 1
    volatility = strategy_returns.std() * math.sqrt(252)
    sharpe = 0.0
    if strategy_returns.std() > 0:
        sharpe = strategy_returns.mean() / strategy_returns.std() * math.sqrt(252)

    entries = ((position != position.shift(1)) & (position != 0)).sum()
    return BacktestResult(
        equity=equity,
        strategy_return=float(equity["Strategy"].iloc[-1] - 1),
        benchmark_return=float(equity["Buy & Hold"].iloc[-1] - 1),
        max_drawdown=float(drawdown.min()),
        annualized_volatility=float(volatility),
        sharpe_ratio=float(sharpe),
        trades=int(entries),
    )
