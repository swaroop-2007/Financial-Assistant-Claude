'use strict';

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const { historical, quote } = require('./services/marketData');
const { runEAP, narrativeAnalysis, generateBrief } = require('./services/strategies');

const app  = express();
const PORT = 3000;
const WL_PATH = path.join(__dirname, 'data', 'watchlist.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Watchlist helpers ─────────────────────────────────────────────────────────
function readWL()       { return JSON.parse(fs.readFileSync(WL_PATH, 'utf8')); }
function writeWL(data)  { fs.writeFileSync(WL_PATH, JSON.stringify(data, null, 2)); }

// ── GET /api/watchlist ────────────────────────────────────────────────────────
app.get('/api/watchlist', (req, res) => {
  try { res.json(readWL()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/watchlist  { id, tv, yahoo, label, type } ──────────────────────
app.post('/api/watchlist', (req, res) => {
  try {
    const { id, tv, yahoo, label, type = 'stock' } = req.body;
    if (!id || !yahoo) return res.status(400).json({ error: 'id and yahoo are required' });
    const wl = readWL();
    if (wl.find(s => s.id === id)) return res.status(409).json({ error: 'Symbol already exists' });
    const entry = { id, tv: tv || id, yahoo, label: label || id, type };
    wl.push(entry);
    writeWL(wl);
    res.json(entry);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE /api/watchlist/:id ─────────────────────────────────────────────────
app.delete('/api/watchlist/:id', (req, res) => {
  try {
    const wl = readWL().filter(s => s.id !== req.params.id);
    writeWL(wl);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/quote/:yahoo ─────────────────────────────────────────────────────
app.get('/api/quote/:yahoo', async (req, res) => {
  try { res.json(await quote(req.params.yahoo)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/chart/:yahoo?tf=1d&bars=250 ─────────────────────────────────────
// Returns OHLCV + EMA lines + signals for the chart
app.get('/api/chart/:yahoo', async (req, res) => {
  const tf   = req.query.tf   || '1d';
  const bars = parseInt(req.query.bars || '250');
  try {
    const raw    = await historical(req.params.yahoo, tf, bars);
    const result = runEAP(raw);
    res.json({
      candles:    raw.map(b => ({ time: b.date, open: b.open, high: b.high, low: b.low, close: b.close })),
      indicators: result ? result.chartData : {},
      signals:    result ? result.signals   : [],
      levels:     result ? { pivotHigh: result.current.lastPH, pivotLow: result.current.lastPL } : {},
      analysis:   result,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/strategy/eap ─────────────────────────────────────────────────────
// Run EAP scanner on entire watchlist, returns ranked results
app.get('/api/strategy/eap', async (req, res) => {
  const wl = readWL();
  const results = await Promise.allSettled(
    wl.map(async sym => {
      const bars = await historical(sym.yahoo, '1d', 300);
      const eap  = runEAP(bars);
      const q    = await quote(sym.yahoo).catch(() => null);
      return {
        ...sym,
        price:    q?.price,
        change:   q?.changePct,
        analysis: eap,
      };
    })
  );

  const out = results
    .map((r, i) => r.status === 'fulfilled' ? r.value : { ...wl[i], error: r.reason?.message })
    .filter(r => r.analysis)
    .sort((a, b) => (b.analysis.score || 0) - (a.analysis.score || 0));

  res.json(out);
});

// ── GET /api/strategy/narrative/:yahoo ───────────────────────────────────────
// Senior-trader narrative for a single symbol
app.get('/api/strategy/narrative/:yahoo', async (req, res) => {
  try {
    const bars = await historical(req.params.yahoo, '1d', 250);
    const n    = narrativeAnalysis(bars);
    res.json(n || { error: 'Not enough data' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/brief ────────────────────────────────────────────────────────────
// Daily brief for entire watchlist
app.get('/api/brief', async (req, res) => {
  const wl = readWL();
  const results = await Promise.allSettled(
    wl.map(async sym => {
      const [weekly, daily, q] = await Promise.all([
        historical(sym.yahoo, '1wk', 52).catch(() => []),
        historical(sym.yahoo, '1d',  60).catch(() => []),
        quote(sym.yahoo).catch(() => null),
      ]);
      const brief = generateBrief(sym.id, weekly, daily);
      return {
        ...sym,
        price:   q?.price,
        change:  q?.changePct,
        brief,
      };
    })
  );

  const out = results
    .map((r, i) => r.status === 'fulfilled' ? r.value : { ...wl[i], brief: null })
    .filter(r => r.brief)
    .sort((a, b) => {
      const order = { LONG: 0, SHORT: 1, NEUTRAL: 2 };
      return (order[a.brief.bias] ?? 3) - (order[b.brief.bias] ?? 3);
    });

  res.json(out);
});

// ── Serve SPA for all other routes ───────────────────────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n  TV Dashboard → http://localhost:${PORT}\n`);
});
