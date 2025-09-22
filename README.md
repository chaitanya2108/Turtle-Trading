# Turtle Trading Analysis Flask Application

This Flask application analyzes historic stock data using the Turtle Trading strategy for the past 20 years.

## Features

- **Data Fetching**: Uses yfinance to get 20 years of historic data for major tickers
- **Turtle Trading Analysis**: Implements Donchian channels and breakout detection
- **Interactive Charts**: Uses Plotly to create interactive price charts with trading signals
- **Performance Metrics**: Shows entry/exit signal counts and basic performance statistics

## Tickers Analyzed

- **AAPL** - Apple Inc.
- **MSFT** - Microsoft Corporation
- **NVDA** - NVIDIA Corporation
- **SPY** - SPDR S&P 500 ETF Trust
- **QQQ** - Invesco QQQ Trust

## Turtle Trading Strategy

The application implements the classic Turtle Trading strategy:

### Entry Rules

- **Long Entry**: Buy when price breaks above the 20-day high
- **Short Entry**: Sell when price breaks below the 20-day low

### Exit Rules

- **Long Exit**: Exit long positions when price breaks below the 10-day low
- **Short Exit**: Exit short positions when price breaks above the 10-day high

### Risk Management

- **ATR Calculation**: Uses 20-day Average True Range for position sizing
- **Donchian Channels**: Visual representation of breakout levels

## Installation

1. Install required packages:

```bash
pip install -r requirements.txt
```

2. Run the Flask application:

```bash
python app.py
```

3. Open your browser and navigate to:

```
http://localhost:5000
```

## Usage

1. **Home Page**: Select a ticker from the available options
2. **Analysis Page**: View interactive charts with:
   - Price data with Donchian channels
   - Entry and exit signals
   - Volume data
   - Performance metrics

## API Endpoints

- `GET /` - Home page with ticker selection
- `GET /analyze/<ticker>` - Analysis page for specific ticker
- `GET /api/data/<ticker>` - JSON API for raw ticker data

## Technical Details

- **Data Source**: Yahoo Finance via yfinance
- **Time Period**: 20 years of historic data
- **Charting**: Interactive Plotly charts
- **Framework**: Flask web application
- **Data Processing**: Pandas for data manipulation

## Future Enhancements

This is the foundation for building an AI agent for Turtle Trading. Potential improvements:

1. **Backtesting Engine**: Implement proper P&L calculation
2. **Position Sizing**: Add Kelly criterion or fixed fractional position sizing
3. **Risk Management**: Implement stop-loss and take-profit levels
4. **Machine Learning**: Add ML models for signal filtering
5. **Real-time Data**: Connect to live market data feeds
6. **Portfolio Management**: Multi-asset portfolio optimization

## Disclaimer

This application is for educational and research purposes only. It is not financial advice. Always do your own research before making investment decisions.
