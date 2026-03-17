import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px

# ================= CONFIG =================
st.set_page_config(
    page_title="AI Trading Terminal",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ================= CUSTOM CSS =================
st.markdown("""
<style>
.main {
    background: linear-gradient(135deg, #0f1117, #1a1d26);
}
.card {
    background: rgba(255,255,255,0.05);
    padding: 20px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
}
.big-font {
    font-size: 30px;
    font-weight: bold;
}
.buy { color: #00ff9f; }
.sell { color: #ff4b4b; }
.hold { color: #f1c40f; }
</style>
""", unsafe_allow_html=True)

# ================= HEADER =================
st.markdown('<div class="big-font">💹 AI Trading Terminal</div>', unsafe_allow_html=True)

# ================= SIDEBAR =================
st.sidebar.title("⚙️ Control Panel")

stock = st.sidebar.text_input("Stock Symbol", "AAPL", key="stock_input")
period = st.sidebar.selectbox("Timeframe", ["1mo", "3mo", "6mo", "1y", "2y"], key="period")

if st.sidebar.button("🔄 Refresh Data"):
    st.cache_data.clear()

# ================= LOAD DATA =================
@st.cache_data
def load_data(stock, period):
    try:
        df = yf.download(stock, period=period)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        return df
    except:
        return pd.DataFrame()

with st.spinner("Fetching market data..."):
    data = load_data(stock, period)

if data.empty:
    st.error("❌ Invalid stock symbol or data unavailable")
    st.stop()

# ================= INDICATORS =================
data["MA20"] = data["Close"].rolling(20).mean()
data["MA50"] = data["Close"].rolling(50).mean()
data["MA200"] = data["Close"].rolling(200).mean()

# RSI
delta = data["Close"].diff()
gain = delta.clip(lower=0).rolling(14).mean()
loss = -delta.clip(upper=0).rolling(14).mean()
rs = gain / loss
data["RSI"] = 100 - (100 / (1 + rs))

# MACD
exp1 = data["Close"].ewm(span=12).mean()
exp2 = data["Close"].ewm(span=26).mean()
data["MACD"] = exp1 - exp2
data["Signal"] = data["MACD"].ewm(span=9).mean()

# Drop NaNs
data = data.dropna()

latest = data.iloc[-1]

# ================= AI ENGINE =================
score = 0
reasons = []

if latest["MA50"] > latest["MA200"]:
    score += 2
    reasons.append("Strong Uptrend")
else:
    score -= 2
    reasons.append("Downtrend")

if latest["RSI"] < 30:
    score += 2
    reasons.append("Oversold")
elif latest["RSI"] > 70:
    score -= 2
    reasons.append("Overbought")

if latest["MACD"] > latest["Signal"]:
    score += 1
    reasons.append("Bullish Momentum")
else:
    score -= 1
    reasons.append("Bearish Momentum")

# Decision
if score >= 3:
    decision = "BUY"
elif score <= -3:
    decision = "SELL"
else:
    decision = "HOLD"

confidence = min(abs(score) / 5 * 100, 100)

# ================= METRICS =================
c1, c2, c3, c4 = st.columns(4)

c1.metric("💰 Price", f"${latest['Close']:.2f}")
c2.metric("📈 RSI", f"{latest['RSI']:.2f}")
c3.metric("📊 MACD", f"{latest['MACD']:.2f}")
c4.metric("🔥 Confidence", f"{confidence:.1f}%")

# ================= DECISION =================
st.markdown("## 🎯 AI Verdict")

if decision == "BUY":
    st.markdown(f'<div class="card buy">📈 STRONG BUY<br>Confidence: {confidence:.1f}%</div>', unsafe_allow_html=True)
elif decision == "SELL":
    st.markdown(f'<div class="card sell">📉 SELL<br>Confidence: {confidence:.1f}%</div>', unsafe_allow_html=True)
else:
    st.markdown(f'<div class="card hold">⚖️ HOLD<br>Confidence: {confidence:.1f}%</div>', unsafe_allow_html=True)

st.write("### 🧠 Insights")
for r in reasons:
    st.write(f"- {r}")

# ================= LAYOUT =================
col1, col2 = st.columns([2,1])

# ================= MAIN CHART =================
with col1:
    st.markdown("## 📊 Price Chart")

    fig = go.Figure()

    fig.add_trace(go.Candlestick(
        x=data.index,
        open=data["Open"],
        high=data["High"],
        low=data["Low"],
        close=data["Close"]
    ))

    fig.add_trace(go.Scatter(x=data.index, y=data["MA20"], name="MA20"))
    fig.add_trace(go.Scatter(x=data.index, y=data["MA50"], name="MA50"))
    fig.add_trace(go.Scatter(x=data.index, y=data["MA200"], name="MA200"))

    fig.update_layout(template="plotly_dark", height=600)

    st.plotly_chart(fig, use_container_width=True)

# ================= SIDE PANELS =================
with col2:
    st.markdown("## 📉 RSI")
    fig2 = px.line(data, y="RSI")
    fig2.add_hline(y=70)
    fig2.add_hline(y=30)
    fig2.update_layout(template="plotly_dark", height=250)
    st.plotly_chart(fig2, use_container_width=True)

    st.markdown("## ⚡ MACD")
    fig3 = go.Figure()
    fig3.add_trace(go.Scatter(x=data.index, y=data["MACD"], name="MACD"))
    fig3.add_trace(go.Scatter(x=data.index, y=data["Signal"], name="Signal"))
    fig3.update_layout(template="plotly_dark", height=250)
    st.plotly_chart(fig3, use_container_width=True)

# ================= VOLUME =================
st.markdown("## 📦 Volume")

fig4 = px.bar(data, y="Volume")
fig4.update_layout(template="plotly_dark", height=300)
st.plotly_chart(fig4, use_container_width=True)
