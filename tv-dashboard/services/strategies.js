'use strict';

const { ema, atr, pivotHighs, pivotLows } = require('./indicators');

// ── EAP Break & Retest (from YouTube video) ──────────────────────────────────
function runEAP(bars, { lb = 5, zoneAtr = 0.5, atrStop = 1.0, atrTgt = 2.0 } = {}) {
  if (!bars || bars.length < 210) return null;

  const opens   = bars.map(b => b.open);
  const highs   = bars.map(b => b.high);
  const lows    = bars.map(b => b.low);
  const closes  = bars.map(b => b.close);
  const dates   = bars.map(b => b.date);

  const ema20v  = ema(closes, 20);
  const ema50v  = ema(closes, 50);
  const ema200v = ema(closes, 200);
  const atr14v  = atr(highs, lows, closes, 14);
  const phArr   = pivotHighs(highs, lb);
  const plArr   = pivotLows(lows, lb);

  // Accumulate running last_ph / last_pl per bar (for signal generation)
  let lastPH = null, lastPL = null;
  const signals = [];

  for (let i = 1; i < bars.length; i++) {
    if (phArr[i] !== null) lastPH = phArr[i];
    if (plArr[i] !== null) lastPL = plArr[i];

    const e20 = ema20v[i], atrVal = atr14v[i];
    if (!e20 || !atrVal) continue;

    const close = closes[i], high = highs[i], low = lows[i];
    const open  = opens[i],  prevClose = closes[i-1], prevOpen = opens[i-1];
    const prevHigh = highs[i-1], prevLow = lows[i-1];

    const uptrend   = close > e20;
    const downtrend = close < e20;
    const zoneW     = atrVal * zoneAtr;

    const nearPH = lastPH && low  <= lastPH + zoneW && close >= lastPH - zoneW;
    const nearPL = lastPL && high >= lastPL - zoneW && close <= lastPL + zoneW;

    const cRange = high - low;
    const bullEng  = close > open && prevClose < prevOpen && (close - open) > (prevOpen - prevClose);
    const bull382  = cRange > 0 && close > open && Math.min(open, close) >= low + cRange * 0.382;
    const bullSig  = bullEng || bull382 || close > prevHigh;

    const bearEng  = close < open && prevClose > prevOpen && (open - close) > (prevClose - prevOpen);
    const bear382  = cRange > 0 && close < open && Math.max(open, close) <= high - cRange * 0.382;
    const bearSig  = bearEng || bear382 || close < prevLow;

    if (uptrend && nearPH && bullSig) {
      const recentLow = Math.min(...lows.slice(Math.max(0, i - lb), i + 1));
      signals.push({
        time: dates[i], type: 'long', price: close,
        stop:   recentLow - atrVal * atrStop,
        target: close    + atrVal * atrTgt * 2,
      });
    }
    if (downtrend && nearPL && bearSig) {
      const recentHigh = Math.max(...highs.slice(Math.max(0, i - lb), i + 1));
      signals.push({
        time: dates[i], type: 'short', price: close,
        stop:   recentHigh + atrVal * atrStop,
        target: close      - atrVal * atrTgt * 2,
      });
    }
  }

  // Current bar analysis
  const n       = bars.length - 1;
  const close   = closes[n], high = highs[n], low = lows[n], open = opens[n];
  const e20     = ema20v[n], e50 = ema50v[n], e200 = ema200v[n];
  const atrVal  = atr14v[n];
  const uptrend = e20 && close > e20;
  const zoneW   = atrVal ? atrVal * zoneAtr : 0;

  const nearPH  = lastPH && low  <= lastPH + zoneW && close >= lastPH - zoneW;
  const nearPL  = lastPL && high >= lastPL - zoneW && close <= lastPL + zoneW;

  // Proximity score (0–100, 100 = signal firing)
  let score = 0, direction = uptrend ? 'LONG' : 'SHORT', label = '';
  if (uptrend && lastPH) {
    const dist = Math.max(0, low - (lastPH + zoneW));
    score = nearPH ? 90 : Math.max(0, 100 - (dist / (lastPH * 0.03)) * 100);
    label = nearPH ? 'In zone — watch for pattern' : `${((dist / lastPH) * 100).toFixed(1)}% from retest zone`;
  } else if (!uptrend && lastPL) {
    const dist = Math.max(0, (lastPL - zoneW) - high);
    score = nearPL ? 90 : Math.max(0, 100 - (dist / (lastPL * 0.03)) * 100);
    label = nearPL ? 'In zone — watch for pattern' : `${((dist / lastPL) * 100).toFixed(1)}% from retest zone`;
  }

  return {
    current: { close, high, low, open, e20, e50, e200, atr: atrVal, lastPH, lastPL },
    trend: uptrend ? 'uptrend' : 'downtrend',
    direction,
    score: Math.round(Math.min(100, Math.max(0, score))),
    label,
    signals,
    // Chart series data
    chartData: {
      ema20:  ema20v.map((v, i)  => v !== null ? { time: dates[i], value: v } : null).filter(Boolean),
      ema50:  ema50v.map((v, i)  => v !== null ? { time: dates[i], value: v } : null).filter(Boolean),
      ema200: ema200v.map((v, i) => v !== null ? { time: dates[i], value: v } : null).filter(Boolean),
    },
  };
}

// ── Senior Trader Narrative (/chart equivalent) ───────────────────────────────
function narrativeAnalysis(bars) {
  if (!bars || bars.length < 60) return null;

  const highs  = bars.map(b => b.high);
  const lows   = bars.map(b => b.low);
  const closes = bars.map(b => b.close);

  const e20v  = ema(closes, 20);
  const e50v  = ema(closes, 50);
  const e200v = ema(closes, 200);
  const atr14 = atr(highs, lows, closes, 14);

  const n     = bars.length - 1;
  const close = closes[n];
  const e20   = e20v[n], e50 = e50v[n], e200 = e200v[n];
  // const atrV  = atr14[n]; // available if needed for future use

  // Trend structure
  const aboveAll  = e20 && e50 && e200 && close > e20 && close > e50 && close > e200;
  const belowAll  = e20 && e50 && e200 && close < e20 && close < e50 && close < e200;
  const above20   = e20 && close > e20;

  let trendStructure, primaryTrend;
  if (aboveAll)      { primaryTrend = 'LONG';  trendStructure = 'Strong uptrend — price above all EMAs, EMA stack bullish.'; }
  else if (belowAll) { primaryTrend = 'SHORT'; trendStructure = 'Strong downtrend — price below all EMAs, EMA stack bearish.'; }
  else if (above20)  { primaryTrend = 'LONG';  trendStructure = 'Short-term uptrend (above EMA 20), but fighting higher EMAs as overhead resistance.'; }
  else               { primaryTrend = 'SHORT'; trendStructure = 'Short-term downtrend (below EMA 20). EMAs acting as resistance above.'; }

  // Momentum — compare recent slope and candle structure
  const recentSlope  = closes[n] - closes[n - 10];
  const prevSlope    = closes[n - 10] - closes[n - 20];
  const momAccel     = recentSlope > prevSlope;
  const momDiverge   = (recentSlope > 0 && !above20) || (recentSlope < 0 && above20);
  let momentum;
  if (momDiverge)       momentum = 'Momentum DIVERGING from trend — caution.';
  else if (momAccel)    momentum = 'Momentum accelerating, confirming the trend.';
  else                  momentum = 'Momentum decelerating — watch for pause or pullback.';

  // Key levels — recent pivot highs/lows
  const ph = pivotHighs(highs, 5);
  const pl = pivotLows(lows, 5);
  const recentPHs = ph.filter(v => v !== null).slice(-3);
  const recentPLs = pl.filter(v => v !== null).slice(-3);
  const keyLevels = [
    ...(recentPHs.length ? [{ type: 'Resistance', price: recentPHs[recentPHs.length - 1] }] : []),
    ...(recentPLs.length ? [{ type: 'Support',    price: recentPLs[recentPLs.length - 1] }] : []),
    e20  ? { type: 'EMA 20',  price: e20  } : null,
    e200 ? { type: 'EMA 200', price: e200 } : null,
  ].filter(Boolean).sort((a, b) => Math.abs(a.price - close) - Math.abs(b.price - close)).slice(0, 3);

  // Bias flip
  const flipLevel = primaryTrend === 'LONG'
    ? (recentPLs.length ? recentPLs[recentPLs.length - 1] : e20)
    : (recentPHs.length ? recentPHs[recentPHs.length - 1] : e20);
  const flipLabel = primaryTrend === 'LONG'
    ? `Close below ${flipLevel?.toFixed(2)} (last swing low) flips bias to short.`
    : `Close above ${flipLevel?.toFixed(2)} (last swing high) flips bias to long.`;

  // Watch today
  const nearestLevel = keyLevels[0];
  const watchToday = nearestLevel
    ? `${nearestLevel.type} at ${nearestLevel.price.toFixed(2)} — price is ${Math.abs(((close - nearestLevel.price) / close) * 100).toFixed(1)}% away. Reaction here defines the next 2–3 sessions.`
    : 'No imminent level — stand aside.';

  return { primaryTrend, trendStructure, momentum, keyLevels, flipLabel, watchToday, close, e20, e50, e200 };
}

// ── Daily Brief ───────────────────────────────────────────────────────────────
function generateBrief(_symbol, weeklyBars, dailyBars) {
  if (!weeklyBars || weeklyBars.length < 10) return null;

  const wb = weeklyBars;
  const n  = wb.length - 1;
  const thisWeek = wb[n];
  const prevWeek = wb[n - 1];

  // Weekly bias
  const weekGreen   = thisWeek.close > thisWeek.open;
  const closeVsPrev = thisWeek.close > prevWeek.close;
  const weekRange   = thisWeek.high - thisWeek.low;
  const closeInRange = (thisWeek.close - thisWeek.low) / (weekRange || 1);

  // Upper wick rejection
  const upperWick   = thisWeek.high - Math.max(thisWeek.open, thisWeek.close);
  const lowerWick   = Math.min(thisWeek.open, thisWeek.close) - thisWeek.low;
  const rejecting   = upperWick > weekRange * 0.4;
  const bouncing    = lowerWick > weekRange * 0.4;

  let bias, biasColor;
  if (weekGreen && closeVsPrev && closeInRange > 0.6)       { bias = 'LONG';    biasColor = 'green'; }
  else if (!weekGreen && !closeVsPrev && closeInRange < 0.4) { bias = 'SHORT';   biasColor = 'red'; }
  else if (rejecting)                                        { bias = 'SHORT';   biasColor = 'red'; }
  else if (bouncing)                                         { bias = 'LONG';    biasColor = 'green'; }
  else                                                       { bias = 'NEUTRAL'; biasColor = 'gray'; }

  // Key level — highest high or lowest low of last 5 weeks
  const lookback5 = wb.slice(Math.max(0, n - 4), n + 1);
  const keyHigh   = Math.max(...lookback5.map(b => b.high));
  const keyLow    = Math.min(...lookback5.map(b => b.low));
  const keyLevel  = bias === 'LONG' ? keyHigh : bias === 'SHORT' ? keyLow
    : Math.abs(thisWeek.close - keyHigh) < Math.abs(thisWeek.close - keyLow) ? keyHigh : keyLow;
  const keyLevelType = keyLevel === keyHigh ? 'resistance' : 'support';

  // Watch — use daily bars for intraday context
  let watch = '';
  if (dailyBars && dailyBars.length >= 2) {
    const d = dailyBars[dailyBars.length - 1];
    const e20v = ema(dailyBars.map(b => b.close), 20);
    const e20 = e20v[e20v.length - 1];
    if (e20) {
      const gapPct = ((d.close - e20) / e20 * 100).toFixed(1);
      watch = `Daily EMA20 at ${e20.toFixed(2)} (${gapPct > 0 ? '+' : ''}${gapPct}%). `;
    }
    watch += closeInRange > 0.7 ? 'Close near weekly highs — momentum intact.' :
             closeInRange < 0.3 ? 'Close near weekly lows — potential for bounce or breakdown.' :
             'Mid-range weekly close — no edge without a level touch.';
  }

  const weekChange = ((thisWeek.close - prevWeek.close) / prevWeek.close * 100).toFixed(2);

  return {
    bias, biasColor, keyLevel: keyLevel.toPrecision(6), keyLevelType,
    watch, weekChange, close: thisWeek.close,
    weekHigh: thisWeek.high, weekLow: thisWeek.low,
  };
}

module.exports = { runEAP, narrativeAnalysis, generateBrief };
