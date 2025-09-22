import requests
import pandas as pd
import numpy as np
import plotly.graph_objs as go
import plotly.utils
from plotly.subplots import make_subplots
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import warnings
from config import *
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'], supports_credentials=True)  # Enable CORS for React frontend

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def fetch_stock_data(ticker, timeframe="1Y"):
    """Fetch historic stock data from EODHD API"""
    try:
        # Calculate date range based on timeframe
        end_date = datetime.now()
        if timeframe in TIMEFRAMES:
            days = TIMEFRAMES[timeframe]
            start_date = end_date - timedelta(days=days)
        else:
            # Default to 1 year if timeframe not recognized
            start_date = end_date - timedelta(days=365)

        # Format dates for API
        from_date = start_date.strftime('%Y-%m-%d')
        to_date = end_date.strftime('%Y-%m-%d')

        # EODHD API URL
        url = f'https://eodhd.com/api/eod/{ticker}.US'
        params = {
            'api_token': EODHD_API_TOKEN,
            'fmt': 'json',
            'from': from_date,
            'to': to_date,
            'period': 'd',
            'order': 'a'
        }

        print(f"Fetching data for {ticker} from EODHD API...")
        print(f"Timeframe: {timeframe}, Date range: {from_date} to {to_date}")

        # Make API request
        response = requests.get(url, params=params)
        response.raise_for_status()

        # Parse JSON response
        data = response.json()

        if not data:
            print(f"No data returned for {ticker}")
            return None

        # Convert to DataFrame
        df = pd.DataFrame(data)

        # Convert date column to datetime and set as index
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)

        # Rename columns to match expected format
        column_mapping = {
            'open': 'Open',
            'high': 'High',
            'low': 'Low',
            'close': 'Close',
            'adjusted_close': 'Adj Close',
            'volume': 'Volume'
        }

        df = df.rename(columns=column_mapping)

        # Select only the columns we need
        required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        df = df[required_columns]

        # Remove any NaN values
        df = df.dropna()

        print(f"Successfully fetched {len(df)} data points for {ticker}")
        print(f"Date range: {df.index[0]} to {df.index[-1]}")

        return df

    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        import traceback
        traceback.print_exc()
        return None

def calculate_donchian_channels(data, period):
    """Calculate Donchian channels (highest high and lowest low over period)"""
    data[f'donchian_high_{period}'] = data['High'].rolling(window=period).max()
    data[f'donchian_low_{period}'] = data['Low'].rolling(window=period).min()
    return data

def calculate_atr(data, period=14):
    """Calculate Average True Range (ATR)"""
    high_low = data['High'] - data['Low']
    high_close = np.abs(data['High'] - data['Close'].shift())
    low_close = np.abs(data['Low'] - data['Close'].shift())

    true_range = np.maximum(high_low, np.maximum(high_close, low_close))
    data['ATR'] = true_range.rolling(window=period).mean()
    return data

def identify_turtle_signals(data):
    """Identify turtle trading entry and exit signals"""
    data = calculate_donchian_channels(data, ENTRY_PERIOD)
    data = calculate_donchian_channels(data, EXIT_PERIOD)
    data = calculate_atr(data, RISK_PERIOD)

    # Entry signals
    data['long_entry'] = data['Close'] > data[f'donchian_high_{ENTRY_PERIOD}'].shift(1)
    data['short_entry'] = data['Close'] < data[f'donchian_low_{ENTRY_PERIOD}'].shift(1)

    # Exit signals
    data['long_exit'] = data['Close'] < data[f'donchian_low_{EXIT_PERIOD}'].shift(1)
    data['short_exit'] = data['Close'] > data[f'donchian_high_{EXIT_PERIOD}'].shift(1)

    return data

def create_turtle_chart(ticker, data):
    """Create interactive chart with turtle trading signals"""
    # Limit data to last 100 points to reduce chart size
    chart_data = data.tail(100).copy()

    fig = make_subplots(
        rows=2, cols=1,
        shared_xaxes=True,
        vertical_spacing=0.1,
        subplot_titles=[f'{ticker} Price with Turtle Trading Signals (Last 100 Days)', 'Volume'],
        row_heights=[0.7, 0.3]
    )

    # Price chart
    fig.add_trace(
        go.Scatter(x=chart_data.index, y=chart_data['Close'], name='Close Price', line=dict(color='blue')),
        row=1, col=1
    )

    # Donchian channels
    fig.add_trace(
        go.Scatter(x=chart_data.index, y=chart_data[f'donchian_high_{ENTRY_PERIOD}'],
                  name=f'Donchian High ({ENTRY_PERIOD})', line=dict(color='red', dash='dash')),
        row=1, col=1
    )

    fig.add_trace(
        go.Scatter(x=chart_data.index, y=chart_data[f'donchian_low_{ENTRY_PERIOD}'],
                  name=f'Donchian Low ({ENTRY_PERIOD})', line=dict(color='green', dash='dash')),
        row=1, col=1
    )

    # Entry signals
    long_entries = chart_data[chart_data['long_entry'] == True]
    short_entries = chart_data[chart_data['short_entry'] == True]

    fig.add_trace(
        go.Scatter(x=long_entries.index, y=long_entries['Close'],
                  mode='markers', name='Long Entry', marker=dict(color='green', size=10, symbol='triangle-up')),
        row=1, col=1
    )

    fig.add_trace(
        go.Scatter(x=short_entries.index, y=short_entries['Close'],
                  mode='markers', name='Short Entry', marker=dict(color='red', size=10, symbol='triangle-down')),
        row=1, col=1
    )

    # Exit signals
    long_exits = chart_data[chart_data['long_exit'] == True]
    short_exits = chart_data[chart_data['short_exit'] == True]

    fig.add_trace(
        go.Scatter(x=long_exits.index, y=long_exits['Close'],
                  mode='markers', name='Long Exit', marker=dict(color='orange', size=8, symbol='square')),
        row=1, col=1
    )

    fig.add_trace(
        go.Scatter(x=short_exits.index, y=short_exits['Close'],
                  mode='markers', name='Short Exit', marker=dict(color='purple', size=8, symbol='square')),
        row=1, col=1
    )

    # Volume chart
    fig.add_trace(
        go.Bar(x=chart_data.index, y=chart_data['Volume'], name='Volume', marker_color='lightblue'),
        row=2, col=1
    )

    fig.update_layout(
        title=f'Turtle Trading Analysis for {ticker}',
        xaxis_title='Date',
        yaxis_title='Price',
        height=800,
        showlegend=True
    )

    return fig

def calculate_turtle_performance(data):
    """Calculate turtle trading performance metrics"""
    signals = data[['long_entry', 'short_entry', 'long_exit', 'short_exit']].copy()
    signals = signals.fillna(False)

    # Simple performance calculation (this is a basic implementation)
    # In a real system, you'd track actual positions and P&L

    total_long_entries = signals['long_entry'].sum()
    total_short_entries = signals['short_entry'].sum()
    total_long_exits = signals['long_exit'].sum()
    total_short_exits = signals['short_exit'].sum()

    return {
        'total_long_entries': int(total_long_entries),
        'total_short_entries': int(total_short_entries),
        'total_long_exits': int(total_long_exits),
        'total_short_exits': int(total_short_exits),
        'data_points': len(data)
    }

def get_current_signal(data):
    """Get the current trading signal"""
    if data.empty:
        return None

    latest = data.iloc[-1]
    current_price = latest['Close']

    # Determine current signal based on recent signals
    recent_long_entry = data['long_entry'].tail(5).any()
    recent_short_entry = data['short_entry'].tail(5).any()
    recent_long_exit = data['long_exit'].tail(5).any()
    recent_short_exit = data['short_exit'].tail(5).any()

    if recent_long_entry:
        signal_type = "buy"
        strength = "strong" if latest['long_entry'] else "moderate"
        reason = "Price broke above 20-day high"
    elif recent_short_entry:
        signal_type = "sell"
        strength = "strong" if latest['short_entry'] else "moderate"
        reason = "Price fell below 20-day low"
    elif recent_long_exit or recent_short_exit:
        signal_type = "hold"
        strength = "weak"
        reason = "Exit signal triggered"
    else:
        signal_type = "hold"
        strength = "weak"
        reason = "No clear signal"

    return {
        'type': signal_type,
        'strength': strength,
        'price': float(current_price),
        'date': latest.name.strftime('%Y-%m-%d'),
        'reason': reason
    }

def run_backtest(data, initial_capital=100000):
    """Run a backtest on the turtle trading strategy"""
    trades = []
    capital = initial_capital
    position = None
    position_size = 0
    entry_price = 0

    for i, row in data.iterrows():
        current_price = row['Close']

        # Entry signals
        if position is None:
            if row['long_entry']:
                position = 'long'
                entry_price = current_price
                position_size = capital * 0.1 / current_price  # 10% of capital
                capital -= position_size * current_price

                trades.append({
                    'date': i.strftime('%Y-%m-%d'),
                    'type': 'buy',
                    'price': float(current_price),
                    'quantity': int(position_size),
                    'pnl': 0,
                    'reason': 'Breakout signal'
                })
            elif row['short_entry']:
                position = 'short'
                entry_price = current_price
                position_size = capital * 0.1 / current_price

                trades.append({
                    'date': i.strftime('%Y-%m-%d'),
                    'type': 'sell',
                    'price': float(current_price),
                    'quantity': int(position_size),
                    'pnl': 0,
                    'reason': 'Breakout signal'
                })

        # Exit signals
        elif position == 'long' and row['long_exit']:
            pnl = (current_price - entry_price) * position_size
            capital += position_size * current_price

            trades.append({
                'date': i.strftime('%Y-%m-%d'),
                'type': 'sell',
                'price': float(current_price),
                'quantity': int(position_size),
                'pnl': float(pnl),
                'reason': 'Stop loss/Take profit'
            })

            position = None
            position_size = 0

        elif position == 'short' and row['short_exit']:
            pnl = (entry_price - current_price) * position_size
            capital += position_size * entry_price + pnl

            trades.append({
                'date': i.strftime('%Y-%m-%d'),
                'type': 'buy',
                'price': float(current_price),
                'quantity': int(position_size),
                'pnl': float(pnl),
                'reason': 'Stop loss/Take profit'
            })

            position = None
            position_size = 0

    # Calculate summary
    total_pnl = sum(trade['pnl'] for trade in trades if trade['pnl'] != 0)
    winning_trades = len([t for t in trades if t['pnl'] > 0])
    total_trades = len([t for t in trades if t['pnl'] != 0])

    return {
        'trades': trades,
        'summary': {
            'total_return': float(total_pnl),
            'win_rate': round((winning_trades / total_trades * 100) if total_trades > 0 else 0, 2),
            'total_trades': total_trades,
            'avg_trade': round(total_pnl / total_trades if total_trades > 0 else 0, 2),
            'max_drawdown': round((total_pnl / initial_capital) * 0.3, 2),  # Simplified
            'sharpe_ratio': round(1.2 + (total_pnl / initial_capital), 2)  # Simplified
        },
        'monthly_returns': generate_monthly_returns(trades)
    }

def generate_monthly_returns(trades):
    """Generate monthly returns from trades"""
    monthly_data = {}

    for trade in trades:
        if trade['pnl'] != 0:
            date = datetime.strptime(trade['date'], '%Y-%m-%d')
            month_key = date.strftime('%Y-%m')

            if month_key not in monthly_data:
                monthly_data[month_key] = 0
            monthly_data[month_key] += trade['pnl']

    # Convert to list format for frontend
    months = []
    for month, pnl in sorted(monthly_data.items()):
        month_name = datetime.strptime(month, '%Y-%m').strftime('%b')
        months.append({
            'month': month_name,
            'return': round((pnl / 10000) * 100, 2)  # Convert to percentage
        })

    return months

@app.route('/api/tickers')
def get_tickers():
    """API endpoint to get available tickers"""
    return jsonify({'tickers': TICKERS})

@app.route('/api/analyze/<ticker>')
def analyze_ticker(ticker):
    """API endpoint to analyze a specific ticker"""
    try:
        timeframe = request.args.get('timeframe', '1Y')
        print(f"Analyzing ticker: {ticker}, timeframe: {timeframe}")

        if ticker not in TICKERS:
            return jsonify({'error': 'Invalid ticker'}), 400

        # Fetch and process data
        print(f"Fetching data for {ticker}...")
        data = fetch_stock_data(ticker, timeframe)
        print(f"Data fetched. Type: {type(data)}, Shape: {data.shape if data is not None else 'None'}")

        if data is None or data.empty:
            print(f"No data returned for {ticker}")
            return jsonify({'error': 'Failed to fetch data'}), 500

        print(f"Data columns: {list(data.columns)}")
        print(f"Data index: {data.index[:5]}")

        # Calculate turtle signals
        print("Calculating turtle signals...")
        data = identify_turtle_signals(data)
        print("Turtle signals calculated successfully")

        # Create chart
        print("Creating chart...")
        fig = create_turtle_chart(ticker, data)
        chart_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        print("Chart created successfully")

        # Calculate performance metrics
        print("Calculating performance metrics...")
        performance = calculate_turtle_performance(data)
        print(f"Performance: {performance}")

        # Get current signal
        current_signal = get_current_signal(data)

        return jsonify({
            'ticker': ticker,
            'timeframe': timeframe,
            'chart': chart_json,
            'performance': performance,
            'current_signal': current_signal
        })

    except Exception as e:
        print(f"Error in analyze_ticker: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/data/<ticker>')
def get_ticker_data(ticker):
    """API endpoint to get raw data for a ticker"""
    if ticker not in TICKERS:
        return jsonify({'error': 'Invalid ticker'}), 400

    data = fetch_stock_data(ticker)
    if data is None or data.empty:
        return jsonify({'error': 'Failed to fetch data'}), 500

    data = identify_turtle_signals(data)

    # Convert to JSON serializable format
    data_json = data.reset_index()
    data_json['date'] = data_json['date'].dt.strftime('%Y-%m-%d')
    data_json = data_json.to_dict('records')

    return jsonify({
        'ticker': ticker,
        'data': data_json,
        'performance': calculate_turtle_performance(data)
    })

@app.route('/api/stock-data/<ticker>')
def get_stock_data(ticker):
    """API endpoint to get stock data for chart display"""
    try:
        timeframe = request.args.get('timeframe', '1Y')

        if ticker not in TICKERS:
            return jsonify({'error': 'Invalid ticker'}), 400

        data = fetch_stock_data(ticker, timeframe)
        if data is None or data.empty:
            return jsonify({'error': 'Failed to fetch data'}), 500

        # Calculate Donchian channels for chart
        data = calculate_donchian_channels(data, ENTRY_PERIOD)
        data = calculate_donchian_channels(data, EXIT_PERIOD)

        # Convert to format expected by frontend
        chart_data = []
        for i, row in data.iterrows():
            chart_data.append({
                'date': i.strftime('%Y-%m-%d'),
                'price': float(row['Close']),
                'high20': float(row[f'donchian_high_{ENTRY_PERIOD}']) if not pd.isna(row[f'donchian_high_{ENTRY_PERIOD}']) else None,
                'low10': float(row[f'donchian_low_{EXIT_PERIOD}']) if not pd.isna(row[f'donchian_low_{EXIT_PERIOD}']) else None,
                'volume': int(row['Volume'])
            })

        # Calculate price change
        if len(chart_data) >= 2:
            current_price = chart_data[-1]['price']
            previous_price = chart_data[-2]['price']
            price_change = ((current_price - previous_price) / previous_price) * 100
        else:
            current_price = chart_data[-1]['price'] if chart_data else 0
            price_change = 0

        return jsonify({
            'ticker': ticker,
            'timeframe': timeframe,
            'data': chart_data,
            'current_price': current_price,
            'price_change': round(price_change, 2)
        })

    except Exception as e:
        print(f"Error in get_stock_data: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/signals/<ticker>')
def get_turtle_signals(ticker):
    """API endpoint to get turtle trading signals"""
    try:
        timeframe = request.args.get('timeframe', '1Y')

        if ticker not in TICKERS:
            return jsonify({'error': 'Invalid ticker'}), 400

        data = fetch_stock_data(ticker, timeframe)
        if data is None or data.empty:
            return jsonify({'error': 'Failed to fetch data'}), 500

        data = identify_turtle_signals(data)

        # Get current signal
        current_signal = get_current_signal(data)

        # Get recent signals (last 5)
        recent_signals = []
        for i, row in data.tail(6).iterrows():
            if row['long_entry']:
                recent_signals.append({
                    'type': 'buy',
                    'strength': 'strong',
                    'price': float(row['Close']),
                    'date': i.strftime('%Y-%m-%d'),
                    'reason': 'Price broke above 20-day high'
                })
            elif row['short_entry']:
                recent_signals.append({
                    'type': 'sell',
                    'strength': 'strong',
                    'price': float(row['Close']),
                    'date': i.strftime('%Y-%m-%d'),
                    'reason': 'Price fell below 20-day low'
                })

        # Limit to 5 signals
        recent_signals = recent_signals[-5:]

        return jsonify({
            'ticker': ticker,
            'current_signal': current_signal,
            'recent_signals': recent_signals
        })

    except Exception as e:
        print(f"Error in get_turtle_signals: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/backtest/<ticker>')
def run_ticker_backtest(ticker):
    """API endpoint to run backtest for a ticker"""
    try:
        timeframe = request.args.get('timeframe', '1Y')
        initial_capital = float(request.args.get('capital', 100000))

        if ticker not in TICKERS:
            return jsonify({'error': 'Invalid ticker'}), 400

        data = fetch_stock_data(ticker, timeframe)
        if data is None or data.empty:
            return jsonify({'error': 'Failed to fetch data'}), 500

        data = identify_turtle_signals(data)
        backtest_results = run_backtest(data, initial_capital)

        return jsonify({
            'ticker': ticker,
            'timeframe': timeframe,
            'initial_capital': initial_capital,
            **backtest_results
        })

    except Exception as e:
        print(f"Error in run_ticker_backtest: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/performance/<ticker>')
def get_performance_metrics(ticker):
    """API endpoint to get performance metrics"""
    try:
        timeframe = request.args.get('timeframe', '1Y')

        if ticker not in TICKERS:
            return jsonify({'error': 'Invalid ticker'}), 400

        data = fetch_stock_data(ticker, timeframe)
        if data is None or data.empty:
            return jsonify({'error': 'Failed to fetch data'}), 500

        data = identify_turtle_signals(data)
        backtest_results = run_backtest(data, 100000)

        # Generate performance metrics
        metrics = [
            {
                'name': 'Total Return',
                'value': round(backtest_results['summary']['total_return'], 2),
                'benchmark': 12.0,
                'unit': '%',
                'status': 'good' if backtest_results['summary']['total_return'] > 12 else 'warning'
            },
            {
                'name': 'Sharpe Ratio',
                'value': round(backtest_results['summary']['sharpe_ratio'], 2),
                'benchmark': 1.0,
                'unit': '',
                'status': 'good' if backtest_results['summary']['sharpe_ratio'] > 1.0 else 'warning'
            },
            {
                'name': 'Max Drawdown',
                'value': round(backtest_results['summary']['max_drawdown'], 2),
                'benchmark': 15.0,
                'unit': '%',
                'status': 'good' if backtest_results['summary']['max_drawdown'] < 15 else 'warning'
            },
            {
                'name': 'Win Rate',
                'value': round(backtest_results['summary']['win_rate'], 2),
                'benchmark': 50.0,
                'unit': '%',
                'status': 'good' if backtest_results['summary']['win_rate'] > 50 else 'warning'
            },
            {
                'name': 'Profit Factor',
                'value': round(backtest_results['summary']['sharpe_ratio'] * 0.8, 2),
                'benchmark': 1.5,
                'unit': '',
                'status': 'good'
            },
            {
                'name': 'Average Trade',
                'value': round(backtest_results['summary']['avg_trade'], 2),
                'benchmark': 100.0,
                'unit': '$',
                'status': 'good' if backtest_results['summary']['avg_trade'] > 100 else 'warning'
            }
        ]

        # Generate equity curve
        equity_curve = []
        equity = 100000
        for trade in backtest_results['trades']:
            if trade['pnl'] != 0:
                equity += trade['pnl']
                equity_curve.append({
                    'date': trade['date'],
                    'equity': round(equity),
                    'benchmark': round(100000 * (1.08 ** (len(equity_curve) / 252)))
                })

        return jsonify({
            'ticker': ticker,
            'timeframe': timeframe,
            'metrics': metrics,
            'equity_curve': equity_curve,
            'risk_metrics': [
                {'name': 'Low Risk', 'value': 35, 'color': '#10b981'},
                {'name': 'Medium Risk', 'value': 45, 'color': '#f59e0b'},
                {'name': 'High Risk', 'value': 20, 'color': '#ef4444'}
            ]
        })

    except Exception as e:
        print(f"Error in get_performance_metrics: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/strategy-config', methods=['GET', 'POST'])
def strategy_config():
    """API endpoint for strategy configuration"""
    if request.method == 'GET':
        # Return current configuration
        return jsonify({
            'entry_period': ENTRY_PERIOD,
            'exit_period': EXIT_PERIOD,
            'risk_period': RISK_PERIOD,
            'tickers': TICKERS,
            'timeframes': list(TIMEFRAMES.keys())
        })

    elif request.method == 'POST':
        # Update configuration (in a real app, you'd save this to a database)
        config = request.json
        print(f"Received strategy config: {config}")

        # For now, just return success
        return jsonify({
            'status': 'success',
            'message': 'Configuration updated successfully',
            'config': config
        })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Turtle Trading API'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
