/* ─────────────────────────────────────────
   Designing for Impact — client logic
   Countdown · accordions · reveal · smooth scroll
───────────────────────────────────────── */

(() => {
  'use strict';

  /* ───────────────────── 1. Countdown ───────────────────── */

  // Target: ~6 days from page load, snapped to end-of-day in user's timezone
  // so the countdown is meaningful per-visitor and respects local timezone.
  const COUNTDOWN_DAYS_AHEAD = 6;

  const target = (() => {
    const d = new Date();
    d.setDate(d.getDate() + COUNTDOWN_DAYS_AHEAD);
    d.setHours(23, 59, 59, 0);  // local midnight-ish
    return d;
  })();

  const countdownGroups = document.querySelectorAll('[data-countdown]');

  const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

  function paintCountdown() {
    const diff = target.getTime() - Date.now();

    const totalSec = Math.max(0, Math.floor(diff / 1000));
    const days    = Math.floor(totalSec / 86400);
    const hours   = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    countdownGroups.forEach((group) => {
      const d = group.querySelector('[data-d]');
      const h = group.querySelector('[data-h]');
      const m = group.querySelector('[data-m]');
      const s = group.querySelector('[data-s]');
      if (d) d.textContent = pad(days);
      if (h) h.textContent = pad(hours);
      if (m) m.textContent = pad(minutes);
      if (s) s.textContent = pad(seconds);
    });
  }

  if (countdownGroups.length) {
    paintCountdown();
    setInterval(paintCountdown, 1000);
  }

  /* ───────────────────── 2. Custom accordion (curriculum) ───────────────────── */

  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close siblings
      accordions.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          const t = other.querySelector('.accordion-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ───────────────────── 3. Native <details> FAQ: auto-close siblings ───────────────────── */

  const faqList = document.getElementById('faq-list');
  if (faqList) {
    const faqs = faqList.querySelectorAll('details.faq');
    faqs.forEach((d) => {
      d.addEventListener('toggle', () => {
        if (d.open) {
          faqs.forEach((other) => {
            if (other !== d) other.open = false;
          });
        }
      });
    });
  }

  /* ───────────────────── 4. Reveal on scroll ───────────────────── */

  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback — just show them
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ───────────────────── 5. Smooth anchor scrolling (with header offset) ───────────────────── */

  const header = document.querySelector('header');

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const el = document.querySelector(href);
      if (!el) return;

      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 8;
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  });

  /* ───────────────────── 6. Footer year ───────────────────── */

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
