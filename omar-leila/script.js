/* =========================================================
   محمد & فاطمة — Wedding Invitation
   script.js — Countdown, reveal animations, calendar, RSVP
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     ⚠️ CONFIG — edit these two values only
  --------------------------------------------------------- */

  // Google Apps Script Web App URL (see Code.gs deployment instructions)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkUDJxx-IJ4Si--abc7NnD3hISktDUK986kvUwDAHgcmRr0a0Nwgi0rN512nvt36qa/exec';

  // Wedding date/time — August 2nd, 2026, 6:00 PM (adjust the hour as needed)
  const WEDDING_DATE = new Date('2026-08-16T17:30:00+01:00'); // Algeria UTC+1

  /* ---------------------------------------------------------
     1) SCROLL REVEAL — IntersectionObserver fade/rise-in
  --------------------------------------------------------- */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal');

    // Hero reveals run immediately on load (orchestrated entrance),
    // everything else reveals on scroll into view.
    const heroReveals = document.querySelectorAll('#hero .reveal');
    heroReveals.forEach((el) => el.classList.add('is-visible'));

    const scrollTargets = Array.from(targets).filter(
      (el) => !el.closest('#hero')
    );

    if (!('IntersectionObserver' in window)) {
      scrollTargets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    scrollTargets.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
     2) DOT NAVIGATION — active state on scroll
  --------------------------------------------------------- */
  function initDotNav() {
    const dots = document.querySelectorAll('.dot');
    if (!dots.length) return;

    const sections = Array.from(dots)
      .map((dot) => document.getElementById(dot.dataset.target))
      .filter(Boolean);

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    if (!('IntersectionObserver' in window)) return;

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            dots.forEach((dot) =>
              dot.classList.toggle('active', dot.dataset.target === id)
            );
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------------------------------------------------------
     3) COUNTDOWN TIMER — live days/hours/minutes/seconds
  --------------------------------------------------------- */
  function initCountdown() {
    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMinutes = document.getElementById('cd-minutes');
    const elSeconds = document.getElementById('cd-seconds');
    const grid = document.getElementById('countdown-grid');
    const passedMsg = document.getElementById('countdown-passed');

    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    function pad(n) {
      return String(Math.max(0, n)).padStart(2, '0');
    }

    function tick() {
      const now = new Date();
      const diff = WEDDING_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(timerId);
        if (grid) grid.hidden = true;
        if (passedMsg) passedMsg.hidden = false;
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      elDays.textContent = pad(days);
      elHours.textContent = pad(hours);
      elMinutes.textContent = pad(minutes);
      elSeconds.textContent = pad(seconds);
    }

    tick();
    const timerId = setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     4) SAVE THE DATE — .ics download + Google Calendar link
  --------------------------------------------------------- */
  function formatICSDate(date) {
    // ICS wants UTC basic format: YYYYMMDDTHHMMSSZ
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';
  }

  function buildICS() {
    const start = WEDDING_DATE;
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4-hour event

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mohammed & Fatima Wedding//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@mohammed-fatima-wedding`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      'SUMMARY:حفل زفاف محمد و فاطمة',
      'DESCRIPTION:يسعدنا حضوركم حفل زفافنا في قاعة الحفلات بن قلي',
      'LOCATION:قاعة الحفلات بن قلي',
      'URL:https://maps.app.goo.gl/QZKrBppcyYgTwopr8',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:تذكير: حفل زفاف محمد و فاطمة',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    return lines.join('\r\n');
  }

  function downloadICS() {
    const icsContent = buildICS();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mohammed-Fatima-Wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function buildGoogleCalendarLink() {
    const start = WEDDING_DATE;
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

    const fmt = (d) => formatICSDate(d);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'حفل زفاف محمد و فاطمة',
      dates: `${fmt(start)}/${fmt(end)}`,
      details: 'يسعدنا حضوركم حفل زفافنا في قاعة الحفلات بن قلي',
      location: 'قاعة الحفلات بن قلي',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function initSaveDate() {
    const icsBtn = document.getElementById('btn-ics');
    const gcalBtn = document.getElementById('btn-gcal');

    if (icsBtn) {
      icsBtn.addEventListener('click', downloadICS);
    }
    if (gcalBtn) {
      gcalBtn.href = buildGoogleCalendarLink();
    }
  }

  /* ---------------------------------------------------------
     5) RSVP FORM — submit to Google Apps Script Web App
  --------------------------------------------------------- */
  function initRSVP() {
    const form = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('rsvp-submit');
    const statusEl = document.getElementById('form-status');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.elements['name'].value.trim();
      const guests = form.elements['guests'].value;
      const attendanceInput = form.querySelector('input[name="attendance"]:checked');

      if (!name || guests === '' || !attendanceInput) {
        setStatus('يرجى تعبئة جميع الحقول.', 'error');
        return;
      }

      const payload = {
        name: name,
        guests: guests,
        attendance: attendanceInput.value,
        timestamp: new Date().toISOString(),
      };

      if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        setStatus('⚠️ لم يتم ربط رابط Google Apps Script بعد.', 'error');
        console.warn('Set GOOGLE_SCRIPT_URL in script.js before going live.');
        return;
      }

      setLoading(true);
      setStatus('', '');

      try {
        // Apps Script Web Apps work reliably with no-cors text/plain POSTs
        // from static GitHub Pages sites (avoids CORS preflight issues).
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });

        // With mode: 'no-cors' the response is opaque, so we optimistically
        // assume success — Apps Script almost always accepts the POST.
        setStatus('تم استلام تأكيدكم بنجاح، شكراً لكم! 🌙', 'success');
        form.reset();
      } catch (err) {
        console.error('RSVP submission failed:', err);
        setStatus('حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.', 'error');
      } finally {
        setLoading(false);
      }
    });

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.classList.toggle('is-loading', isLoading);
      submitBtn.disabled = isLoading;
    }

    function setStatus(message, type) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = 'form-status' + (type ? ` ${type}` : '');
    }
  }

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initDotNav();
    initCountdown();
    initSaveDate();
    initRSVP();
  });
})();
