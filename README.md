# 🤖 AI Stock Decision PRO

An interactive AI-powered stock analysis dashboard built using Streamlit.
It analyzes stocks using technical indicators and provides BUY / SELL / HOLD decisions with visual insights and sound alerts.

---

## 🚀 Features

* 📊 Technical Analysis (MA50, MA200, RSI, MACD, Bollinger Bands)
* 📈 Candlestick Charts (Plotly)
* 🔊 Sound Alerts for BUY/SELL signals
* 🧠 Decision Explanation (Why BUY/SELL)
* 📊 Confidence Score
* ⚡ Fast Performance with Data Caching
* 📦 Volume Analysis
* 🎯 Clean UI with Tabs

---

## 🛠️ Tech Stack

* Python
* Streamlit
* yFinance API
* Pandas & NumPy
* Matplotlib & Plotly

---

## 📁 Project Structure

```
ai-stock-app/
│
├── app.py
├── requirements.txt
├── README.md
└── assets/
    ├── buy.mp3
    └── sell.mp3
```

---

## ▶️ How to Run Locally

1. Clone the repository:

```
git clone https://github.com/your-username/ai-stock-app.git
cd ai-stock-app
```

2. Install dependencies:

```
pip install -r requirements.txt
```

3. Run the app:

```
streamlit run app.py
```

---

## 🔊 Adding Sound Files

Place your audio files inside the `assets/` folder:

* `buy.mp3` → plays on BUY signal
* `sell.mp3` → plays on SELL signal

---

## 📌 Example Inputs

* AAPL (Apple)
* TSLA (Tesla)
* INFY.NS (Infosys - NSE)
* RELIANCE.NS

---

## ⚠️ Disclaimer

This project is for educational purposes only and should not be considered financial advice. Always do your own research before investing.

---

## 🔥 Future Improvements

* 🤖 Machine Learning-based predictions
* 📉 Backtesting engine
* 🌐 Deployment with user authentication
* 📰 News sentiment analysis
* 💼 Portfolio tracking

---

## 🙌 Author

Developed by **Raghav Kedia**

---

⭐ If you like this project, give it a star on GitHub!
