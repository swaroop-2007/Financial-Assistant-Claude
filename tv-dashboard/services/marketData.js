'use strict';

const { execFile } = require('child_process');
const path = require('path');

const HELPER = path.join(__dirname, 'yf_fetch.py');

// Simple in-memory cache { key -> { data, ts } }
const cache = {};
const TTL = { quote: 30_000, daily: 300_000, weekly: 600_000 };

function cached(key, ttl, fetcher) {
  const hit = cache[key];
  if (hit && Date.now() - hit.ts < ttl) return Promise.resolve(hit.data);
  return fetcher().then(data => { cache[key] = { data, ts: Date.now() }; return data; });
}

function runPython(args) {
  return new Promise((resolve, reject) => {
    execFile('python3', [HELPER, ...args], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      try { resolve(JSON.parse(stdout)); }
      catch (e) { reject(new Error(`Bad JSON from yf_fetch: ${stdout.slice(0, 200)}`)); }
    });
  });
}

// Historical OHLCV bars (interval: '1d' or '1wk')
function historical(yahooSymbol, interval = '1d', count = 300) {
  const cacheKey = `hist:${yahooSymbol}:${interval}:${count}`;
  const ttl = interval === '1wk' ? TTL.weekly : TTL.daily;
  return cached(cacheKey, ttl, () => runPython(['historical', yahooSymbol, interval, String(count)]));
}

// Real-time quote
function quote(yahooSymbol) {
  return cached(`q:${yahooSymbol}`, TTL.quote, () => runPython(['quote', yahooSymbol]));
}

module.exports = { historical, quote };
