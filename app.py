import io

import pandas as pd
import streamlit as st

from src.charts import confidence_gauge, equity_chart, risk_chart, technical_chart
from src.data import (
    DISPLAY_PERIODS,
    MarketDataError,
    display_slice,
    download_history,
    get_instrument_info,
    is_stale,
    normalize_symbol,
)
from src.indicators import add_indicators
from src.strategy import evaluate_signal, run_backtest

st.set_page_config(
    page_title="Market Signal Lab",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
    :root { color-scheme: dark; }
    .stApp {
        background:
            linear-gradient(180deg, rgba(45, 212, 191, 0.035) 0, transparent 240px),
            #090d12;
    }
    .block-container { max-width: 1480px; padding-top: 1.1rem; padding-bottom: 3rem; }
    h1, h2, h3 { letter-spacing: 0; }
    h1 { font-size: 1.75rem !important; }
    h2 { font-size: 1.2rem !important; }
    .terminal-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 0.9rem;
    }
    .brand-mark {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        color: #07110f;
        background: #2dd4bf;
        border-radius: 6px;
        font-size: 19px;
        font-weight: 800;
    }
    .brand-name { color: #f8fafc; font-size: 1.15rem; font-weight: 700; line-height: 1.1; }
    .brand-subtitle { color: #8491a3; font-size: 0.78rem; margin-top: 3px; }
    .market-status {
        margin-left: auto;
        color: #9aa7b7;
        font-size: 0.75rem;
        text-transform: uppercase;
    }
    .market-status::before {
        content: "";
        display: inline-block;
        width: 7px;
        height: 7px;
        margin-right: 7px;
        border-radius: 50%;
        background: #2dd4bf;
        box-shadow: 0 0 10px rgba(45, 212, 191, 0.65);
    }
    [data-testid="stMetric"] {
        background: #101720;
        border: 1px solid #222e3d;
        border-top: 2px solid #334155;
        padding: 0.75rem 0.9rem;
        border-radius: 6px;
        min-height: 102px;
    }
    [data-testid="stMetricLabel"] { color: #9aa7b7; }
    [data-testid="stMetricValue"] { font-size: 1.45rem; }
    [data-testid="stVerticalBlockBorderWrapper"] {
        border-color: #243142;
        border-radius: 6px;
        background: rgba(15, 22, 30, 0.92);
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 0.25rem;
        padding: 0.25rem;
        background: #101720;
        border: 1px solid #222e3d;
        border-radius: 6px;
    }
    .stTabs [data-baseweb="tab"] {
        min-width: 120px;
        padding: 0.55rem 1rem;
        border-radius: 4px;
    }
    .stTabs [aria-selected="true"] { background: #1a2632; }
    .stButton button, .stDownloadButton button {
        min-height: 40px;
        border-radius: 5px;
        font-weight: 600;
    }
    div[data-testid="stPlotlyChart"] { border-radius: 6px; overflow: hidden; }
    .section-kicker {
        color: #2dd4bf;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 0.2rem;
    }
    .decision-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        margin: 0.9rem 0 1rem;
        padding: 1.05rem 1.2rem;
        border: 1px solid #263547;
        border-left-width: 4px;
        border-radius: 6px;
        background: #101720;
    }
    .decision-buy { border-left-color: #2dd4bf; }
    .decision-hold { border-left-color: #fbbf24; }
    .decision-sell { border-left-color: #fb7185; }
    .decision-label {
        color: #8491a3;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
    }
    .decision-value {
        margin-top: 0.15rem;
        color: #f8fafc;
        font-size: 2rem;
        font-weight: 800;
        line-height: 1;
    }
    .decision-buy .decision-value { color: #2dd4bf; }
    .decision-hold .decision-value { color: #fbbf24; }
    .decision-sell .decision-value { color: #fb7185; }
    .decision-summary { color: #9aa7b7; font-size: 0.82rem; margin-top: 0.45rem; }
    .confidence-block { min-width: 150px; text-align: right; }
    .confidence-value { color: #f8fafc; font-size: 1.65rem; font-weight: 750; }
    .confidence-caption { color: #8491a3; font-size: 0.72rem; }
    @media (max-width: 700px) {
        .block-container { padding-left: 0.75rem; padding-right: 0.75rem; }
        h1 { font-size: 1.45rem !important; }
        [data-testid="stMetric"] { min-height: 96px; }
        .market-status { display: none; }
        .stTabs [data-baseweb="tab"] { min-width: auto; padding: 0.5rem 0.7rem; }
        .decision-banner { align-items: flex-start; gap: 1rem; padding: 0.9rem; }
        .decision-value { font-size: 1.65rem; }
        .confidence-block { min-width: auto; }
        .confidence-value { font-size: 1.35rem; }
        [data-testid="stHorizontalBlock"] { gap: 0.55rem; }
    }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data(ttl=900, show_spinner=False)
def cached_history(symbol: str, period: str) -> pd.DataFrame:
    return download_history(symbol, period)


@st.cache_data(ttl=3600, show_spinner=False)
def cached_instrument_info(symbol: str):
    return get_instrument_info(symbol)


def money(value: float, currency: str) -> str:
    symbols = {"USD": "$", "INR": "₹", "GBP": "£", "EUR": "€", "JPY": "¥"}
    prefix = symbols.get(currency, f"{currency} ")
    return f"{prefix}{value:,.2f}"


def percent(value: float) -> str:
    return f"{value:+.2%}"


def csv_bytes(frame: pd.DataFrame) -> bytes:
    buffer = io.StringIO()
    frame.to_csv(buffer, index_label="Date")
    return buffer.getvalue().encode("utf-8")


st.markdown(
    """
    <div class="terminal-brand">
        <div class="brand-mark">M</div>
        <div>
            <div class="brand-name">Market Signal Lab</div>
            <div class="brand-subtitle">Technical intelligence workspace</div>
        </div>
        <div class="market-status">Data connection active</div>
    </div>
    """,
    unsafe_allow_html=True,
)

with st.container(border=True):
    symbol_col, period_col, refresh_col = st.columns([1.7, 1.2, 0.65], vertical_alignment="bottom")
    with symbol_col:
        raw_symbol = st.text_input("Symbol", value="AAPL", placeholder="AAPL or RELIANCE.NS")
    with period_col:
        period_label = st.selectbox("Chart range", list(DISPLAY_PERIODS), index=3)
    with refresh_col:
        refresh = st.button("Refresh", width="stretch", help="Fetch fresh market data")

if refresh:
    st.cache_data.clear()

try:
    symbol = normalize_symbol(raw_symbol)
except ValueError as exc:
    st.error(str(exc))
    st.stop()

period = DISPLAY_PERIODS[period_label]
try:
    with st.spinner(f"Loading {symbol} market data..."):
        history = cached_history(symbol, period)
        info = cached_instrument_info(symbol)
except (MarketDataError, ValueError) as exc:
    st.error(str(exc))
    st.info("Check the symbol and your network connection, then try again.")
    st.stop()

analysis = add_indicators(history)
display_data = display_slice(analysis, period)
latest = analysis.iloc[-1]
previous = analysis.iloc[-2]
signal = evaluate_signal(latest)
backtest = run_backtest(analysis)

identity, timestamp = st.columns([3, 2])
with identity:
    st.subheader(f"{info.name} · {info.symbol}")
    identity_parts = [part for part in (info.exchange, info.quote_type, info.currency) if part]
    st.caption(" · ".join(identity_parts))
with timestamp:
    last_session = pd.Timestamp(analysis.index[-1]).strftime("%d %b %Y")
    stale_label = " · Data may be stale" if is_stale(analysis) else ""
    st.caption(f"Latest available adjusted data · Session {last_session}{stale_label}")

price_change = latest["Close"] / previous["Close"] - 1
avg_volume = latest.get("AVG_VOLUME20")
relative_volume = latest["Volume"] / avg_volume if pd.notna(avg_volume) and avg_volume else float("nan")
recommendation_class = signal.verdict.lower()
recommendation_summary = {
    "BUY": "The weighted technical setup currently favors upward exposure.",
    "HOLD": "The weighted indicators are mixed; waiting may offer a clearer setup.",
    "SELL": "The weighted technical setup currently favors reducing or avoiding exposure.",
}[signal.verdict]
st.markdown(
    f"""
    <div class="decision-banner decision-{recommendation_class}">
        <div>
            <div class="decision-label">Current model recommendation</div>
            <div class="decision-value">{signal.verdict}</div>
            <div class="decision-summary">{recommendation_summary}</div>
        </div>
        <div class="confidence-block">
            <div class="decision-label">Technical confidence</div>
            <div class="confidence-value">{signal.confidence:.0f}%</div>
            <div class="confidence-caption">{signal.confidence_label} rule agreement</div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

metric_columns = st.columns(6)
metric_columns[0].metric("Last close", money(latest["Close"], info.currency), percent(price_change))
metric_columns[1].metric("Session move", percent(price_change))
metric_columns[2].metric("RSI (14)", f"{latest['RSI']:.1f}")
metric_columns[3].metric("MACD", f"{latest['MACD']:.2f}")
metric_columns[4].metric("Relative volume", f"{relative_volume:.2f}×" if pd.notna(relative_volume) else "N/A")
metric_columns[5].metric(
    "ATR (14)", money(latest["ATR14"], info.currency) if pd.notna(latest.get("ATR14")) else "N/A"
)

overview_tab, technical_tab, backtest_tab, data_tab = st.tabs(
    ["Summary", "Price & Technicals", "Strategy Test", "Market Data"]
)

with overview_tab:
    st.markdown('<div class="section-kicker">Market overview</div>', unsafe_allow_html=True)
    chart_col, signal_col = st.columns([2.7, 1], vertical_alignment="top")
    with chart_col:
        st.plotly_chart(risk_chart(display_data), width="stretch", config={"displaylogo": False})
    with signal_col:
        with st.container(border=True):
            st.subheader("Technical confidence")
            st.plotly_chart(
                confidence_gauge(signal.confidence, signal.verdict),
                width="stretch",
                config={"displayModeBar": False},
            )
            st.markdown(f"**{signal.confidence_label} confidence · {signal.verdict}**")
            st.caption(
                "Measures rule agreement and data coverage. It is not the probability of a profitable trade."
            )

        with st.container(border=True):
            st.subheader("Signal evidence")
            if signal.verdict == "BUY":
                st.success("Technical rules favor BUY")
            elif signal.verdict == "SELL":
                st.error("Technical rules favor SELL")
            else:
                st.warning("Technical rules favor HOLD")
            for reason in signal.reasons:
                st.write(reason)
            for caution in signal.cautions:
                st.caption(caution)

        atr = latest.get("ATR14")
        with st.container(border=True):
            st.subheader("Risk reference")
            if pd.notna(atr):
                st.metric("ATR (14)", money(atr, info.currency))
                st.caption(
                    f"Two-ATR range: {money(latest['Close'] - 2 * atr, info.currency)} to "
                    f"{money(latest['Close'] + 2 * atr, info.currency)}"
                )
            else:
                st.write("Not enough history to calculate ATR.")

with technical_tab:
    st.markdown('<div class="section-kicker">Deep chart</div>', unsafe_allow_html=True)
    st.plotly_chart(
        technical_chart(display_data, info.currency),
        width="stretch",
        config={"displaylogo": False, "scrollZoom": True},
    )
    st.caption("Hover across panels for synchronized values. Double-click a legend item to isolate it.")

with backtest_tab:
    st.markdown('<div class="section-kicker">Strategy research</div>', unsafe_allow_html=True)
    st.subheader("Historical rule simulation")
    st.caption(
        "Signals execute on the next daily close and include 10 basis points of cost per position change."
    )
    backtest_metrics = st.columns(5)
    backtest_metrics[0].metric("Strategy return", percent(backtest.strategy_return))
    backtest_metrics[1].metric("Buy & hold", percent(backtest.benchmark_return))
    backtest_metrics[2].metric("Maximum drawdown", percent(backtest.max_drawdown))
    backtest_metrics[3].metric("Sharpe ratio", f"{backtest.sharpe_ratio:.2f}")
    backtest_metrics[4].metric("Entries", f"{backtest.trades}")
    st.plotly_chart(equity_chart(backtest.equity), width="stretch", config={"displaylogo": False})
    st.info(
        "This simplified backtest is for research only. It does not model taxes, spread, slippage, "
        "dividends, "
        "borrow availability, or market impact. Historical performance does not predict future results."
    )

with data_tab:
    st.markdown('<div class="section-kicker">Raw analysis</div>', unsafe_allow_html=True)
    data_columns = [
        "Open",
        "High",
        "Low",
        "Close",
        "Volume",
        "MA20",
        "MA50",
        "MA200",
        "RSI",
        "MACD",
        "MACD_SIGNAL",
        "ATR14",
    ]
    table = display_data.loc[:, data_columns].sort_index(ascending=False)
    st.dataframe(table, width="stretch", height=500)
    st.download_button(
        "Download CSV",
        data=csv_bytes(table.sort_index()),
        file_name=f"{symbol}_{period}_analysis.csv",
        mime="text/csv",
    )

st.divider()
st.caption(
    "For research and educational use only. BUY, HOLD, and SELL are outputs from a rule-based technical "
    "model, not personalized financial advice. Yahoo Finance data may be delayed."
)
