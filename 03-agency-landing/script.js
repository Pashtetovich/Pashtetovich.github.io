/* ==========================================================================
   Kindred&Co — vanilla JS behaviors
   - Hero word reveal on load
   - IntersectionObserver scroll reveals
   - Smooth anchor scrolling (supplement to CSS scroll-behavior)
   - Custom cursor follower (non-touch only)
   - Live clock for NYC in footer
   - Current year
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* --------------------------- Hero word reveal --------------------------- */
  // Add .loaded on the body once the window has loaded so the hero headline
  // animates in cleanly (even if fonts take a moment to settle).
  window.addEventListener("load", () => {
    // Tiny delay so users see the motion begin after first paint.
    requestAnimationFrame(() => document.body.classList.add("loaded"));
  });
  // Fallback in case the load event already fired (fast caches).
  if (document.readyState === "complete") {
    requestAnimationFrame(() => document.body.classList.add("loaded"));
  }

  /* --------------------------- Scroll reveal ------------------------------ */
  const revealTargets = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  /* --------------------------- Smooth anchor scroll ----------------------- */
  // Browser handles this via `scroll-behavior: smooth`, but we also offset for
  // the fixed header so the target title isn't hidden beneath it.
  const header = document.querySelector("header");
  const headerOffset = () => (header ? header.offsetHeight + 8 : 0);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  });

  /* --------------------------- Custom cursor ------------------------------ */
  const cursor = document.getElementById("cursor");
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursor && isFinePointer && !prefersReducedMotion) {
    let mouseX = 0;
    let mouseY = 0;
    let curX = 0;
    let curY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Simple lerp for smooth trailing
    const tick = () => {
      curX += (mouseX - curX) * 0.2;
      curY += (mouseY - curY) * 0.2;
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    // Hide when pointer leaves the window
    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });

    // Scale / color shift on hoverable elements
    const hoverables = document.querySelectorAll(
      'a, button, [data-cursor]'
    );
    hoverables.forEach((el) => {
      const mode = el.getAttribute("data-cursor") || "hover";
      el.addEventListener("mouseenter", () => {
        cursor.classList.remove("is-hover", "is-case");
        cursor.classList.add(mode === "case" ? "is-case" : "is-hover");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover", "is-case");
      });
    });
  }

  /* --------------------------- Live clock (NYC) --------------------------- */
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    });

    const updateClock = () => {
      // Produce strings like "3:42pm" — lowercased, no space.
      const parts = formatter.formatToParts(new Date());
      let hour = "", minute = "", dayPeriod = "";
      for (const p of parts) {
        if (p.type === "hour") hour = p.value;
        else if (p.type === "minute") minute = p.value;
        else if (p.type === "dayPeriod") dayPeriod = p.value;
      }
      clockEl.textContent = `${hour}:${minute}${dayPeriod.toLowerCase().replace(/\s/g, "")}`;
    };

    updateClock();
    // Update every 15s — keeps minutes fresh without spamming reflows.
    setInterval(updateClock, 15000);
  }

  /* --------------------------- Current year ------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
