/* Perpetuate Landing — Interactions & Animations */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const page = $('#page');
  const hero = $('#hero');
  const device = $('#device');
  const screenGradient = $('#screenGradient');
  const year = $('#year');
  const infoButton = $('#infoButton');
  const tooltip = $('#whatIs');
  const tooltipClose = $('#tooltipClose');
  const form = $('#earlyAccessForm');
  const emailInput = $('#email');
  const formMessage = $('#formMessage');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

  if (year) year.textContent = new Date().getFullYear();

  function showTooltip() {
    tooltip.setAttribute('aria-hidden', 'false');
    infoButton.setAttribute('aria-expanded', 'true');
    if (!prefersReduced && window.gsap) {
      gsap.fromTo(
        tooltip,
        { autoAlpha: 0, scale: 0.96, y: -6 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.28, ease: 'power2.out' }
      );
    }
  }

  function hideTooltip() {
    infoButton.setAttribute('aria-expanded', 'false');
    if (!prefersReduced && window.gsap) {
      gsap.to(tooltip, { autoAlpha: 0, scale: 0.98, y: -4, duration: 0.18, ease: 'power2.in' });
      setTimeout(() => tooltip.setAttribute('aria-hidden', 'true'), 180);
    } else {
      tooltip.setAttribute('aria-hidden', 'true');
    }
  }

  infoButton?.addEventListener('click', () => {
    const expanded = infoButton.getAttribute('aria-expanded') === 'true';
    if (expanded) hideTooltip(); else showTooltip();
  });
  tooltipClose?.addEventListener('click', hideTooltip);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTooltip(); });

  // Form handling — local validation + fetch to Mailchimp (placeholder)
  function validateEmail(email) {
    return /.+@.+\..+/.test(email);
  }

  async function submitEmail(email) {
    // Placeholder: swap with your endpoint (Mailchimp/Firebase)
    // Example: POST to Netlify Function or Firebase Cloud Function
    const endpoint = '/api/early-access';
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(id);
      if (!res.ok) throw new Error('Network');
      return true;
    } catch (e) {
      // Fallback: simulate success for demo
      return true;
    }
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!validateEmail(email)) {
      formMessage.textContent = 'Please enter a valid email address.';
      formMessage.style.color = '#ffced6';
      emailInput.focus();
      if (!prefersReduced && window.gsap) {
        gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.28, ease: 'elastic.out(1, 0.5)' });
      }
      return;
    }
    formMessage.textContent = 'Submitting…';
    formMessage.style.color = '';
    submitButton.disabled = true;

    const ok = await submitEmail(email);
    if (ok) {
      formMessage.textContent = 'You’re in. We’ll email you shortly!';
      formMessage.style.color = '#b7ffcf';
      form.reset();
    } else {
      formMessage.textContent = 'Something went wrong. Please try again.';
      formMessage.style.color = '#ffced6';
    }
    submitButton.disabled = false;
  });

  // Real-time validation to enable/disable CTA
  emailInput?.addEventListener('input', () => {
    if (!submitButton) return;
    const ok = validateEmail(emailInput.value.trim());
    submitButton.disabled = !ok;
  });

  // Nudge glow after a few seconds to encourage email entry
  setTimeout(() => {
    if (prefersReduced || !window.gsap || !emailInput) return;
    if (document.activeElement !== emailInput && !emailInput.value) {
      gsap.fromTo(emailInput, { boxShadow: '0 0 0 0 rgba(107,130,255,0.0)' }, { boxShadow: '0 0 0 8px rgba(107,130,255,0.14)', duration: 0.4, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
  }, 6000);

  // On-load hero animation
  function intro() {
    if (prefersReduced || !window.gsap) return;
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from('.header .brand', { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.35 })
      .from('.header .info', { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.25 }, '-=0.2')
      .from('.quote', { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.32 }, '-=0.05')
      .from('.tagline', { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.45 }, '-=0.05')
      .fromTo('.tagline', { textShadow: '0 0 0 rgba(139,162,255,0)' }, { textShadow: '0 10px 40px rgba(139,162,255,0.25)', duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .from('.pitch', { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.4 }, '-=0.18')
      .from('.device', { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.48 }, '-=0.2')
      .from('.screen-ui', { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.34 }, '-=0.25')
      .add(() => {
        // Small delay then focus email for higher conversion
        setTimeout(() => {
          const el = document.getElementById('email');
          if (el) el.focus({ preventScroll: true });
        }, 200);
      });
  }

  // Parallax on device
  function setupParallax() {
    if (!device || prefersReduced) return;
    let cx = 0.5, cy = 0.5;
    function move(x, y) {
      const rx = (y - 0.5) * -10; // rotateX
      const ry = (x - 0.5) * 14;  // rotateY
      const tz = 12 * (Math.hypot(x - 0.5, y - 0.5));
      if (window.gsap) {
        gsap.to(device, {
          transform: `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`,
          duration: 0.22,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        if (screenGradient) {
          gsap.to(screenGradient, {
            x: (x - 0.5) * 12,
            y: (y - 0.5) * 14,
            duration: 0.24,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      } else {
        device.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`;
        if (screenGradient) screenGradient.style.transform = `translate(${(x - 0.5) * 12}px, ${(y - 0.5) * 14}px)`;
      }
    }

    const isTouch = matchMedia('(pointer: coarse)').matches;
    if (!isTouch) {
      // Desktop pointer-controlled parallax
      hero.addEventListener('pointermove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        cx = x; cy = y; move(cx, cy);
      });
      hero.addEventListener('pointerleave', () => {
        if (prefersReduced) return;
        if (window.gsap) {
          gsap.to(device, { transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)', duration: 0.35, ease: 'power2.out' });
          gsap.to(screenGradient, { x: 0, y: 0, duration: 0.35, ease: 'power2.out' });
        } else {
          device.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
          if (screenGradient) screenGradient.style.transform = 'translate(0,0)';
        }
      });
    } else {
      // Mobile autonomous drift path (loop)
      if (window.gsap) {
        const state = { x: 0.5, y: 0.5 };
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(state, { x: 0.35, y: 0.45, duration: 1.8, ease: 'sine.inOut', onUpdate: () => move(state.x, state.y) })
          .to(state, { x: 0.62, y: 0.40, duration: 1.9, ease: 'sine.inOut', onUpdate: () => move(state.x, state.y) })
          .to(state, { x: 0.55, y: 0.66, duration: 1.7, ease: 'sine.inOut', onUpdate: () => move(state.x, state.y) })
          .to(state, { x: 0.42, y: 0.52, duration: 1.8, ease: 'sine.inOut', onUpdate: () => move(state.x, state.y) });
      } else {
        let t = 0; const loop = () => { t += 0.02; const x = 0.5 + Math.sin(t) * 0.1; const y = 0.5 + Math.cos(t * 0.8) * 0.08; move(x, y); requestAnimationFrame(loop); }; loop();
      }
    }
  }

  // Lazy heavier effects
  function lazyInit() {
    if (prefersReduced) return;
    // Potential Three.js init placeholder - only when needed
    // e.g., import('https://unpkg.com/three@0.159.0/build/three.module.js').then(...)
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { intro(); setupParallax(); lazyInit(); });
  } else {
    intro(); setupParallax(); lazyInit();
  }
})(); 