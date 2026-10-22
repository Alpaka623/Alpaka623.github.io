const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Entrances: once, when a part enters the viewport. Siblings are staggered.
(() => {
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => { child.setAttribute('data-reveal', ''); child.style.setProperty('--i', i); });
  });
  const all = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { all.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
  all.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => {
    all.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// Smaller things: the row nearest the middle of the screen (or under the pointer) picks the picture.
(() => {
  const items = [...document.querySelectorAll('.more__item')];
  const shots = [...document.querySelectorAll('.more__shot')];
  if (!items.length) return;
  const activate = (item) => {
    items.forEach((it) => it.classList.toggle('is-on', it === item));
    shots.forEach((s) => s.classList.toggle('is-on', s.dataset.for === item.dataset.item));
  };
  items.forEach((item) => {
    item.addEventListener('pointerenter', () => activate(item));
    item.addEventListener('focusin', () => activate(item));
  });
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) activate(entry.target);
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((item) => io.observe(item));
})();

// Blackout: the mod's sabotage, played on this page. O or the button cuts the power; it comes back by itself.
(() => {
  const button = document.querySelector('.cut');
  const shade = document.querySelector('.dark');
  const note = document.querySelector('.dark__note');
  if (!button || !shade) return;
  button.hidden = false;
  let timer = 0;
  const restore = () => {
    clearTimeout(timer);
    root.classList.remove('is-dark', 'is-flicker');
    note.textContent = '';
    button.focus({ preventScroll: true });
  };
  const cut = () => {
    if (root.classList.contains('is-dark')) return restore();
    root.classList.add('is-dark');
    if (!reducedMotion) root.classList.add('is-flicker');
    note.textContent = 'The Dissident cut the power. It comes back in a few seconds, or click anywhere.';
    timer = setTimeout(restore, 5000);
  };
  button.addEventListener('click', cut);
  shade.addEventListener('click', restore);
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, [contenteditable]') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'o' || e.key === 'O') cut();
    else if (e.key === 'Escape' && root.classList.contains('is-dark')) restore();
  });
})();
