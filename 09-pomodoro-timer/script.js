/* ============================================================
 * Pomodoro Timer + Task Tracker
 * Vanilla JS, single-file app logic.
 *
 * Architecture:
 *   state   -> plain object, persisted in localStorage
 *   render()-> pure-ish: maps state to DOM
 *   actions -> event handlers that mutate state + render
 *
 * Timer accuracy: we compute remaining time from a stored
 * startTimestamp + Date.now(), so backgrounded tabs stay correct.
 * requestAnimationFrame drives the visual tick; a 1s fallback
 * interval ensures updates continue while tab is unfocused.
 * ============================================================ */

(() => {
  'use strict';

  // ----------------------------------------------------------
  // Constants
  // ----------------------------------------------------------
  const LS_KEYS = {
    settings: 'pomodoro.settings.v1',
    tasks:    'pomodoro.tasks.v1',
    stats:    'pomodoro.stats.v1',        // per-day stats
    session:  'pomodoro.session.v1',      // current running session (survives reload)
  };

  const MODE = Object.freeze({ FOCUS: 'focus', SHORT: 'short', LONG: 'long' });

  const MODE_META = {
    [MODE.FOCUS]: { label: 'Focus',       title: 'Focus',       icon: '#e11d48' },
    [MODE.SHORT]: { label: 'Short Break', title: 'Short Break', icon: '#0d9488' },
    [MODE.LONG]:  { label: 'Long Break',  title: 'Long Break',  icon: '#d97706' },
  };

  const RING_CIRCUMFERENCE = 2 * Math.PI * 92; // r=92 in viewBox

  const DEFAULT_SETTINGS = {
    focus: 25,
    short: 5,
    long:  15,
    autoAdvance: true,
    sound: true,
    notify: false,
    dark: null,            // null = follow system preference until user toggles
    sessionsBeforeLong: 4,
  };

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------
  const state = {
    settings: { ...DEFAULT_SETTINGS },
    mode: MODE.FOCUS,
    running: false,
    startTimestamp: null,     // ms epoch
    endTimestamp: null,       // ms epoch
    pausedRemaining: null,    // ms — if paused, how much time is left
    completedFocusSessions: 0,// counts focuses towards next long break
    tasks: [],                // { id, title, pomos, completed, active }
    stats: { date: todayKey(), minutes: 0, pomodoros: 0, tasksCompleted: 0 },
  };

  // ----------------------------------------------------------
  // DOM refs
  // ----------------------------------------------------------
  const el = {
    timeDisplay:   document.getElementById('time-display'),
    modeLabel:     document.getElementById('mode-label'),
    progressRing:  document.getElementById('progress-ring'),
    playBtn:       document.getElementById('play-pause-btn'),
    playIcon:      document.getElementById('play-icon'),
    pauseIcon:     document.getElementById('pause-icon'),
    resetBtn:      document.getElementById('reset-btn'),
    skipBtn:       document.getElementById('skip-btn'),
    sessionCounter:document.getElementById('session-counter'),
    activeBanner:  document.getElementById('active-task-banner'),
    modeTabs:      document.querySelectorAll('.mode-tab'),
    taskForm:      document.getElementById('task-form'),
    taskInput:     document.getElementById('task-input'),
    taskList:      document.getElementById('task-list'),
    tasksEmpty:    document.getElementById('tasks-empty'),
    clearCompleted:document.getElementById('clear-completed-btn'),
    statMinutes:   document.getElementById('stat-minutes'),
    statPomodoros: document.getElementById('stat-pomodoros'),
    statTasks:     document.getElementById('stat-tasks'),
    settingsBtn:   document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    settingsClose: document.getElementById('close-settings-btn'),
    settingsBackdrop: document.getElementById('settings-backdrop'),
    sFocus:  document.getElementById('setting-focus'),
    sShort:  document.getElementById('setting-short'),
    sLong:   document.getElementById('setting-long'),
    sAuto:   document.getElementById('setting-auto'),
    sSound:  document.getElementById('setting-sound'),
    sNotify: document.getElementById('setting-notify'),
    sDark:   document.getElementById('setting-dark'),
    resetDataBtn: document.getElementById('reset-data-btn'),
    favicon: document.getElementById('favicon'),
  };

  // Configure SVG ring dasharray
  el.progressRing.style.strokeDasharray = String(RING_CIRCUMFERENCE);

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function fmtTime(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function modeDurationMs(mode = state.mode) {
    return state.settings[mode] * 60 * 1000;
  }

  function uuid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  // ----------------------------------------------------------
  // Persistence
  // ----------------------------------------------------------
  function loadAll() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEYS.settings) || 'null');
      if (s && typeof s === 'object') state.settings = { ...DEFAULT_SETTINGS, ...s };
    } catch (_) {}

    try {
      const t = JSON.parse(localStorage.getItem(LS_KEYS.tasks) || '[]');
      if (Array.isArray(t)) state.tasks = t;
    } catch (_) {}

    try {
      const st = JSON.parse(localStorage.getItem(LS_KEYS.stats) || 'null');
      if (st && st.date === todayKey()) {
        state.stats = { ...state.stats, ...st };
      } else {
        // New day — keep the shape, reset counters
        state.stats = { date: todayKey(), minutes: 0, pomodoros: 0, tasksCompleted: 0 };
      }
    } catch (_) {}

    // Restore an interrupted session (optional)
    try {
      const sess = JSON.parse(localStorage.getItem(LS_KEYS.session) || 'null');
      if (sess && sess.mode && typeof sess.endTimestamp === 'number') {
        const remaining = sess.endTimestamp - Date.now();
        if (remaining > 0 && sess.running) {
          state.mode = sess.mode;
          state.startTimestamp = sess.startTimestamp;
          state.endTimestamp = sess.endTimestamp;
          state.running = true;
          state.pausedRemaining = null;
        } else if (sess.paused && typeof sess.pausedRemaining === 'number' && sess.pausedRemaining > 0) {
          state.mode = sess.mode;
          state.pausedRemaining = sess.pausedRemaining;
          state.running = false;
        }
        if (typeof sess.completedFocusSessions === 'number') {
          state.completedFocusSessions = sess.completedFocusSessions;
        }
      }
    } catch (_) {}
  }

  function saveSettings() { localStorage.setItem(LS_KEYS.settings, JSON.stringify(state.settings)); }
  function saveTasks()    { localStorage.setItem(LS_KEYS.tasks,    JSON.stringify(state.tasks));    }
  function saveStats()    { localStorage.setItem(LS_KEYS.stats,    JSON.stringify(state.stats));    }
  function saveSession() {
    const payload = {
      mode: state.mode,
      running: state.running,
      paused: !state.running && state.pausedRemaining != null,
      pausedRemaining: state.pausedRemaining,
      startTimestamp: state.startTimestamp,
      endTimestamp: state.endTimestamp,
      completedFocusSessions: state.completedFocusSessions,
    };
    localStorage.setItem(LS_KEYS.session, JSON.stringify(payload));
  }

  // ----------------------------------------------------------
  // Timer logic
  // ----------------------------------------------------------
  let rafId = null;
  let intervalId = null;

  function remainingMs() {
    if (state.running && state.endTimestamp) {
      return state.endTimestamp - Date.now();
    }
    if (state.pausedRemaining != null) return state.pausedRemaining;
    return modeDurationMs();
  }

  function totalMs() {
    // If paused, we base total on the original mode duration to compute progress correctly.
    return modeDurationMs();
  }

  function startTimer() {
    if (state.running) return;

    const resumeFrom = state.pausedRemaining != null ? state.pausedRemaining : modeDurationMs();
    state.startTimestamp = Date.now();
    state.endTimestamp = Date.now() + resumeFrom;
    state.pausedRemaining = null;
    state.running = true;
    saveSession();
    render();
    startTicker();
  }

  function pauseTimer() {
    if (!state.running) return;
    state.pausedRemaining = Math.max(0, state.endTimestamp - Date.now());
    state.running = false;
    state.startTimestamp = null;
    state.endTimestamp = null;
    stopTicker();
    saveSession();
    render();
  }

  function resetTimer() {
    stopTicker();
    state.running = false;
    state.startTimestamp = null;
    state.endTimestamp = null;
    state.pausedRemaining = null;
    saveSession();
    render();
  }

  function switchMode(newMode, { autoStart = false } = {}) {
    state.mode = newMode;
    state.running = false;
    state.startTimestamp = null;
    state.endTimestamp = null;
    state.pausedRemaining = null;
    applyModeClass();
    saveSession();
    render();
    if (autoStart) startTimer();
  }

  function startTicker() {
    stopTicker();
    const tickRaf = () => {
      tick();
      rafId = requestAnimationFrame(tickRaf);
    };
    rafId = requestAnimationFrame(tickRaf);
    // Fallback ticker so that a backgrounded tab still progresses via timeouts
    intervalId = setInterval(tick, 1000);
  }

  function stopTicker() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function tick() {
    if (!state.running) return;
    const ms = remainingMs();
    if (ms <= 0) {
      onSessionComplete();
      return;
    }
    updateTimeDisplay(ms);
    updateRing(ms);
    updateDocTitle(ms);
  }

  // ----------------------------------------------------------
  // Session completion
  // ----------------------------------------------------------
  function onSessionComplete() {
    stopTicker();
    state.running = false;
    const finishedMode = state.mode;

    // Update today's stats if focus session
    if (finishedMode === MODE.FOCUS) {
      ensureStatsDate();
      state.stats.pomodoros += 1;
      state.stats.minutes += state.settings.focus;
      state.completedFocusSessions += 1;

      // Increment pomos for active task
      const active = state.tasks.find(t => t.active);
      if (active) {
        active.pomos = (active.pomos || 0) + 1;
        saveTasks();
      }
      saveStats();
    }

    // Notification + sound
    playChime(finishedMode);
    sendNotification(finishedMode);

    // Decide next mode
    let nextMode;
    if (finishedMode === MODE.FOCUS) {
      nextMode = (state.completedFocusSessions % state.settings.sessionsBeforeLong === 0)
        ? MODE.LONG : MODE.SHORT;
    } else {
      nextMode = MODE.FOCUS;
    }

    state.mode = nextMode;
    state.startTimestamp = null;
    state.endTimestamp = null;
    state.pausedRemaining = null;

    applyModeClass();
    saveSession();
    render();

    if (state.settings.autoAdvance) {
      // small delay so chime + UI feel good
      setTimeout(() => startTimer(), 700);
    }
  }

  function ensureStatsDate() {
    if (state.stats.date !== todayKey()) {
      state.stats = { date: todayKey(), minutes: 0, pomodoros: 0, tasksCompleted: 0 };
      saveStats();
    }
  }

  // ----------------------------------------------------------
  // Audio (Web Audio programmatic chime)
  // ----------------------------------------------------------
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) audioCtx = new Ctor();
    }
    return audioCtx;
  }

  function playChime(mode) {
    if (!state.settings.sound) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    // Unlock in browsers that suspend until user gesture
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    // Small chord: two tones, pleasant bell-ish
    const now = ctx.currentTime;
    const freqs = mode === MODE.FOCUS ? [660, 880, 1175] : [523, 659, 784];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = now + i * 0.08;
      const dur = 0.9;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }

  function sendNotification(finishedMode) {
    if (!state.settings.notify) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const msg = finishedMode === MODE.FOCUS
      ? 'Focus session done — time for a break.'
      : 'Break over — ready to focus?';
    try {
      new Notification('Pomodoro', { body: msg, silent: true });
    } catch (_) { /* ignore */ }
  }

  // ----------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------
  function render() {
    updateTimeDisplay(remainingMs());
    updateRing(remainingMs());
    updateDocTitle(remainingMs());
    updateModeTabs();
    updateControls();
    updateSessionCounter();
    renderTasks();
    renderStats();
    updateActiveTaskBanner();
    updateFavicon();
  }

  function updateTimeDisplay(ms) {
    el.timeDisplay.textContent = fmtTime(ms);
  }

  function updateRing(ms) {
    const total = totalMs();
    const pct = Math.max(0, Math.min(1, ms / total));
    const offset = RING_CIRCUMFERENCE * (1 - pct);
    el.progressRing.style.strokeDashoffset = String(offset);
  }

  function updateDocTitle(ms) {
    const meta = MODE_META[state.mode];
    if (state.running) {
      document.title = `⏱ ${fmtTime(ms)} · ${meta.title}`;
    } else if (state.pausedRemaining != null) {
      document.title = `⏸ ${fmtTime(ms)} · ${meta.title}`;
    } else {
      document.title = `Pomodoro — ${meta.title}`;
    }
  }

  function updateModeTabs() {
    el.modeTabs.forEach(tab => {
      const isActive = tab.dataset.mode === state.mode;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    el.modeLabel.textContent = MODE_META[state.mode].label;
  }

  function updateControls() {
    if (state.running) {
      el.playIcon.classList.add('hidden');
      el.pauseIcon.classList.remove('hidden');
      el.playBtn.setAttribute('aria-label', 'Pause timer');
    } else {
      el.playIcon.classList.remove('hidden');
      el.pauseIcon.classList.add('hidden');
      el.playBtn.setAttribute('aria-label', 'Start timer');
    }
  }

  function updateSessionCounter() {
    const current = (state.completedFocusSessions % state.settings.sessionsBeforeLong) + 1;
    el.sessionCounter.textContent = `Session ${current} of ${state.settings.sessionsBeforeLong}`;
  }

  function renderTasks() {
    el.taskList.innerHTML = '';
    if (!state.tasks.length) {
      el.tasksEmpty.classList.remove('hidden');
      return;
    }
    el.tasksEmpty.classList.add('hidden');

    const frag = document.createDocumentFragment();
    for (const task of state.tasks) {
      const li = document.createElement('li');
      li.className = `task-item ${task.active ? 'active' : ''} ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <button class="task-checkbox ${task.completed ? 'checked' : ''}" aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
        <span class="task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</span>
        <span class="task-pomos" title="Completed pomodoros">${'🍅'.repeat(Math.min(task.pomos || 0, 5))}${task.pomos > 5 ? ` ×${task.pomos}` : task.pomos ? '' : ''}</span>
        <button class="task-delete" aria-label="Delete task">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      `;
      frag.appendChild(li);
    }
    el.taskList.appendChild(frag);
  }

  function renderStats() {
    ensureStatsDate();
    el.statMinutes.textContent   = String(state.stats.minutes);
    el.statPomodoros.textContent = String(state.stats.pomodoros);
    el.statTasks.textContent     = String(state.stats.tasksCompleted);
  }

  function updateActiveTaskBanner() {
    const active = state.tasks.find(t => t.active);
    if (active) {
      el.activeBanner.innerHTML = `<span class="opacity-80">Now working on:</span> <span class="font-medium text-slate-700 dark:text-slate-200">${escapeHtml(active.title)}</span>`;
    } else {
      el.activeBanner.innerHTML = '<span class="opacity-60">No task selected</span>';
    }
  }

  function updateFavicon() {
    const color = MODE_META[state.mode].icon.replace('#', '%23');
    const svg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='${color}'/%3E%3C/svg%3E`;
    el.favicon.href = svg;
  }

  function applyModeClass() {
    document.documentElement.classList.remove('mode-focus', 'mode-short', 'mode-long');
    document.documentElement.classList.add(`mode-${state.mode}`);
  }

  function applyDarkMode() {
    let isDark;
    if (state.settings.dark === null) {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = Boolean(state.settings.dark);
    }
    document.documentElement.classList.toggle('dark', isDark);
  }

  // ----------------------------------------------------------
  // Tasks
  // ----------------------------------------------------------
  function addTask(title) {
    title = title.trim();
    if (!title) return;
    const task = {
      id: uuid(),
      title,
      pomos: 0,
      completed: false,
      active: false,
    };
    // First task is auto-active
    if (!state.tasks.some(t => t.active && !t.completed)) {
      task.active = true;
      state.tasks.forEach(t => t.active = false);
    }
    state.tasks.push(task);
    saveTasks();
    renderTasks();
    updateActiveTaskBanner();
  }

  function toggleTaskCompleted(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const wasCompleted = task.completed;
    task.completed = !task.completed;
    if (task.completed) {
      task.active = false;
      ensureStatsDate();
      state.stats.tasksCompleted += 1;
      saveStats();
    } else if (wasCompleted) {
      // undoing completion — decrement counter (not below zero)
      ensureStatsDate();
      state.stats.tasksCompleted = Math.max(0, state.stats.tasksCompleted - 1);
      saveStats();
    }
    saveTasks();
    render();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  function setActiveTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task || task.completed) return;
    state.tasks.forEach(t => t.active = (t.id === id));
    saveTasks();
    render();
  }

  function clearCompleted() {
    state.tasks = state.tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }

  // ----------------------------------------------------------
  // Settings
  // ----------------------------------------------------------
  function openSettings() {
    // Hydrate inputs
    el.sFocus.value  = state.settings.focus;
    el.sShort.value  = state.settings.short;
    el.sLong.value   = state.settings.long;
    el.sAuto.checked  = state.settings.autoAdvance;
    el.sSound.checked = state.settings.sound;
    el.sNotify.checked= Boolean(state.settings.notify);
    el.sDark.checked  = document.documentElement.classList.contains('dark');
    el.settingsModal.classList.add('open');
  }

  function closeSettings() {
    el.settingsModal.classList.remove('open');
  }

  function commitSettings() {
    const focus = clampInt(el.sFocus.value, 1, 60, DEFAULT_SETTINGS.focus);
    const short = clampInt(el.sShort.value, 1, 30, DEFAULT_SETTINGS.short);
    const long  = clampInt(el.sLong.value,  1, 60, DEFAULT_SETTINGS.long);

    const durationsChanged =
      focus !== state.settings.focus ||
      short !== state.settings.short ||
      long  !== state.settings.long;

    state.settings.focus = focus;
    state.settings.short = short;
    state.settings.long  = long;
    state.settings.autoAdvance = el.sAuto.checked;
    state.settings.sound       = el.sSound.checked;

    // Notifications require permission
    const wantsNotify = el.sNotify.checked;
    if (wantsNotify && typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        state.settings.notify = true;
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          state.settings.notify = (p === 'granted');
          el.sNotify.checked = state.settings.notify;
          saveSettings();
        });
      } else {
        state.settings.notify = false;
        el.sNotify.checked = false;
      }
    } else {
      state.settings.notify = false;
    }

    state.settings.dark = el.sDark.checked;
    applyDarkMode();

    // If durations changed and we're idle, refresh visible time
    if (durationsChanged && !state.running && state.pausedRemaining == null) {
      updateTimeDisplay(modeDurationMs());
      updateRing(modeDurationMs());
      updateDocTitle(modeDurationMs());
    }

    saveSettings();
  }

  function clampInt(v, min, max, fallback) {
    const n = parseInt(v, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function resetAllData() {
    if (!confirm('Reset all data? Tasks, stats, and settings will be cleared.')) return;
    Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
    state.settings = { ...DEFAULT_SETTINGS };
    state.tasks = [];
    state.stats = { date: todayKey(), minutes: 0, pomodoros: 0, tasksCompleted: 0 };
    state.mode = MODE.FOCUS;
    state.running = false;
    state.pausedRemaining = null;
    state.startTimestamp = null;
    state.endTimestamp = null;
    state.completedFocusSessions = 0;
    stopTicker();
    applyModeClass();
    applyDarkMode();
    closeSettings();
    render();
  }

  // ----------------------------------------------------------
  // Utils
  // ----------------------------------------------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----------------------------------------------------------
  // Event binding
  // ----------------------------------------------------------
  function bind() {
    // Mode tabs
    el.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        if (mode === state.mode && !state.running && state.pausedRemaining == null) return;
        switchMode(mode);
      });
    });

    // Play / Pause
    el.playBtn.addEventListener('click', () => {
      // Unlock audio context on first user gesture
      const ctx = getAudioCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (state.running) pauseTimer(); else startTimer();
    });

    // Reset
    el.resetBtn.addEventListener('click', () => resetTimer());

    // Skip — behaves as "complete this session now"
    el.skipBtn.addEventListener('click', () => {
      if (state.running || state.pausedRemaining != null) {
        onSessionComplete();
      } else {
        // If idle, just move to the next mode in rotation without crediting stats
        const next = state.mode === MODE.FOCUS ? MODE.SHORT : MODE.FOCUS;
        switchMode(next);
      }
    });

    // Task form
    el.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(el.taskInput.value);
      el.taskInput.value = '';
      el.taskInput.focus();
    });

    // Task list — delegated click
    el.taskList.addEventListener('click', (e) => {
      const li = e.target.closest('.task-item');
      if (!li) return;
      const id = li.dataset.id;
      if (e.target.closest('.task-checkbox')) {
        toggleTaskCompleted(id);
      } else if (e.target.closest('.task-delete')) {
        deleteTask(id);
      } else if (e.target.closest('.task-title') || e.target === li) {
        setActiveTask(id);
      }
    });

    el.clearCompleted.addEventListener('click', clearCompleted);

    // Settings
    el.settingsBtn.addEventListener('click', openSettings);
    el.settingsClose.addEventListener('click', closeSettings);
    el.settingsBackdrop.addEventListener('click', closeSettings);

    // Auto-commit settings changes (live feedback)
    [el.sFocus, el.sShort, el.sLong].forEach(input => {
      input.addEventListener('change', commitSettings);
    });
    [el.sAuto, el.sSound, el.sNotify, el.sDark].forEach(input => {
      input.addEventListener('change', commitSettings);
    });

    el.resetDataBtn.addEventListener('click', resetAllData);

    // Keyboard
    document.addEventListener('keydown', (e) => {
      // ignore when typing in inputs
      if (e.target.matches('input, textarea')) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (state.running) pauseTimer(); else startTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        resetTimer();
      } else if (e.key === 'Escape') {
        closeSettings();
      }
    });

    // React to system dark mode only when user hasn't set a preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (state.settings.dark === null) applyDarkMode();
      });
    }

    // Visibility — ensure UI resync when tab comes back
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tick();
    });

    // Midnight rollover guard
    setInterval(() => {
      if (state.stats.date !== todayKey()) {
        state.stats = { date: todayKey(), minutes: 0, pomodoros: 0, tasksCompleted: 0 };
        state.completedFocusSessions = 0;
        saveStats();
        renderStats();
        updateSessionCounter();
      }
    }, 60 * 1000);
  }

  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------
  function init() {
    loadAll();
    applyDarkMode();
    applyModeClass();
    bind();
    render();
    if (state.running) startTicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
