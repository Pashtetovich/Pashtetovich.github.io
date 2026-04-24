/* ============================================================
 * Currency Converter
 * Plain vanilla JS, no dependencies.
 *
 * Architecture:
 *   - CURRENCIES ........ static catalog of supported currencies
 *   - state ............. single mutable app state object
 *   - storage ........... localStorage helpers (rates, theme, history)
 *   - api ............... fetch + cache
 *   - convert ........... pure math
 *   - render* ........... DOM-only (reads state, writes DOM)
 *   - wire* ............. event binding
 * ============================================================ */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. Currency catalog
  // ------------------------------------------------------------
  const CURRENCIES = [
    { code: 'USD', name: 'US Dollar',           flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro',                flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound',       flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen',        flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan',        flag: '🇨🇳' },
    { code: 'RUB', name: 'Russian Ruble',       flag: '🇷🇺' },
    { code: 'CHF', name: 'Swiss Franc',         flag: '🇨🇭' },
    { code: 'CAD', name: 'Canadian Dollar',     flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar',   flag: '🇦🇺' },
    { code: 'NZD', name: 'New Zealand Dollar',  flag: '🇳🇿' },
    { code: 'SGD', name: 'Singapore Dollar',    flag: '🇸🇬' },
    { code: 'HKD', name: 'Hong Kong Dollar',    flag: '🇭🇰' },
    { code: 'KRW', name: 'South Korean Won',    flag: '🇰🇷' },
    { code: 'INR', name: 'Indian Rupee',        flag: '🇮🇳' },
    { code: 'BRL', name: 'Brazilian Real',      flag: '🇧🇷' },
    { code: 'MXN', name: 'Mexican Peso',        flag: '🇲🇽' },
    { code: 'TRY', name: 'Turkish Lira',        flag: '🇹🇷' },
    { code: 'SEK', name: 'Swedish Krona',       flag: '🇸🇪' },
    { code: 'NOK', name: 'Norwegian Krone',     flag: '🇳🇴' },
    { code: 'PLN', name: 'Polish Zloty',        flag: '🇵🇱' },
    { code: 'CZK', name: 'Czech Koruna',        flag: '🇨🇿' },
    { code: 'HUF', name: 'Hungarian Forint',    flag: '🇭🇺' },
    { code: 'ZAR', name: 'South African Rand',  flag: '🇿🇦' },
    { code: 'AED', name: 'UAE Dirham',          flag: '🇦🇪' },
    { code: 'ILS', name: 'Israeli Shekel',      flag: '🇮🇱' },
    { code: 'KZT', name: 'Kazakhstani Tenge',   flag: '🇰🇿' },
    { code: 'UAH', name: 'Ukrainian Hryvnia',   flag: '🇺🇦' },
  ];

  const CURRENCIES_BY_CODE = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));

  // ------------------------------------------------------------
  // 2. Constants
  // ------------------------------------------------------------
  const API_URL = 'https://open.er-api.com/v6/latest/USD';
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  const DEBOUNCE_MS = 150;
  const MAX_HISTORY = 5;
  const STORAGE_KEYS = {
    rates:   'cc.rates.v1',
    from:    'cc.from.v1',
    to:      'cc.to.v1',
    history: 'cc.history.v1',
    theme:   'cc.theme',
  };

  // ------------------------------------------------------------
  // 3. LocalStorage helpers
  // ------------------------------------------------------------
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, val) {
      try { localStorage.setItem(key, val); } catch (_) {}
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (_) {}
    },
  };

  function safeParseArray(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  // ------------------------------------------------------------
  // 4. State
  // ------------------------------------------------------------
  const state = {
    rates: null,            // { USD: 1, EUR: 0.91, ... } — always USD-based
    fetchedAt: null,        // epoch ms
    from: storage.get(STORAGE_KEYS.from) || 'USD',
    to:   storage.get(STORAGE_KEYS.to)   || 'EUR',
    amount: 1,              // numeric
    loading: false,
    error: null,
    history: safeParseArray(storage.get(STORAGE_KEYS.history)),
  };

  // Make sure persisted pair still exists in our catalog
  if (!CURRENCIES_BY_CODE[state.from]) state.from = 'USD';
  if (!CURRENCIES_BY_CODE[state.to])   state.to   = 'EUR';

  // ------------------------------------------------------------
  // 5. API layer with 10-min cache
  // ------------------------------------------------------------
  function readCachedRates() {
    const raw = storage.get(STORAGE_KEYS.rates);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.rates || !parsed.fetchedAt) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeCachedRates(data) {
    storage.set(STORAGE_KEYS.rates, JSON.stringify(data));
  }

  function isCacheFresh(cached) {
    if (!cached || !cached.fetchedAt) return false;
    return Date.now() - cached.fetchedAt < CACHE_TTL;
  }

  async function fetchRates({ forceFresh = false } = {}) {
    // 1. Try fresh cache
    if (!forceFresh) {
      const cached = readCachedRates();
      if (isCacheFresh(cached)) {
        state.rates = cached.rates;
        state.fetchedAt = cached.fetchedAt;
        state.error = null;
        return;
      }
    }

    // 2. Network fetch
    state.loading = true;
    state.error = null;
    renderStatus();

    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (!json || json.result !== 'success' || !json.rates) {
        throw new Error('Unexpected API response');
      }
      const payload = { rates: json.rates, fetchedAt: Date.now() };
      writeCachedRates(payload);
      state.rates = payload.rates;
      state.fetchedAt = payload.fetchedAt;
      state.error = null;
    } catch (err) {
      // Fall back to stale cache if available
      const cached = readCachedRates();
      if (cached && cached.rates) {
        state.rates = cached.rates;
        state.fetchedAt = cached.fetchedAt;
        state.error = { type: 'stale', message: err.message || 'Network error' };
      } else {
        state.error = { type: 'fatal', message: err.message || 'Network error' };
      }
    } finally {
      state.loading = false;
    }
  }

  // ------------------------------------------------------------
  // 6. Pure conversion math
  // ------------------------------------------------------------
  function convert(amount, from, to, rates) {
    if (!rates || !rates[from] || !rates[to]) return null;
    // rates are USD-based. amount in FROM -> amount in USD -> amount in TO
    const inUsd = amount / rates[from];
    return inUsd * rates[to];
  }

  function crossRate(from, to, rates) {
    return convert(1, from, to, rates);
  }

  // ------------------------------------------------------------
  // 7. Formatting helpers
  // ------------------------------------------------------------
  const NBSP = ' ';

  function formatMoney(value, code) {
    if (value == null || !isFinite(value)) return '—';
    // JPY / KRW / HUF are usually shown with 0 decimals
    const zeroDecimal = ['JPY', 'KRW', 'HUF', 'CLP', 'VND'].indexOf(code) !== -1;
    const opts = {
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : (Math.abs(value) < 1 ? 4 : 2),
    };
    try {
      return new Intl.NumberFormat('en-US', opts).format(value);
    } catch (_) {
      return value.toFixed(opts.maximumFractionDigits);
    }
  }

  function formatInputDisplay(value) {
    if (value == null || !isFinite(value)) return '';
    // Keep trailing dot / zeros while user types, so we only pretty-format on blur
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    const [intPart, decPart] = abs.toString().split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + grouped + (decPart != null ? '.' + decPart : '');
  }

  function parseAmount(raw) {
    if (raw == null) return 0;
    // Accept both "." and "," as decimal separators; strip spaces & thousand sep.
    // Strategy: drop all commas UNLESS the input looks like "12,34" (pure decimal
    // comma) — in that case swap it for a dot. Detecting that case with one regex:
    // if there's a single comma and no dot, treat it as decimal.
    let s = String(raw).trim().replace(/\s/g, '');
    if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
      // single comma as decimal: "1,23" -> "1.23"
      const commaCount = (s.match(/,/g) || []).length;
      if (commaCount === 1 && /^\d+,\d+$/.test(s)) {
        s = s.replace(',', '.');
      } else {
        s = s.replace(/,/g, ''); // thousand separators
      }
    } else {
      s = s.replace(/,/g, ''); // drop thousand separators, keep the dot
    }
    const n = parseFloat(s);
    return isFinite(n) && n >= 0 ? n : 0;
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (sec < 10)  return 'just now';
    if (sec < 60)  return sec + 's ago';
    const min = Math.floor(sec / 60);
    if (min < 60)  return min + ' min ago';
    const hr = Math.floor(min / 60);
    if (hr < 24)   return hr + 'h ago';
    const d = Math.floor(hr / 24);
    return d + 'd ago';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(fn, ms) {
    let t;
    return function debounced() {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  }

  // ------------------------------------------------------------
  // 8. DOM refs
  // ------------------------------------------------------------
  const el = {
    amountInput:   document.getElementById('amountInput'),
    fromBtn:       document.getElementById('fromBtn'),
    toBtn:         document.getElementById('toBtn'),
    swapBtn:       document.getElementById('swapBtn'),
    swapBtnMobile: document.getElementById('swapBtnMobile'),
    result:        document.getElementById('resultDisplay'),
    rateInfo:      document.getElementById('rateInfo'),
    lastUpdated:   document.getElementById('lastUpdated'),
    refreshBtn:    document.getElementById('refreshBtn'),
    refreshIcon:   document.querySelector('.refresh-icon'),
    errorBanner:   document.getElementById('errorBanner'),
    errorTitle:    document.getElementById('errorTitle'),
    errorMessage:  document.getElementById('errorMessage'),
    retryBtn:      document.getElementById('retryBtn'),
    historySection: document.getElementById('historySection'),
    historyList:    document.getElementById('historyList'),
    clearHistory:   document.getElementById('clearHistoryBtn'),
    themeToggle:    document.getElementById('themeToggle'),
    fromWrap:       document.querySelector('[data-selector="from"]'),
    toWrap:         document.querySelector('[data-selector="to"]'),
  };

  // ------------------------------------------------------------
  // 9. Render functions
  // ------------------------------------------------------------
  function renderCurrencyButton(which) {
    const code = state[which];
    const cur = CURRENCIES_BY_CODE[code];
    if (!cur) return;
    const btn = which === 'from' ? el.fromBtn : el.toBtn;
    btn.querySelector('[data-role="flag"]').textContent = cur.flag;
    btn.querySelector('[data-role="code"]').textContent = cur.code;
    btn.querySelector('[data-role="name"]').textContent = cur.name;
  }

  function renderResult() {
    if (!state.rates) {
      // Skeleton already in HTML, but in case re-render happens:
      el.result.innerHTML = '<span class="inline-block w-40 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"></span>';
      el.rateInfo.textContent = ' ';
      return;
    }
    const converted = convert(state.amount, state.from, state.to, state.rates);
    const formatted = formatMoney(converted, state.to);
    const toCur = CURRENCIES_BY_CODE[state.to];

    // Build DOM without innerHTML for user-derived content
    el.result.textContent = '';
    const num = document.createElement('span');
    num.textContent = formatted;
    const unit = document.createElement('span');
    unit.className = 'ml-2 text-xl sm:text-2xl font-semibold text-slate-500 dark:text-slate-400';
    unit.textContent = (toCur && toCur.code) || state.to;
    el.result.appendChild(num);
    el.result.appendChild(unit);

    // Animate update
    el.result.classList.remove('updated');
    // reflow to restart the animation
    void el.result.offsetWidth;
    el.result.classList.add('updated');

    // Rate info line: "1 USD = 93.50 RUB"
    const rate = crossRate(state.from, state.to, state.rates);
    if (rate != null) {
      el.rateInfo.textContent = `1 ${state.from} = ${formatMoney(rate, state.to)} ${state.to}`;
    } else {
      el.rateInfo.textContent = ' ';
    }
  }

  function renderStatus() {
    if (state.loading && !state.rates) {
      el.lastUpdated.textContent = 'Loading rates...';
      return;
    }
    if (state.loading) {
      el.lastUpdated.textContent = 'Updating...';
      return;
    }
    if (state.fetchedAt) {
      el.lastUpdated.textContent = 'Rates updated ' + timeAgo(state.fetchedAt);
    } else {
      el.lastUpdated.textContent = '';
    }
  }

  function renderError() {
    if (!state.error) {
      el.errorBanner.classList.add('hidden');
      return;
    }
    if (state.error.type === 'fatal') {
      el.errorTitle.textContent = "Couldn't fetch rates";
      el.errorMessage.textContent = 'Check your connection and try again.';
      el.errorBanner.classList.remove('hidden');
    } else if (state.error.type === 'stale') {
      // Show a subtle note in the status line, but don't block UI
      el.errorBanner.classList.add('hidden');
      el.lastUpdated.textContent =
        'Showing cached rates (' + timeAgo(state.fetchedAt) + ') — couldn’t refresh';
    }
  }

  function renderHistory() {
    const items = state.history.slice(0, MAX_HISTORY);
    if (items.length === 0) {
      el.historySection.classList.add('hidden');
      el.historyList.textContent = '';
      return;
    }
    el.historySection.classList.remove('hidden');
    el.historyList.textContent = '';

    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'history-item-btn w-full flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 text-left';
      btn.setAttribute('data-index', String(idx));

      const fromCur = CURRENCIES_BY_CODE[item.from];
      const toCur   = CURRENCIES_BY_CODE[item.to];
      if (!fromCur || !toCur) return;

      // Left block: "100 USD → 91 EUR"
      const left = document.createElement('span');
      left.className = 'flex items-center gap-2 min-w-0';

      const fromSpan = document.createElement('span');
      fromSpan.className = 'flex items-center gap-1.5 text-sm font-semibold tabular-nums';
      const fromFlag = document.createElement('span');
      fromFlag.setAttribute('data-role', 'flag');
      fromFlag.textContent = fromCur.flag;
      const fromText = document.createElement('span');
      fromText.textContent = formatMoney(item.amount, item.from) + ' ' + item.from;
      fromSpan.appendChild(fromFlag);
      fromSpan.appendChild(fromText);

      const arrow = document.createElement('span');
      arrow.className = 'text-slate-400 dark:text-slate-500';
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden', 'true');

      const toSpan = document.createElement('span');
      toSpan.className = 'flex items-center gap-1.5 text-sm font-semibold tabular-nums text-indigo-600 dark:text-indigo-400';
      const toFlag = document.createElement('span');
      toFlag.setAttribute('data-role', 'flag');
      toFlag.textContent = toCur.flag;
      const toText = document.createElement('span');
      toText.textContent = formatMoney(item.result, item.to) + ' ' + item.to;
      toSpan.appendChild(toFlag);
      toSpan.appendChild(toText);

      left.appendChild(fromSpan);
      left.appendChild(arrow);
      left.appendChild(toSpan);

      // Right block: "3m ago"
      const right = document.createElement('span');
      right.className = 'text-xs text-slate-400 dark:text-slate-500 flex-shrink-0';
      right.textContent = timeAgo(item.ts);

      btn.appendChild(left);
      btn.appendChild(right);
      li.appendChild(btn);
      el.historyList.appendChild(li);
    });
  }

  function renderAll() {
    renderCurrencyButton('from');
    renderCurrencyButton('to');
    renderResult();
    renderStatus();
    renderError();
    renderHistory();
  }

  // ------------------------------------------------------------
  // 10. Dropdown (shared for From / To)
  // ------------------------------------------------------------
  function getDropdown(which) {
    const root = which === 'from' ? el.fromWrap : el.toWrap;
    return {
      root,
      panel:   root.querySelector('.dropdown'),
      list:    root.querySelector('.dropdown-list'),
      search:  root.querySelector('.dropdown-search'),
      trigger: root.querySelector('button.currency-btn'),
    };
  }

  function openDropdown(which) {
    closeAllDropdowns(which);
    const dd = getDropdown(which);
    dd.panel.classList.remove('hidden');
    dd.trigger.setAttribute('aria-expanded', 'true');
    populateDropdown(which, '');
    // Focus search on next frame so it's not clobbered
    requestAnimationFrame(() => {
      dd.search.value = '';
      dd.search.focus();
    });
  }

  function closeDropdown(which) {
    const dd = getDropdown(which);
    dd.panel.classList.add('hidden');
    dd.trigger.setAttribute('aria-expanded', 'false');
  }

  function closeAllDropdowns(except) {
    ['from', 'to'].forEach((k) => {
      if (k !== except) closeDropdown(k);
    });
  }

  function populateDropdown(which, filter) {
    const dd = getDropdown(which);
    const needle = filter.trim().toLowerCase();
    const activeCode = state[which];
    const otherCode  = state[which === 'from' ? 'to' : 'from'];

    const filtered = CURRENCIES.filter((c) => {
      if (!needle) return true;
      return (
        c.code.toLowerCase().indexOf(needle) !== -1 ||
        c.name.toLowerCase().indexOf(needle) !== -1
      );
    });

    dd.list.textContent = '';
    if (filtered.length === 0) {
      const li = document.createElement('li');
      li.className = 'px-4 py-6 text-sm text-center text-slate-500 dark:text-slate-400';
      li.textContent = 'No currencies found';
      dd.list.appendChild(li);
      return;
    }

    filtered.forEach((c) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-code', c.code);
      btn.setAttribute('aria-selected', c.code === activeCode ? 'true' : 'false');
      const isActive = c.code === activeCode;
      const isOther  = c.code === otherCode;
      btn.className =
        'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition focus:outline-none ' +
        (isActive
          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200');

      const flag = document.createElement('span');
      flag.setAttribute('data-role', 'flag');
      flag.className = 'text-xl leading-none';
      flag.textContent = c.flag;

      const body = document.createElement('span');
      body.className = 'flex-1 min-w-0';
      const code = document.createElement('span');
      code.className = 'block font-semibold';
      code.textContent = c.code;
      const name = document.createElement('span');
      name.className = 'block text-xs text-slate-500 dark:text-slate-400 truncate';
      name.textContent = c.name;
      body.appendChild(code);
      body.appendChild(name);

      btn.appendChild(flag);
      btn.appendChild(body);

      if (isOther) {
        const tag = document.createElement('span');
        tag.className = 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500';
        tag.textContent = 'Other side';
        btn.appendChild(tag);
      }
      if (isActive) {
        // checkmark
        const check = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        check.setAttribute('viewBox', '0 0 24 24');
        check.setAttribute('fill', 'none');
        check.setAttribute('stroke', 'currentColor');
        check.setAttribute('stroke-width', '2.5');
        check.setAttribute('stroke-linecap', 'round');
        check.setAttribute('stroke-linejoin', 'round');
        check.setAttribute('class', 'w-4 h-4');
        check.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        path.setAttribute('points', '20 6 9 17 4 12');
        check.appendChild(path);
        btn.appendChild(check);
      }

      li.appendChild(btn);
      dd.list.appendChild(li);
    });
  }

  function selectCurrency(which, code) {
    if (!CURRENCIES_BY_CODE[code]) return;
    // If user picks the same code as the other side, swap instead of collision
    const other = which === 'from' ? 'to' : 'from';
    if (state[other] === code) {
      state[other] = state[which];
      storage.set(STORAGE_KEYS[other], state[other]);
    }
    state[which] = code;
    storage.set(STORAGE_KEYS[which], code);

    closeDropdown(which);
    renderCurrencyButton('from');
    renderCurrencyButton('to');
    renderResult();
    queueHistoryPush();
  }

  // ------------------------------------------------------------
  // 11. History
  // ------------------------------------------------------------
  const queueHistoryPush = debounce(function () {
    if (!state.rates || state.amount <= 0) return;
    const result = convert(state.amount, state.from, state.to, state.rates);
    if (result == null || !isFinite(result)) return;

    const entry = {
      amount: Number(state.amount.toFixed(6)),
      from: state.from,
      to: state.to,
      result: Number(result.toFixed(6)),
      ts: Date.now(),
    };

    // De-dupe against most recent entry with same (amount, from, to)
    const prev = state.history[0];
    if (prev && prev.amount === entry.amount && prev.from === entry.from && prev.to === entry.to) {
      prev.result = entry.result;
      prev.ts = entry.ts;
    } else {
      state.history.unshift(entry);
      if (state.history.length > MAX_HISTORY) {
        state.history = state.history.slice(0, MAX_HISTORY);
      }
    }
    storage.set(STORAGE_KEYS.history, JSON.stringify(state.history));
    renderHistory();
  }, 600);

  function restoreHistory(idx) {
    const item = state.history[idx];
    if (!item) return;
    state.amount = item.amount;
    state.from = item.from;
    state.to = item.to;
    storage.set(STORAGE_KEYS.from, state.from);
    storage.set(STORAGE_KEYS.to, state.to);
    el.amountInput.value = formatInputDisplay(item.amount);
    renderCurrencyButton('from');
    renderCurrencyButton('to');
    renderResult();
  }

  function clearHistory() {
    state.history = [];
    storage.remove(STORAGE_KEYS.history);
    renderHistory();
  }

  // ------------------------------------------------------------
  // 12. Theme
  // ------------------------------------------------------------
  function currentTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  function setTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    storage.set(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    el.themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  // ------------------------------------------------------------
  // 13. Event wiring
  // ------------------------------------------------------------
  const debouncedOnInput = debounce(function () {
    state.amount = parseAmount(el.amountInput.value);
    renderResult();
    queueHistoryPush();
  }, DEBOUNCE_MS);

  function wireAmountInput() {
    el.amountInput.addEventListener('input', function () {
      // Allow only digits, one dot/comma, and commas as separators
      // (We don't mutate the input while typing to avoid caret jumps.)
      debouncedOnInput();
    });
    el.amountInput.addEventListener('focus', function () {
      el.amountInput.select();
    });
    el.amountInput.addEventListener('blur', function () {
      const n = parseAmount(el.amountInput.value);
      state.amount = n;
      el.amountInput.value = n > 0 ? formatInputDisplay(n) : '';
      renderResult();
    });
    el.amountInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        el.amountInput.blur();
      }
    });
  }

  function wireSwap() {
    function doSwap(btn) {
      const tmp = state.from;
      state.from = state.to;
      state.to = tmp;
      storage.set(STORAGE_KEYS.from, state.from);
      storage.set(STORAGE_KEYS.to, state.to);
      btn.classList.add('rotating');
      setTimeout(() => btn.classList.remove('rotating'), 320);
      renderCurrencyButton('from');
      renderCurrencyButton('to');
      renderResult();
      queueHistoryPush();
    }
    if (el.swapBtn) el.swapBtn.addEventListener('click', () => doSwap(el.swapBtn));
    if (el.swapBtnMobile) el.swapBtnMobile.addEventListener('click', () => doSwap(el.swapBtnMobile));
  }

  function wireDropdowns() {
    el.fromBtn.addEventListener('click', function () {
      const isOpen = el.fromBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeDropdown('from'); else openDropdown('from');
    });
    el.toBtn.addEventListener('click', function () {
      const isOpen = el.toBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeDropdown('to'); else openDropdown('to');
    });

    // Delegate list clicks for each side
    ['from', 'to'].forEach((which) => {
      const dd = getDropdown(which);
      dd.list.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-code]');
        if (!btn) return;
        selectCurrency(which, btn.getAttribute('data-code'));
      });
      dd.search.addEventListener('input', function () {
        populateDropdown(which, dd.search.value);
      });
      dd.search.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeDropdown(which);
          dd.trigger.focus();
        } else if (e.key === 'Enter') {
          const first = dd.list.querySelector('[data-code]');
          if (first) {
            e.preventDefault();
            selectCurrency(which, first.getAttribute('data-code'));
          }
        }
      });
    });

    // Click outside to close
    document.addEventListener('click', function (e) {
      if (!el.fromWrap.contains(e.target) && !el.toWrap.contains(e.target)) {
        closeAllDropdowns();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllDropdowns();
    });
  }

  function wireRefresh() {
    el.refreshBtn.addEventListener('click', async function () {
      if (state.loading) return;
      el.refreshIcon.classList.add('spinning');
      await fetchRates({ forceFresh: true });
      el.refreshIcon.classList.remove('spinning');
      renderAll();
    });
    el.retryBtn.addEventListener('click', async function () {
      el.errorBanner.classList.add('hidden');
      await fetchRates({ forceFresh: true });
      renderAll();
    });
  }

  function wireHistory() {
    el.historyList.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-index]');
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (!isNaN(idx)) restoreHistory(idx);
    });
    el.clearHistory.addEventListener('click', clearHistory);
  }

  function wireTheme() {
    el.themeToggle.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
    // Reflect initial aria-pressed
    el.themeToggle.setAttribute(
      'aria-pressed',
      currentTheme() === 'dark' ? 'true' : 'false'
    );
  }

  // Periodically re-render "Xm ago"
  function startTickers() {
    setInterval(function () {
      renderStatus();
      renderError();
      // Re-render history to keep "Xm ago" timestamps fresh
      if (state.history.length) renderHistory();
    }, 30 * 1000);
  }

  // ------------------------------------------------------------
  // 14. Init
  // ------------------------------------------------------------
  async function init() {
    // 1. Seed initial amount from default input value
    state.amount = parseAmount(el.amountInput.value);
    el.amountInput.value = formatInputDisplay(state.amount);

    // 2. Paint static chrome immediately
    renderCurrencyButton('from');
    renderCurrencyButton('to');
    renderHistory();

    // 3. Wire events
    wireAmountInput();
    wireSwap();
    wireDropdowns();
    wireRefresh();
    wireHistory();
    wireTheme();

    // 4. Fetch rates (uses cache if fresh)
    await fetchRates();
    renderAll();

    // 5. Tickers
    startTickers();
  }

  // Kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
