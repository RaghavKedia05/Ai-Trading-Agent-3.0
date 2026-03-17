import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.graph_objects as goimport streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import base64
import os

st.set_page_config(page_title="AI Stock Decision PRO", layout="wide")

st.title("🤖 AI Stock Decision PRO")

# ================= GET BASE PATH =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BUY_SOUND_PATH = os.path.join(BASE_DIR, "assets", "buy.mp3")
SELL_SOUND_PATH = os.path.join(BASE_DIR, "assets", "sell.mp3")

# ================= SAFE SOUND =================
def play_sound(file_path):
    try:
        if not os.path.exists(file_path):
            st.warning(f"Sound file missing: {file_path}")
            return

        with open(file_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()

        audio_html = f"""
        <audio autoplay>
        <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
        </audio>
        """
        st.markdown(audio_html, unsafe_allow_html=True)
    except Exception as e:
        st.warning(f"Audio error: {e}")

# ================= CACHE =================
@st.cache_data
def load_data(stock):
    try:
        data = yf.download(stock, period="1y")
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        return data
    except:
        return pd.DataFrame()

# ================= INPUT =================
stock = st.text_input("Enter Stock Symbol (AAPL, TSLA, INFY.NS)", "AAPL")

# ================= ANALYSIS =================
def analyze_stock(data):

    reasons = []

    data["MA50"] = data["Close"].rolling(50).mean()
    data["MA200"] = data["Close"].rolling(200).mean()

    delta = data["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / loss
    data["RSI"] = 100 - (100 / (1 + rs))

    exp1 = data["Close"].ewm(span=12).mean()
    exp2 = data["Close"].ewm(span=26).mean()
    data["MACD"] = exp1 - exp2
    data["Signal"] = data["MACD"].ewm(span=9).mean()

    data["BB_Mid"] = data["Close"].rolling(20).mean()
    std = data["Close"].rolling(20).std()
    data["BB_Upper"] = data["BB_Mid"] + 2 * std
    data["BB_Lower"] = data["BB_Mid"] - 2 * std

    data = data.dropna()

    if data.empty:
        return "HOLD", None, data, 0, ["Not enough data"]

    latest = data.iloc[-1]
    score = 0

    # Trend
    if latest["MA50"] > latest["MA200"]:
        score += 1
        reasons.append("📈 Uptrend")
    else:
        score -= 1
        reasons.append("📉 Downtrend")

    # RSI
    if latest["RSI"] < 30:
        score += 1
        reasons.append("Oversold")
    elif latest["RSI"] > 70:
        score -= 1
        reasons.append("Overbought")

    # MACD
    if latest["MACD"] > latest["Signal"]:
        score += 1
        reasons.append("Bullish MACD")
    else:
        score -= 1
        reasons.append("Bearish MACD")

    # Bollinger
    if latest["Close"] < latest["BB_Lower"]:
        score += 1
        reasons.append("Near lower band")
    elif latest["Close"] > latest["BB_Upper"]:
        score -= 1
        reasons.append("Near upper band")

    if score >= 2:
        decision = "BUY"
    elif score <= -2:
        decision = "SELL"
    else:
        decision = "HOLD"

    return decision, latest, data, score, reasons

# ================= SESSION =================
if "last_decision" not in st.session_state:
    st.session_state.last_decision = None

# ================= BUTTON =================
if st.button("Analyze Stock"):

    data = load_data(stock)

    if data is None or data.empty:
        st.error("❌ Could not fetch stock data")
        st.stop()

    decision, latest, data, score, reasons = analyze_stock(data)

    st.subheader(f"📊 Decision for {stock}")

    col1, col2 = st.columns([1,2])

    with col1:
        if decision == "BUY":
            st.success("📈 BUY")
        elif decision == "SELL":
            st.error("📉 SELL")
        else:
            st.warning("⚖️ HOLD")

        # ================= SOUND =================
        if decision != st.session_state.last_decision:
            if decision == "BUY":
                play_sound(BUY_SOUND_PATH)
            elif decision == "SELL":
                play_sound(SELL_SOUND_PATH)

        st.session_state.last_decision = decision

        confidence = min(abs(score)/4*100, 100)
        st.progress(int(confidence))
        st.write(f"Confidence: {round(confidence,2)}%")

        st.write("### 🧠 Why?")
        for r in reasons:
            st.write(f"- {r}")

    # ================= CHART =================
    tab1, tab2, tab3 = st.tabs(["📈 Chart", "📊 Indicators", "📦 Volume"])

    with tab1:
        fig = go.Figure(data=[go.Candlestick(
            x=data.index,
            open=data['Open'],
            high=data['High'],
            low=data['Low'],
            close=data['Close']
        )])
        st.plotly_chart(fig, use_container_width=True)

    with tab2:
        fig1, ax = plt.subplots()
        ax.plot(data["Close"])
        ax.plot(data["MA50"])
        ax.plot(data["MA200"])
        st.pyplot(fig1)

        fig2, ax2 = plt.subplots()
        ax2.plot(data["RSI"])
        ax2.axhline(70)
        ax2.axhline(30)
        st.pyplot(fig2)

    with tab3:
        fig3 = go.Figure()
        fig3.add_bar(x=data.index, y=data["Volume"])
        st.plotly_chart(fig3, use_container_width=True)

# ================= CACHE CLEAR =================
if st.button("Clear Cache"):
    st.cache_data.clear()
    st.success("Cache cleared!")
import base64
import os

st.set_page_config(page_title="AI Stock Decision PRO", layout="wide")

st.title("🤖 AI Stock Decision PRO")

# ================= SOUND FUNCTION =================
def play_sound(file_path):
    if not os.path.exists(file_path):
        return
    try:
        with open(file_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        audio_html = f"""
        <audio autoplay>
        <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
        </audio>
        """
        st.markdown(audio_html, unsafe_allow_html=True)
    except:
        pass

# ================= CACHE DATA =================
@st.cache_data
def load_data(stock):
    return yf.download(stock, period="1y")

# ================= INPUT =================
stock = st.text_input("Enter Stock Symbol (AAPL, TSLA, INFY.NS)", "AAPL")

# ================= ANALYSIS =================
def analyze_stock(data):

    reasons = []

    data["MA50"] = data["Close"].rolling(50).mean()
    data["MA200"] = data["Close"].rolling(200).mean()

    delta = data["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / loss
    data["RSI"] = 100 - (100 / (1 + rs))

    exp1 = data["Close"].ewm(span=12).mean()
    exp2 = data["Close"].ewm(span=26).mean()
    data["MACD"] = exp1 - exp2
    data["Signal"] = data["MACD"].ewm(span=9).mean()

    data["BB_Mid"] = data["Close"].rolling(20).mean()
    std = data["Close"].rolling(20).std()
    data["BB_Upper"] = data["BB_Mid"] + 2 * std
    data["BB_Lower"] = data["BB_Mid"] - 2 * std

    data["Vol_MA"] = data["Volume"].rolling(20).mean()

    data = data.dropna()
    latest = data.iloc[-1]

    score = 0

    # Trend
    if latest["MA50"] > latest["MA200"]:
        score += 1
        reasons.append("📈 Uptrend (MA50 > MA200)")
    else:
        score -= 1
        reasons.append("📉 Downtrend (MA50 < MA200)")

    # RSI
    if latest["RSI"] < 30:
        score += 1
        reasons.append("🟢 Oversold (RSI < 30)")
    elif latest["RSI"] > 70:
        score -= 1
        reasons.append("🔴 Overbought (RSI > 70)")

    # MACD
    if latest["MACD"] > latest["Signal"]:
        score += 1
        reasons.append("📊 Bullish MACD crossover")
    else:
        score -= 1
        reasons.append("📊 Bearish MACD crossover")

    # Bollinger
    if latest["Close"] < latest["BB_Lower"]:
        score += 1
        reasons.append("🟢 Price near lower band (cheap)")
    elif latest["Close"] > latest["BB_Upper"]:
        score -= 1
        reasons.append("🔴 Price near upper band (expensive)")

    if score >= 2:
        decision = "BUY"
    elif score <= -2:
        decision = "SELL"
    else:
        decision = "HOLD"

    return decision, latest, data, score, reasons

# ================= SESSION =================
if "last_decision" not in st.session_state:
    st.session_state.last_decision = None

# ================= BUTTON =================
if st.button("Analyze Stock"):

    data = load_data(stock)

    if data.empty:
        st.error("Invalid stock symbol")
        st.stop()

    decision, latest, data, score, reasons = analyze_stock(data)

    # ================= RESULT =================
    st.subheader(f"📊 Decision for {stock}")

    colA, colB = st.columns([1, 2])

    with colA:
        if decision == "BUY":
            st.success("📈 BUY")
        elif decision == "SELL":
            st.error("📉 SELL")
        else:
            st.warning("⚖️ HOLD")

        # SOUND
        if decision != st.session_state.last_decision:
            if decision == "BUY":
                play_sound("assets/buy.mp3")
            elif decision == "SELL":
                play_sound("assets/sell.mp3")

        st.session_state.last_decision = decision

        confidence = min(abs(score) / 4 * 100, 100)
        st.progress(int(confidence))
        st.write(f"Confidence: **{round(confidence,2)}%**")

        st.write("### 🧠 Why this decision?")
        for r in reasons:
            st.write(f"- {r}")

    # ================= TABS =================
    tab1, tab2, tab3 = st.tabs(["📈 Candlestick", "📊 Indicators", "📦 Volume"])

    # ================= CANDLESTICK =================
    with tab1:
        fig = go.Figure(data=[go.Candlestick(
            x=data.index,
            open=data['Open'],
            high=data['High'],
            low=data['Low'],
            close=data['Close']
        )])
        st.plotly_chart(fig, use_container_width=True)

    # ================= INDICATORS =================
    with tab2:
        fig2, ax = plt.subplots()
        ax.plot(data["Close"], label="Price")
        ax.plot(data["MA50"], label="MA50")
        ax.plot(data["MA200"], label="MA200")
        ax.legend()
        st.pyplot(fig2)

        fig3, ax2 = plt.subplots()
        ax2.plot(data["RSI"])
        ax2.axhline(70)
        ax2.axhline(30)
        st.pyplot(fig3)

    # ================= VOLUME =================
    with tab3:
        fig4 = go.Figure()
        fig4.add_bar(x=data.index, y=data["Volume"])
        st.plotly_chart(fig4, use_container_width=True)
