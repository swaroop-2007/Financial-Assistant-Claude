# EAP Break & Retest Strategy Spec
**Source:** "The Only Technical Analysis Video You Will Ever Need" (youtube.com/watch?v=eynxyoKgpng)
**Trader:** Stephen (EAP Training Program)

---

## Core Philosophy
All technical analysis is based on price. No single indicator or pattern works alone — 
profitable trades require confluence of trend + area of value + entry pattern.

---

## Preferred Markets
Forex (primary), crypto, stocks — any liquid market with candlestick charts.

## Preferred Timeframes
- **Higher timeframe (trend):** Daily
- **Entry timeframe:** 1H, 4H (patterns form here; must align with daily trend)
- **Volatile trend trades (flags):** also valid on 5m/15m when price is above 20 EMA

---

## Indicators Used

| Indicator | Setting | Purpose |
|-----------|---------|---------|
| EMA 20 | 20-period | Trend filter, area of value, trailing stop |
| EMA 50 | 50-period | Area of value |
| EMA 200 | 200-period | Area of value / major S/R |
| ATR | 14-period | Stop sizing and target sizing |
| RSI | 14-period | Divergence filter for reversals only |

---

## Step 1 — Trend Identification (Objective Rules)

**Uptrend:**
- Market makes higher highs and higher lows
- Each pullback low must NOT close below the previous pullback's lowest low
- Practical filter: price above 20 EMA = uptrend bias

**Downtrend:**
- Market makes lower lows and lower highs
- Each pullback high must NOT close above the previous pullback's highest high
- Practical filter: price below 20 EMA = downtrend bias

**Trend invalidation:**
- Uptrend ends → close below the lowest low of the most recent pullback
- Downtrend ends → close above the highest high of the most recent pullback

---

## Step 2 — Area of Value

Enter ONLY when price returns to one of these zones:

1. **Previous resistance broken → becomes support** (break and retest, bullish)
2. **Previous support broken → becomes resistance** (break and retest, bearish)
3. **20 EMA** — valid in short-term volatile uptrends/downtrends
4. **50 EMA** — medium-term area of value
5. **200 EMA** — major long-term S/R

Do NOT enter trades at random locations. Area of value is mandatory.

---

## Step 3 — Entry Patterns (Candlestick)

### A) 38.2% Candle (Hammer / Shooting Star variant)
**Bullish:**
- Pull Fibonacci from candle low → candle high
- Entire body (min/max of open/close) must be ABOVE the 38.2% level
- Indicates buyers overwhelmed sellers (long lower wick)

**Bearish:**
- Pull Fibonacci from candle high → candle low
- Entire body must be BELOW the 38.2% level (from the top)
- Indicates sellers overwhelmed buyers (long upper wick)

### B) Engulfing Candle
**Bullish:** Previous candle red → current candle green with a LARGER body
**Bearish:** Previous candle green → current candle red with a LARGER body

### C) Close Above / Close Below
**Close Above (bullish):** Current candle closes above the HIGH of the previous candle
**Close Below (bearish):** Current candle closes below the LOW of the previous candle
— Only trade at major structure levels, ideally with RSI divergence

---

## Step 4 — Chart Patterns (Higher-Conviction Setups)

### Double Bottom (bullish reversal or HTF continuation)
1. Market creates first low (Bottom 1) and bounces to neckline
2. Re-tests the low zone (Bottom 2)
3. **Termination zone box:** lowest BODY of Bottom 1 → lowest WICK of Bottom 1
4. Bottom 2 must TOUCH the zone (wick okay), but body must NOT close below it
5. Wait for neckline BREAK and CLOSE above it
6. Enter on the PULLBACK to the neckline with buying pressure (green candle)
7. Must be aligned with daily chart uptrend

### Double Top (bearish — exact mirror)
1. Termination zone: highest WICK of Top 1 → highest BODY of Top 1
2. Top 2 must touch zone; body must NOT close above it
3. Wait for neckline break and close below
4. Enter on pullback to neckline with selling pressure (red candle)
5. Must align with daily downtrend

### Flag Pattern (trend continuation — breakout)
**Conditions:**
- Price must be ABOVE (or near) 20 EMA (volatile trend filter)
- Impulsive move → tight consolidation (flag) → breakout candle breaks top/bottom of flag

**Entry options:**
- Option A: Enter on the breakout candle
- Option B (preferred): Wait for pullback to the breakout level, enter on buying/selling pressure

### Ascending Wedge (bullish breakout)
- Flat/slightly declining resistance + rising support (20–100 candles to form)
- Breakout above resistance → pullback to resistance zone → enter on green candle

### Descending Wedge (bearish breakout — mirror)
- Flat/slightly rising support + falling resistance
- Breakout below support → pullback → enter on red candle

---

## Stop Loss Rules

**Method 1 — ATR from swing extreme (preferred):**
- Long: stop = lowest low of current pullback − 1× ATR
- Short: stop = highest high of current pullback + 1× ATR

**Method 2 — ATR from entry:**
- Stop = entry ± 2× ATR
- Target = entry ± 4× ATR → gives 2:1 R:R

**Why ATR matters:** Stop must be sized to the volatility of the specific pair and timeframe.
A 10-pip stop on a daily chart with 190-pip ATR = 90%+ stop-out rate.

---

## Target Rules

1. Look left — target the next major structure level (previous swing high/low)
2. Ensure target is NOT too close to a major opposing structure level
3. Default minimum: 2× ATR from entry
4. For 2:1 R:R: target = 4× ATR from entry
5. **Trailing stop:** Use 20 EMA as trailing stop in strong volatile trends (can extend to 3–4:1)
6. Move stop to break-even when price reaches 1:1 on marginal setups

---

## RSI — Reversal Confluence Only

RSI is NOT a standalone signal. Use ONLY when:
1. Price is at a MAJOR structure level (not random)
2. RSI is overbought (>70) or oversold (<30)
3. **Divergence:** price making higher highs while RSI makes lower highs (bearish), or vice versa
4. A candlestick entry pattern confirms

---

## Higher Timeframe Alignment (Critical Filter)

- Trading 1H pattern? → Daily must confirm the trend direction
- Double bottom on 1H? → Daily must be in uptrend
- Double top on 1H? → Daily must be in downtrend
- This filter alone dramatically improves accuracy

---

## Market Conditions

**Best:** Clear trending market with impulsive moves and clean pullbacks
**Avoid:** Choppy, ranging markets with no clear trend
**Flags:** Only in high-volatility trends (price respecting 20 EMA)
**Reversals:** Only with RSI divergence + structure + candlestick pattern (much higher bar)

---

## Reward-to-Risk

- Minimum target: 1:1
- Preferred: 2:1 (Method 2: 2× ATR stop, 4× ATR target)
- Trailing stop setups: can reach 3–4:1 on strong trends
