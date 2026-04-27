# TradingView MCP — Claude Cheat Sheet

**Status:** 78 tools over MCP (stdio) → CDP port 9222 → TradingView Desktop (Electron)
**Live check:** `tv_health_check` · `tv_discover` (shows which internal APIs are reachable)

---

## Read the Chart

| Tool | What it does |
|------|-------------|
| `chart_get_state` | **Start here.** Returns symbol, timeframe, and all indicator names + entity IDs |
| `data_get_study_values` | Current numeric values from ALL visible indicators (RSI, MACD, BB, EMA, etc.) |
| `quote_get` | Real-time price snapshot — last, OHLC, volume |
| `data_get_ohlcv` | Price bars — **always pass `summary: true`** unless you need individual bars |
| `symbol_info` | Metadata for any symbol (exchange, type, tick size) |
| `symbol_search` | Find symbols by keyword |

## Read Custom Pine Output (lines / labels / tables / boxes)

> **Indicator must be VISIBLE on chart.** Use `study_filter: "IndicatorName"` on every call.

| Tool | What it reads |
|------|--------------|
| `data_get_pine_lines` | Horizontal price levels (`line.new`) — support, resistance, session levels |
| `data_get_pine_labels` | Text annotations + prices (`label.new`) e.g. "PDH 24550", "Bias Long" |
| `data_get_pine_tables` | Table rows (`table.new`) — session stats, dashboards |
| `data_get_pine_boxes` | Price zones (`box.new`) returned as `{high, low}` pairs |

## Change the Chart

| Tool | What it does |
|------|-------------|
| `chart_set_symbol` | Change ticker (AAPL, ES1!, BTCUSD, NYMEX:CL1!) |
| `chart_set_timeframe` | Change resolution — 1, 5, 15, 60, D, W, M |
| `chart_set_type` | Change bar style — Candles, HeikinAshi, Line, Area, Renko |
| `chart_manage_indicator` | Add/remove indicators — **use full names**: "Relative Strength Index" not "RSI" |
| `chart_scroll_to_date` | Jump to a date (ISO: "2025-01-15") |
| `chart_set_visible_range` | Zoom to exact range (unix timestamps) |
| `indicator_set_inputs` | Change indicator settings (length, source, etc.) |
| `indicator_toggle_visibility` | Show or hide an indicator |
| `pane_set_layout` | Multi-pane grid: `s`, `2h`, `2v`, `2x2`, `4`, `6`, `8` |
| `pane_set_symbol` | Set symbol on any pane by index |
| `pane_list` / `pane_focus` | List panes or focus one |

## Pine Script Development

> Order matters: set source → compile → check errors → read console → save.

| Tool | Step |
|------|------|
| `pine_set_source` | 1. Inject code into the editor |
| `pine_smart_compile` | 2. Compile with auto-detection + error check |
| `pine_get_errors` | 3. Read compilation errors |
| `pine_get_console` | 4. Read `log.info()` output |
| `pine_save` | 5. Save to TradingView cloud |
| `pine_new` | Create blank indicator / strategy / library |
| `pine_open` / `pine_list_scripts` | Open or list saved scripts |
| `pine_analyze` | Offline static analysis (no chart needed) |
| `pine_check` | Server-side compile check (no chart needed) |
| `pine_get_source` | Read current script (**WARNING: can be 200 KB+ for complex scripts**) |

## Screenshots · Replay · Alerts · Drawing

| Tool | What it does |
|------|-------------|
| `capture_screenshot` | Screenshot — regions: `full`, `chart`, `strategy_tester` |
| `replay_start` | Enter replay at a date |
| `replay_step` | Advance one bar |
| `replay_autoplay` | Auto-advance (set speed in ms) |
| `replay_trade` | Buy / sell / close in replay |
| `replay_status` | Check position, P&L, current date |
| `replay_stop` | Return to realtime |
| `alert_create` / `alert_list` / `alert_delete` | Manage price alerts |
| `draw_shape` | Draw `horizontal_line`, `trend_line`, `rectangle`, `text` |
| `draw_list` / `draw_remove_one` / `draw_clear` | Manage drawings |
| `batch_run` | Run any action across multiple symbols / timeframes |
| `watchlist_get` / `watchlist_add` | Read / modify watchlist |
| `layout_list` / `layout_switch` | Manage saved layouts |

## Rules of Thumb / Common Pitfalls

- **Always call `chart_get_state` first** — it gives you entity IDs every other tool needs.
- **`summary: true` on `data_get_ohlcv`** — 500 B vs 8 KB. Use raw bars only when you need them.
- **Full indicator names in `chart_manage_indicator`** — "Relative Strength Index", not "RSI".
- **`study_filter` on all Pine data tools** — omitting it scans all indicators, wastes context.
- **Indicator must be visible** for `data_get_pine_*` to return data — toggle it on first.
- **`pine_get_source` is expensive** — avoid unless actively editing the script.
- **`alertService` may be unavailable** (`tv_discover` will show it) — alerts still work via `alert_create`.
- **Pass `verbose: true`** to any pine tool to get raw data with IDs/colors when debugging.
- Typical "analyze my chart" workflow costs ~5–10 KB of context, not ~80 KB.

---

## Example Prompts

1. **Full chart analysis:**
   > "Give me a complete analysis of my current chart — symbol, indicators, key levels, and a screenshot."
   → `chart_get_state` → `quote_get` → `data_get_study_values` → `data_get_pine_lines` → `data_get_pine_labels` → `data_get_ohlcv` (summary) → `capture_screenshot`

2. **Pine Script iteration:**
   > "Write a VWAP anchored to session open and compile it on my chart."
   → `pine_set_source` → `pine_smart_compile` → `pine_get_errors` → (fix loop) → `pine_save`

3. **Multi-pane setup:**
   > "Set up a 2×2 grid with ES1!, NQ1!, AAPL, and TSLA on the daily timeframe."
   → `pane_set_layout` (2x2) → `pane_set_symbol` ×4 → `chart_set_timeframe` (D)
