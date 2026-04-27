#!/usr/bin/env python3
"""
Minimal yfinance wrapper called by marketData.js via child_process.
Usage:
  python3 yf_fetch.py historical <symbol> <interval> <count>
  python3 yf_fetch.py quote <symbol>
Outputs JSON to stdout, errors to stderr.
"""
import sys, json
import yfinance as yf
import warnings
warnings.filterwarnings('ignore')

def historical(symbol, interval, count):
    count = int(count)
    if interval == '1wk':
        period = f"{count * 7}d"
    else:
        period = f"{count}d"

    t = yf.Ticker(symbol)
    h = t.history(period=period, interval=interval, auto_adjust=True)
    bars = []
    for dt, row in h.iterrows():
        if not all([row['Open'], row['High'], row['Low'], row['Close']]):
            continue
        bars.append({
            'date':   dt.strftime('%Y-%m-%d'),
            'open':   float(row['Open']),
            'high':   float(row['High']),
            'low':    float(row['Low']),
            'close':  float(row['Close']),
            'volume': int(row['Volume']) if row['Volume'] else 0,
        })
    bars.sort(key=lambda b: b['date'])
    print(json.dumps(bars))

def quote(symbol):
    t = yf.Ticker(symbol)
    fi = t.fast_info
    price       = fi.last_price
    prev_close  = fi.previous_close
    open_price  = fi.open
    day_high    = fi.day_high
    day_low     = fi.day_low
    volume      = fi.last_volume
    change      = (price - prev_close) if (price and prev_close) else 0
    change_pct  = (change / prev_close * 100) if prev_close else 0

    # display name fallback
    try:
        name = t.info.get('longName') or t.info.get('shortName') or symbol
    except Exception:
        name = symbol

    print(json.dumps({
        'symbol':      symbol,
        'price':       price,
        'change':      change,
        'changePct':   change_pct,
        'open':        open_price,
        'high':        day_high,
        'low':         day_low,
        'prevClose':   prev_close,
        'volume':      volume,
        'displayName': name,
    }))

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'historical':
        historical(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == 'quote':
        quote(sys.argv[2])
    else:
        print(json.dumps({'error': f'unknown command: {cmd}'}), file=sys.stderr)
        sys.exit(1)
