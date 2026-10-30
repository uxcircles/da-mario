/* Da Mario — concept redesign. No dependencies. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const i18n = (() => { try { return JSON.parse($('#i18n').textContent); } catch { return null; } })();
  const fill = (str, o) => str.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const pad = (n) => String(n).padStart(2, '0');
  const hm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

  /* Header: mobile nav, scrolled state, sticky offsets ------------------ */
  const header = $('[data-header]');
  const burger = $('[data-burger]');
  const setOffsets = () => {
    if (!header) return;
    const concept = $('.concept-bar', header);
    document.documentElement.style.setProperty('--nav-top', header.getBoundingClientRect().bottom + 'px');
    document.documentElement.style.setProperty('--concept-h', (concept ? concept.offsetHeight : 0) + 'px');
  };
  setOffsets();
  addEventListener('resize', setOffsets);
  burger?.addEventListener('click', () => {
    setOffsets();
    const open = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? (document.documentElement.lang.startsWith('zh') ? '關閉選單' : 'Close menu') : (document.documentElement.lang.startsWith('zh') ? '開啟選單' : 'Open menu'));
  });
  $$('[data-nav] a').forEach((a) => a.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    burger?.setAttribute('aria-expanded', 'false');
  }));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { document.body.classList.remove('nav-open'); burger?.setAttribute('aria-expanded', 'false'); burger?.focus(); }
  });

  /* Language dropdown */
  const lang = $('[data-lang]');
  if (lang) {
    const btn = $('.lang-btn', lang), menu = $('.lang-menu', lang);
    const setOpen = (open) => { btn.setAttribute('aria-expanded', open); menu.hidden = !open; };
    btn.addEventListener('click', () => setOpen(menu.hidden));
    document.addEventListener('click', (e) => { if (!lang.contains(e.target)) setOpen(false); });
    lang.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); } });
    lang.addEventListener('focusout', (e) => { if (!lang.contains(e.relatedTarget)) setOpen(false); });
  }

  const mobileCta = $('[data-mobile-cta]');
  const onScroll = () => {
    document.body.classList.toggle('is-scrolled', scrollY > 8);
    mobileCta?.classList.toggle('is-visible', scrollY > 420);
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* London time, opening hours ------------------------------------------ */
  const london = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    return { day, mins: +p.hour * 60 + +p.minute, date: +p.day, month: +p.month, year: +p.year };
  };
  // Mon–Fri 12:30–23:00, Sat 13:00–23:00, Sun closed. Closed 24 Dec – 4 Jan; open on the three Sundays before Christmas.
  const hoursFor = (d) => {
    const xmasClosed = (d.month === 12 && d.date >= 24) || (d.month === 1 && d.date <= 4);
    if (xmasClosed) return null;
    if (d.day === 0) return (d.month === 12 && [6, 13, 20].includes(d.date)) ? [750, 1380] : null;
    return d.day === 6 ? [780, 1380] : [750, 1380];
  };
  const now = london();

  const status = $('[data-open-status]');
  if (status && i18n) {
    const dot = $('.status-dot', status), txt = $('[data-open-text]', status);
    const h = hoursFor(now);
    if (h && now.mins >= h[0] && now.mins < h[1]) txt.textContent = i18n.openNow;
    else if (h && now.mins < h[0]) { txt.textContent = fill(i18n.opensAt, { t: hm(h[0]) }); dot.classList.add('is-closed'); }
    else if (!h && now.day === 0) { txt.textContent = i18n.closedSun; dot.classList.add('is-closed'); }
    else { txt.textContent = i18n.closedNow; dot.classList.add('is-closed'); }
  }
  $$('[data-hours] tr').forEach((tr) => tr.classList.toggle('is-today', +tr.dataset.day === now.day));

  /* Pre-theatre planner -------------------------------------------------- */
  const form = $('[data-planner]');
  if (form && i18n) {
    const daySel = form.elements.day;
    daySel.value = String(now.day === 0 ? 1 : now.day);
    const out = { kicker: $('[data-plan-kicker]'), time: $('[data-plan-time]'), note: $('[data-plan-note]'), bar: $('[data-timeline]') };
    const mapEl = $('[data-map]');
    let map = null; // set once MapLibre has loaded
    const BUFFER = 10, DINE = 120, LAST = toMin('17:30');

    const update = () => {
      const opt = form.elements.theatre.selectedOptions[0];
      const walk = +opt.dataset.walk;
      const theatre = opt.textContent.split(' · ')[0];
      const curtain = toMin(form.elements.time.value);
      const day = +daySel.value;
      const open = day === 6 ? 780 : 750;
      let arrive = Math.floor((curtain - walk - BUFFER - DINE) / 15) * 15;
      let note, spare;
      out.kicker.textContent = i18n.arrive;
      if (arrive < open) {
        out.kicker.textContent = i18n.after;
        out.time.textContent = '21:30';
        note = fill(i18n.noteMatinee, { curtain: hm(curtain), open: hm(open) });
        out.bar.style.setProperty('--cols', '0fr 0fr 1fr');
      } else {
        if (arrive > LAST) {
          arrive = LAST;
          spare = curtain - (arrive + DINE) - walk;
          note = fill(i18n.noteCap, { walk, theatre, spare });
        } else {
          spare = curtain - (arrive + DINE) - walk;
          note = fill(i18n.note, { leave: hm(arrive + DINE), walk, theatre, spare });
        }
        out.time.textContent = hm(arrive);
        out.bar.style.setProperty('--cols', `${DINE}fr ${spare}fr ${walk}fr`);
      }
      if (day === 3) note += i18n.sinatra;
      out.note.textContent = note;

      map?.select(opt.value);
    };
    form.addEventListener('change', update);
    update();

    /* Map: MapLibre + OpenFreeMap, loaded only when it scrolls near the viewport */
    if (mapEl) {
      const addScript = (src) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.append(s);
      });
      const load = () => {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = `${mapEl.dataset.lib}maplibre-gl.css`;
        document.head.append(css);
        return addScript(`${mapEl.dataset.lib}maplibre-gl.js`)
          .then(() => addScript(mapEl.dataset.src))
          .then(() => {
            const data = JSON.parse($('#map-data').textContent);
            map = window.daMarioMap(mapEl, data, (id) => { form.elements.theatre.value = id; update(); });
            map.select(form.elements.theatre.value);
          })
          .catch(() => mapEl.classList.add('is-failed'));
      };
      if ('IntersectionObserver' in window) {
        const mio = new IntersectionObserver((entries) => {
          if (entries.some((en) => en.isIntersecting)) { mio.disconnect(); load(); }
        }, { rootMargin: '400px 0px' });
        mio.observe(mapEl);
      } else load();
    }
  }

  /* Lightbox ------------------------------------------------------------- */
  const lb = $('[data-lb]');
  if (lb) {
    let items = [];
    try { items = JSON.parse($('#lb-data').textContent); } catch {}
    const imgEl = $('[data-lb-img]', lb), cap = $('[data-lb-cap]', lb);
    let i = 0, opener = null;
    const show = (n) => { i = (n + items.length) % items.length; imgEl.src = items[i].src; imgEl.alt = items[i].alt; cap.textContent = items[i].alt; };
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; opener?.focus(); };
    $$('[data-lightbox]').forEach((b) => b.addEventListener('click', () => {
      opener = b; show(+b.dataset.lightbox); lb.hidden = false; document.body.style.overflow = 'hidden'; $('[data-lb-close]', lb).focus();
    }));
    $('[data-lb-close]', lb).addEventListener('click', close);
    $('[data-lb-prev]', lb).addEventListener('click', () => show(i - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'Tab') { // keep focus inside the dialog
        const f = $$('button', lb); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* Menu: tabs scroll-spy, search, vegetarian filter -------------------- */
  const tabs = $('[data-menu-tabs]');
  if (tabs) {
    const sections = $$('[data-section]');
    const links = $$('a', tabs);
    const setActive = (id) => links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'true'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } else a.removeAttribute('aria-current');
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));

    const search = $('[data-menu-search]');
    const veg = $('[data-veg-toggle]');
    const none = $('[data-no-results]');
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    $$('[data-item]').forEach((it) => { it.dataset.text = norm(it.textContent); });
    const apply = () => {
      const q = norm(search.value.trim());
      const vegOnly = veg.getAttribute('aria-pressed') === 'true';
      let total = 0;
      sections.forEach((s) => {
        let n = 0;
        $$('[data-item]', s).forEach((it) => {
          const ok = (!q || it.dataset.text.includes(q)) && (!vegOnly || it.hasAttribute('data-veg'));
          it.hidden = !ok; if (ok) n++;
        });
        $$('.menu-sub', s).forEach((sub) => {
          let el = sub.nextElementSibling, any = false;
          while (el && !el.classList.contains('menu-sub')) { if (!el.hidden) any = true; el = el.nextElementSibling; }
          sub.hidden = !any;
        });
        s.hidden = n === 0;
        links.find((a) => a.getAttribute('href') === '#' + s.id)?.toggleAttribute('hidden', n === 0);
        total += n;
      });
      none.hidden = total > 0;
    };
    search.addEventListener('input', apply);
    veg.addEventListener('click', () => { veg.setAttribute('aria-pressed', veg.getAttribute('aria-pressed') !== 'true'); apply(); });
  }

  /* Reveal on scroll ---------------------------------------------------- */
  const io = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('is-in'));
})();
