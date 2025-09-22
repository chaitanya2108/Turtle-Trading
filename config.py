# EODHD API Configuration
EODHD_API_TOKEN = "68cfa207cfc4a1.25576197"
YEARS_OF_DATA = 1  # EODHD free tier limited to 1 year

# Turtle Trading Parameters
TICKERS = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA", "META", "NFLX", "SPY", "QQQ"]
ENTRY_PERIOD = 20  # Donchian channel entry period
EXIT_PERIOD = 10   # Donchian channel exit period
RISK_PERIOD = 20   # ATR period for position sizing

# Timeframe mappings (in days)
TIMEFRAMES = {
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
    "2Y": 730,
    "5Y": 1825
}
