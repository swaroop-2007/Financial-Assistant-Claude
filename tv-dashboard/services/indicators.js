'use strict';

// EMA — seeded with SMA of first `period` bars (matches TradingView)
function ema(closes, period) {
  if (closes.length < period) return closes.map(() => null);
  const k = 2 / (period + 1);
  const result = new Array(period - 1).fill(null);
  let seed = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(seed);
  for (let i = period; i < closes.length; i++) {
    seed = closes[i] * k + seed * (1 - k);
    result.push(seed);
  }
  return result;
}

// ATR — Wilder's smoothing (matches TradingView)
function atr(highs, lows, closes, period = 14) {
  const tr = [];
  for (let i = 1; i < closes.length; i++) {
    tr.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    ));
  }
  if (tr.length < period) return tr.map(() => null);
  const result = new Array(period).fill(null); // offset for closes[0] + (period-1) nulls
  let prev = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(prev);
  for (let i = period; i < tr.length; i++) {
    prev = (prev * (period - 1) + tr[i]) / period;
    result.push(prev);
  }
  return result;
}

// Pivot highs — confirmed after `lb` bars on each side
function pivotHighs(highs, lb = 5) {
  const result = new Array(highs.length).fill(null);
  for (let i = lb; i < highs.length - lb; i++) {
    let is = true;
    for (let j = i - lb; j <= i + lb; j++) {
      if (j !== i && highs[j] >= highs[i]) { is = false; break; }
    }
    if (is) result[i] = highs[i];
  }
  return result;
}

// Pivot lows — confirmed after `lb` bars on each side
function pivotLows(lows, lb = 5) {
  const result = new Array(lows.length).fill(null);
  for (let i = lb; i < lows.length - lb; i++) {
    let is = true;
    for (let j = i - lb; j <= i + lb; j++) {
      if (j !== i && lows[j] <= lows[i]) { is = false; break; }
    }
    if (is) result[i] = lows[i];
  }
  return result;
}

// SMA — used internally for reference
function sma(closes, period) {
  return closes.map((_, i) =>
    i < period - 1 ? null : closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period
  );
}

module.exports = { ema, atr, pivotHighs, pivotLows, sma };
