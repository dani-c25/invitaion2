/* ═══════════════════════════════════════════
   ROYAL WEDDING — script.js
   Ahmad & Samara — 16 Août 2026
═══════════════════════════════════════════ */

const WEDDING_DATE = new Date('2026-08-16T17:30:00');
const APPS_SCRIPT_URL = ''; // Ajouter l'URL Apps Script si nécessaire

/* ─── SPLASH SCREEN ─── */
(function initSplash() {
  const splash = document.getElementById('splash');
  const btn    = document.getElementById('splash-btn');
  const main   = document.getElementById('main-content');
  const nav    = document.getElementById('liquid-nav');

  if (!splash || !btn) return;

  // Lock scroll completely while splash is visible
  document.body.style.overflow = 'hidden';

  btn.addEventListener('click', openSplash);
  btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openSplash(); });

  function openSplash() {
    splash.classList.add('opening');

    setTimeout(() => {
      splash.style.display = 'none';
      main.classList.remove('hidden');
      nav.classList.remove('hidden');
      nav.classList.add('visible');
      document.body.style.overflow = '';
      initCountdown();
      initScrollAnimations();
      initParallax();
    }, 1000);
  }
})();

/* ─── COUNTDOWN ─── */
function initCountdown() {
  const units = {
    days:    document.getElementById('cd-days'),
    hours:   document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds')
  };

  const prev = { days: -1, hours: -1, minutes: -1, seconds: -1 };

  function getTimeLeft() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000)
    };
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function animateUnit(el, newVal) {
    const track = el.querySelector('.countdown-track');
    if (!track) return;

    const old = track.querySelector('.countdown-slide.active');
    if (old) {
      old.classList.remove('active');
      old.classList.add('slide-out-bottom');
      setTimeout(() => old.remove(), 500);
    }

    const slide = document.createElement('div');
    slide.className = 'countdown-slide slide-in-top';
    slide.textContent = pad(newVal);
    track.appendChild(slide);

    requestAnimationFrame(() => {
      slide.classList.add('active');
    });
  }

  function tick() {
    const t = getTimeLeft();
    if (t.days    !== prev.days)    { animateUnit(units.days,    t.days);    prev.days    = t.days; }
    if (t.hours   !== prev.hours)   { animateUnit(units.hours,   t.hours);   prev.hours   = t.hours; }
    if (t.minutes !== prev.minutes) { animateUnit(units.minutes, t.minutes); prev.minutes = t.minutes; }
    if (t.seconds !== prev.seconds) { animateUnit(units.seconds, t.seconds); prev.seconds = t.seconds; }
  }

  tick();
  setInterval(tick, 1000);
}

/* ─── PARALLAX RING ─── */
function initParallax() {
  const ring = document.getElementById('ring-parallax');
  if (!ring) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    ring.style.transform = `translateY(${scrollY * 0.18}px)`;
  }, { passive: true });
}

/* ─── SCROLL REVEAL ─── */
function initScrollAnimations() {
  const sections = document.querySelectorAll('.section, .invite-card, .programme-card, .detail-item, .timeline-item');

  sections.forEach(el => {
    if (!el.classList.contains('hero-section')) {
      el.classList.add('reveal');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── PARTICLES ON CLICK ─── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];

  const SHAPES = ['heart', 'star', 'circle'];
  const COLORS = ['#C9A86A', '#B8963A', '#E8D5A3', '#7A1530', '#F5ECD7'];

  function heartPath(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.4);
    ctx.bezierCurveTo(x - size, y + size * 0.85, x, y + size * 1.1, x, y + size * 1.4);
    ctx.bezierCurveTo(x, y + size * 1.1, x + size, y + size * 0.85, x + size, y + size * 0.4);
    ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
    ctx.closePath();
  }

  function spawnParticles(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle  = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed  = 2 + Math.random() * 4;
      const size   = 5 + Math.random() * 9;
      const shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const spin   = (Math.random() - 0.5) * 0.2;

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size,
        color,
        shape,
        spin,
        rotation: Math.random() * Math.PI * 2,
        alpha: 1,
        life: 1
      });
    }
  }

  document.addEventListener('click', e => {
    if (!document.getElementById('main-content') ||
        document.getElementById('main-content').classList.contains('hidden')) return;
    spawnParticles(e.clientX, e.clientY);
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.12;
      p.vx *= 0.98;
      p.life -= 0.018;
      p.rotation += p.spin;

      if (p.life <= 0) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'heart') {
        heartPath(ctx, 0, 0, p.size / 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          const a1 = (s * 4 * Math.PI) / 5 - Math.PI / 2;
          const a2 = ((s * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
          if (s === 0) ctx.moveTo(Math.cos(a1) * p.size, Math.sin(a1) * p.size);
          else ctx.lineTo(Math.cos(a1) * p.size, Math.sin(a1) * p.size);
          ctx.lineTo(Math.cos(a2) * p.size * 0.45, Math.sin(a2) * p.size * 0.45);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

/* ─── LIQUID NAV — ACTIONS ─── */
(function initNav() {
  // Congratulations
  const btnCongrats = document.getElementById('nav-congrats');
  const modalCongrats = document.getElementById('modal-congrats');
  const sendCongrats = document.getElementById('send-congrats');
  const congratsSent = document.getElementById('congrats-sent');

  if (btnCongrats && modalCongrats) {
    btnCongrats.addEventListener('click', () => {
      modalCongrats.classList.remove('hidden');
    });
  }

  if (sendCongrats) {
    sendCongrats.addEventListener('click', () => {
      const txt  = document.getElementById('congrats-text')?.value.trim();
      const name = document.getElementById('congrats-name')?.value.trim();
      if (!txt) return;

      congratsSent.classList.remove('hidden');
      sendCongrats.disabled = true;
      sendCongrats.textContent = '✦ Envoyé';

      // Optional: send to Apps Script
      if (APPS_SCRIPT_URL) {
        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'voeux', name, message: txt })
        });
      }
    });
  }

  // Calendar
  const btnCalendar = document.getElementById('nav-calendar');
  if (btnCalendar) {
    btnCalendar.addEventListener('click', () => {
      const title    = encodeURIComponent('Mariage de Ahmad & Samara');
      const details  = encodeURIComponent('Salle des Fêtes Benkoli, Annaba');
      const location = encodeURIComponent('Salle Benkoli, Annaba, Algérie');
      const start    = '20260816T173000';
      const end      = '20260817T020000';
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  // Contact
  const btnContact = document.getElementById('nav-contact');
  const modalContact = document.getElementById('modal-contact');
  if (btnContact && modalContact) {
    btnContact.addEventListener('click', () => {
      modalContact.classList.remove('hidden');
    });
  }

  // Location
  const btnLocation = document.getElementById('nav-location');
  if (btnLocation) {
    btnLocation.addEventListener('click', () => {
      window.open('https://maps.app.goo.gl/QZKrBppcyYgTwopr8', '_blank', 'noopener');
    });
  }

  // Close modals
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });
})();

/* ─── RSVP FORM ─── */
(function initRSVP() {
  const form    = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name       = document.getElementById('rsvp-name')?.value.trim();
    const attendance = document.getElementById('rsvp-attendance')?.value;
    const guests     = document.getElementById('rsvp-guests')?.value || '1';

    if (!name || !attendance) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const btn = form.querySelector('.btn-rsvp');
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;

    try {
      if (APPS_SCRIPT_URL) {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rsvp',
            nome: name,
            attendance,
            guests,
            timestamp: new Date().toISOString()
          })
        });
      }
      form.style.display = 'none';
      success.classList.remove('hidden');
    } catch (err) {
      btn.textContent = 'Envoyer ma réponse';
      btn.disabled = false;
    }
  });
})();

/* ─── TOUCH PARTICLE SPAWN ─── */
document.addEventListener('touchstart', e => {
  if (!document.getElementById('main-content') ||
      document.getElementById('main-content').classList.contains('hidden')) return;
  const t = e.touches[0];
  document.dispatchEvent(new MouseEvent('click', { clientX: t.clientX, clientY: t.clientY }));
}, { passive: true });
