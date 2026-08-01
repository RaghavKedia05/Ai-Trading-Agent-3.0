import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

COLORS = {
    "text": "#d7dde7",
    "grid": "rgba(148, 163, 184, 0.12)",
    "up": "#2dd4bf",
    "down": "#fb7185",
    "ma20": "#fbbf24",
    "ma50": "#60a5fa",
    "ma200": "#c084fc",
    "macd": "#38bdf8",
    "signal": "#f59e0b",
}


def _base_layout(fig: go.Figure, height: int) -> go.Figure:
    fig.update_layout(
        template="plotly_dark",
        height=height,
        margin=dict(l=16, r=16, t=36, b=16),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color=COLORS["text"]),
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.01, x=0),
    )
    fig.update_xaxes(
        gridcolor=COLORS["grid"], rangeslider_visible=False, rangebreaks=[dict(bounds=["sat", "mon"])]
    )
    fig.update_yaxes(gridcolor=COLORS["grid"], fixedrange=False)
    return fig


def technical_chart(data: pd.DataFrame, currency: str) -> go.Figure:
    fig = make_subplots(
        rows=4,
        cols=1,
        shared_xaxes=True,
        vertical_spacing=0.035,
        row_heights=[0.55, 0.14, 0.14, 0.17],
        subplot_titles=("Price", "Volume", "RSI (14)", "MACD"),
    )
    fig.add_trace(
        go.Candlestick(
            x=data.index,
            open=data["Open"],
            high=data["High"],
            low=data["Low"],
            close=data["Close"],
            name="Price",
            increasing_line_color=COLORS["up"],
            decreasing_line_color=COLORS["down"],
        ),
        row=1,
        col=1,
    )
    for column, label, color in (
        ("MA20", "MA 20", COLORS["ma20"]),
        ("MA50", "MA 50", COLORS["ma50"]),
        ("MA200", "MA 200", COLORS["ma200"]),
    ):
        fig.add_trace(
            go.Scatter(x=data.index, y=data[column], name=label, line=dict(color=color, width=1.4)),
            row=1,
            col=1,
        )

    volume_colors = [
        COLORS["up"] if close >= open_ else COLORS["down"]
        for open_, close in zip(data["Open"], data["Close"], strict=True)
    ]
    fig.add_trace(
        go.Bar(x=data.index, y=data["Volume"], name="Volume", marker_color=volume_colors), row=2, col=1
    )

    fig.add_trace(
        go.Scatter(x=data.index, y=data["RSI"], name="RSI", line=dict(color="#e2e8f0", width=1.5)),
        row=3,
        col=1,
    )
    fig.add_hrect(y0=70, y1=100, fillcolor=COLORS["down"], opacity=0.08, line_width=0, row=3, col=1)
    fig.add_hrect(y0=0, y1=30, fillcolor=COLORS["up"], opacity=0.08, line_width=0, row=3, col=1)
    fig.add_hline(y=70, line_dash="dot", line_color=COLORS["down"], row=3, col=1)
    fig.add_hline(y=30, line_dash="dot", line_color=COLORS["up"], row=3, col=1)

    hist_colors = [COLORS["up"] if value >= 0 else COLORS["down"] for value in data["MACD_HIST"].fillna(0)]
    fig.add_trace(
        go.Bar(x=data.index, y=data["MACD_HIST"], name="Histogram", marker_color=hist_colors), row=4, col=1
    )
    fig.add_trace(
        go.Scatter(x=data.index, y=data["MACD"], name="MACD", line=dict(color=COLORS["macd"])), row=4, col=1
    )
    fig.add_trace(
        go.Scatter(x=data.index, y=data["MACD_SIGNAL"], name="Signal", line=dict(color=COLORS["signal"])),
        row=4,
        col=1,
    )

    _base_layout(fig, 900)
    fig.update_yaxes(title_text=currency, row=1, col=1)
    fig.update_yaxes(title_text="RSI", range=[0, 100], row=3, col=1)
    return fig


def equity_chart(equity: pd.DataFrame) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=equity.index, y=equity["Strategy"], name="Strategy", line=dict(color=COLORS["up"], width=2)
        )
    )
    fig.add_trace(
        go.Scatter(
            x=equity.index,
            y=equity["Buy & Hold"],
            name="Buy & Hold",
            line=dict(color=COLORS["ma50"], width=2),
        )
    )
    _base_layout(fig, 420)
    fig.update_yaxes(title="Growth of 1.00")
    return fig


def confidence_gauge(confidence: float, verdict: str) -> go.Figure:
    color = {
        "BULLISH": COLORS["up"],
        "BEARISH": COLORS["down"],
        "NEUTRAL": COLORS["ma20"],
    }[verdict]
    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=confidence,
            number={"suffix": "%", "font": {"size": 34, "color": COLORS["text"]}},
            gauge={
                "axis": {"range": [0, 100], "visible": False},
                "bar": {"color": color, "thickness": 0.28},
                "bgcolor": "rgba(148,163,184,0.12)",
                "borderwidth": 0,
            },
            domain={"x": [0, 1], "y": [0, 1]},
        )
    )
    fig.update_layout(
        height=150,
        margin=dict(l=18, r=18, t=18, b=8),
        paper_bgcolor="rgba(0,0,0,0)",
    )
    return fig


def risk_chart(data: pd.DataFrame) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=data.index, y=data["Close"], name="Close", line=dict(color=COLORS["text"])))
    fig.add_trace(
        go.Scatter(
            x=data.index, y=data["BB_UPPER"], name="Upper band", line=dict(color=COLORS["ma50"], width=1)
        )
    )
    fig.add_trace(
        go.Scatter(
            x=data.index,
            y=data["BB_LOWER"],
            name="Lower band",
            line=dict(color=COLORS["ma50"], width=1),
            fill="tonexty",
            fillcolor="rgba(96,165,250,0.08)",
        )
    )
    _base_layout(fig, 420)
    return fig
