/* ==========================================
   Поток — Telegram Mini App landing
   script.js
   ========================================== */

(function () {
  'use strict';

  /* -----------------------------------------
     1. FAQ accordion (auto-close siblings)
     ----------------------------------------- */
  const faqList = document.getElementById('faq-list');
  if (faqList) {
    const items = faqList.querySelectorAll('.faq');

    items.forEach(function (item) {
      const btn = item.querySelector('.faq__q');
      const answer = item.querySelector('.faq__a');
      if (!btn || !answer) return;

      // Unique id for aria-controls
      const aid = 'faq-a-' + Math.random().toString(36).slice(2, 8);
      answer.id = aid;
      btn.setAttribute('aria-controls', aid);

      btn.addEventListener('click', function () {
        const isOpen = item.classList.contains('is-open');

        // Close all siblings
        items.forEach(function (other) {
          if (other === item) return;
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.faq__q');
          const otherAns = other.querySelector('.faq__a');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        // Toggle current
        if (isOpen) {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* -----------------------------------------
     2. Smooth anchor scrolling with header offset
     ----------------------------------------- */
  const header = document.querySelector('header');
  const headerOffset = function () { return header ? header.offsetHeight + 12 : 0; };

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* -----------------------------------------
     3. IntersectionObserver reveal-on-scroll
     ----------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: show everything
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* -----------------------------------------
     4. Live clock on hero phone mockup (cosmetic)
     ----------------------------------------- */
  const clock = document.querySelector('.phone--hero .tg-time');
  if (clock) {
    const tick = function () {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      clock.textContent = h + ':' + m;
    };
    tick();
    setInterval(tick, 30000);
  }
})();
