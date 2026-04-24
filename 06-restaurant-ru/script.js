/* ============================================================
   Верба · Ресторан — landing page interactions
   ============================================================ */

(function () {
    'use strict';

    /* ---------- 1. Header: opacity on scroll ---------- */
    const header = document.getElementById('siteHeader');
    const onScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 2. Mobile menu toggle ---------- */
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        mobileMenu.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    /* ---------- 3. Smooth anchor scrolling with header offset ---------- */
    const HEADER_OFFSET = 72;
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ---------- 4. IntersectionObserver reveal-on-scroll ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // stagger siblings slightly for a more natural feel
                    const idx = Array.from(entry.target.parentElement?.children || []).indexOf(entry.target);
                    entry.target.style.transitionDelay = Math.min(idx * 60, 300) + 'ms';
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* ---------- 5. Reservation form: date min + validation + success ---------- */
    const form = document.getElementById('reserveForm');
    const success = document.getElementById('reserveSuccess');
    const dateInput = document.getElementById('date');

    // Set min date = today
    if (dateInput) {
        const today = new Date();
        const iso = today.toISOString().split('T')[0];
        dateInput.min = iso;
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^[+()\d\s\-]{7,}$/;

    const markError = (field, hasError) => {
        if (hasError) field.classList.add('has-error');
        else field.classList.remove('has-error');
    };

    if (form) {
        // live-clear errors on input
        form.querySelectorAll('input, select, textarea').forEach((el) => {
            el.addEventListener('input', () => {
                const f = el.closest('.field');
                if (f) markError(f, false);
            });
            el.addEventListener('change', () => {
                const f = el.closest('.field');
                if (f) markError(f, false);
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;

            const name = form.querySelector('#name');
            const phone = form.querySelector('#phone');
            const email = form.querySelector('#email');
            const date = form.querySelector('#date');
            const time = form.querySelector('#time');
            const guests = form.querySelector('#guests');

            // name
            if (!name.value.trim() || name.value.trim().length < 2) {
                markError(name.closest('.field'), true);
                valid = false;
            }

            // phone (required, digits/+/()/-/space, at least 7 chars)
            if (!phone.value.trim() || !PHONE_RE.test(phone.value.trim())) {
                markError(phone.closest('.field'), true);
                valid = false;
            }

            // email (optional, but if present must match)
            if (email.value.trim() && !EMAIL_RE.test(email.value.trim())) {
                markError(email.closest('.field'), true);
                valid = false;
            }

            // date (required, not in the past)
            const dateVal = date.value;
            if (!dateVal) {
                markError(date.closest('.field'), true);
                valid = false;
            } else {
                const picked = new Date(dateVal + 'T00:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (picked < today) {
                    markError(date.closest('.field'), true);
                    valid = false;
                }
            }

            // time
            if (!time.value) {
                markError(time.closest('.field'), true);
                valid = false;
            }

            // guests
            if (!guests.value) {
                markError(guests.closest('.field'), true);
                valid = false;
            }

            if (!valid) {
                // scroll to first error
                const firstError = form.querySelector('.field.has-error input, .field.has-error select');
                if (firstError) firstError.focus();
                return;
            }

            // Success state
            form.classList.add('hidden');
            success.classList.remove('hidden');

            // Reset after 4s
            setTimeout(() => {
                form.reset();
                form.querySelectorAll('.field').forEach((f) => markError(f, false));
                success.classList.add('hidden');
                form.classList.remove('hidden');
            }, 4000);
        });
    }

    /* ---------- 6. Year in footer (if needed) ---------- */
    // Year is already hardcoded to 2026 per spec; no dynamic update.

})();
