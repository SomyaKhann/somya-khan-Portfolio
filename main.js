// Categories: [key used in projects.json, title shown, one-line intro]. Order = tab order.
const CATS = [
  ['real-estate', 'Real Estate & Property', 'Homes are sold with a feeling. I edit property videos that make buyers imagine living there.'],
  ['ai', 'AI Visuals & Content', 'Cinematic AI scenes, concepts and experiments, built with intent.'],
  ['brand', 'Brand & Commercial', 'Videos and ads for restaurants, products and brands.'],
  ['motion', 'Motion & Design', 'Animated typography, logo animation and motion graphics.']
];
const PER_PAGE = 6; // cards shown before "View all"
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const load = async u => { try { const r = await fetch(u); if (!r.ok) throw 0; return await r.json(); } catch (e) { console.warn('Could not load ' + u + '. Check the JSON for typos (missing comma or quote).'); return null; } };

// Turn YouTube / Vimeo links into embed URLs; anything else is treated as an mp4 file.
function mediaHTML(url) {
  let m;
  if ((m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/))) return `<iframe src="https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0" allow="autoplay;fullscreen" allowfullscreen></iframe>`;
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return `<iframe src="https://player.vimeo.com/video/${m[1]}?autoplay=1" allow="autoplay;fullscreen" allowfullscreen></iframe>`;
  return `<video src="${esc(url)}" controls autoplay playsinline></video>`;
}

(async () => {
  const demo = location.search.includes('demo'); // ?demo previews the grid with sample data
  const [site, all] = await Promise.all([load('data/site.json'), load(demo ? 'data/projects.example.json' : 'data/projects.json')]);
  const S = site || {};
  $('#yr').textContent = new Date().getFullYear();
  if (S.status) $('#status').textContent = S.status;

  // Hero / showreel / talking head: each stays hidden until a video is set in site.json
  if (S.heroVideo) { const v = $('#heroVideo'); v.src = S.heroVideo; v.hidden = false; v.autoplay = true; v.play().catch(() => {}); }
  const setVid = (box, v, d) => { if (d && d.video) { v.src = d.video; if (d.poster) v.poster = d.poster; box.hidden = false; } };
  setVid($('#showreel'), $('#reelVideo'), S.showreel);
  setVid($('#meet'), $('#meetVideo'), S.meet);

  // Projects → cards
  const projects = (all || []).filter(p => p && p.title && p.category && p.thumbnail);
  const sorted = [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const cats = CATS.filter(c => sorted.some(p => p.category === c[0]));
  let cur = null, open = false;
  const grid = $('#grid'), more = $('#more'), tabs = $('#tabs');

  function render() {
    const list = sorted.filter(p => p.category === cur[0]);
    $('#catIntro').textContent = cur[2];
    grid.innerHTML = '';
    list.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'card' + (p.orientation === 'horizontal' ? ' h' : '');
      b.hidden = !open && i >= PER_PAGE;
      b.innerHTML = `<img src="${esc(p.thumbnail)}" alt="${esc(p.title)}" loading="lazy">${p.preview ? '<video muted loop playsinline preload="none"></video>' : ''}<span class="t">${esc(p.title)}</span>`;
      const pv = $('video', b);
      if (pv) { b.onmouseenter = () => { if (!pv.src) pv.src = p.preview; pv.play().catch(() => {}); }; b.onmouseleave = () => pv.pause(); }
      b.onclick = () => openProject(p);
      grid.append(b);
    });
    more.hidden = open || list.length <= PER_PAGE;
    more.textContent = `View all ${list.length}`;
  }
  if (cats.length) {
    $('#work').hidden = false;
    cur = cats[0];
    if (cats.length > 1) {
      cats.forEach(c => {
        const t = document.createElement('button');
        t.textContent = c[1]; t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', c === cur);
        t.onclick = () => { cur = c; open = false; [...tabs.children].forEach(x => x.setAttribute('aria-selected', x === t)); render(); };
        tabs.append(t);
      });
    } else $('#workTitle').textContent = cur[1];
    more.onclick = () => { open = true; render(); };
    render();
  }

  // Project modal
  const modal = $('#modal');
  function openProject(p) {
    const m = $('#mMedia');
    m.className = 'm-media' + (p.orientation === 'vertical' ? ' v' : '');
    m.innerHTML = p.video ? mediaHTML(p.video) : `<img src="${esc(p.thumbnail)}" alt="">`;
    const rows = [['Category', (CATS.find(c => c[0] === p.category) || [])[1] || p.category], ['My role', (p.role || []).join(', ')], ['Tools', (p.tools || []).join(', ')]].filter(r => r[1]);
    $('#mInfo').innerHTML = `<h3>${esc(p.title)}</h3>${p.description ? `<p>${esc(p.description)}</p>` : ''}${p.result ? `<p class="res">${esc(p.result)}</p>` : ''}<dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>${p.feedback ? `<blockquote>“${esc(p.feedback)}”</blockquote>` : ''}`;
    modal.showModal();
  }
  const closeModal = () => { modal.close(); $('#mMedia').innerHTML = ''; };
  $('#close').onclick = closeModal;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal.addEventListener('cancel', () => { $('#mMedia').innerHTML = ''; });

  // Behind the frame photos (and optional BTS clips) from site.json
  const strip = $('#strip');
  (S.lifestyle || []).forEach(f => {
    const el = document.createElement('figure');
    el.dataset.p = '0.04';
    el.innerHTML = /\.(mp4|webm)$/i.test(f) ? `<video src="${esc(f)}" muted loop playsinline autoplay></video>` : `<img src="${esc(f)}" alt="Somya Khan behind the scenes" loading="lazy">`;
    strip.append(el);
  });
  if (!strip.children.length) strip.closest('section').hidden = true;

  // Testimonials: only shown if you add real ones
  const qs = S.testimonials || [];
  if (qs.length) {
    $('#testimonials').hidden = false;
    $('#quotes').innerHTML = qs.map(q => `<div>${q.text ? `<blockquote>“${esc(q.text)}”</blockquote>` : ''}${q.image ? `<img src="${esc(q.image)}" alt="Client message" loading="lazy">` : ''}<cite>${esc(q.name)}${q.role ? ', ' + esc(q.role) : ''}</cite></div>`).join('');
  }

  // Contact buttons: only buttons you filled in appear
  const c = S.contact || {}, b = [];
  const first = c.form || (c.email && `mailto:${c.email}?subject=Project%20enquiry`);
  if (first) b.push([first, "Let's work together"]);
  if (c.email) b.push([`mailto:${c.email}`, 'Email me']);
  if (c.whatsapp) b.push([`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`, 'WhatsApp']);
  if (c.instagram) b.push([c.instagram, 'Instagram']);
  if (c.linkedin) b.push([c.linkedin, 'LinkedIn']);
  if (c.linkedin) b.push([c.linkedin, 'LinkedIn']);
  $('#btns').innerHTML = b.map(x => `<a href="${esc(x[0])}" target="_blank" rel="noopener">${x[1]}</a>`).join('');

  // Subtle parallax (skipped for reduced motion)
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    let t = false;
    const run = () => { t = false; document.querySelectorAll('[data-p]').forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const k = parseFloat(el.dataset.p); const target = el.querySelector('img,video') || el; target.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * -k}px)`; }); };
    addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }
})();
