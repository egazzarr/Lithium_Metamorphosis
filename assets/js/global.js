function goToChapter(url) {
  document.body.classList.add('fade-out');
  // children's transitions bubble up here too, so wait for the body's own fade
  document.body.addEventListener('transitionend', function onEnd(e) {
    if (e.target !== document.body) return;
    document.body.removeEventListener('transitionend', onEnd);
    window.location.href = url;
  });
}

function goToNextChapter() {
  const current = window.location.pathname.split('/').pop();
  const i = CHAPTER_ORDER.indexOf(current);
  if (i !== -1 && i + 1 < CHAPTER_ORDER.length) {
    goToChapter(CHAPTER_ORDER[i + 1]);
  }
}

function goToPreviousChapter() {
  const current = window.location.pathname.split('/').pop();
  const i = CHAPTER_ORDER.indexOf(current);
  if (i > 0) {
    goToChapter(CHAPTER_ORDER[i - 1]);
  }
}

function renderNavButtons() {
  const current = window.location.pathname.split('/').pop();
  const i = CHAPTER_ORDER.indexOf(current);

  if (i > 0) {
    const back = document.createElement('button');
    back.id = 'back-btn';
    back.className = 'nav-btn';
    back.textContent = '< BACK';
    back.addEventListener('click', goToPreviousChapter);
    document.body.appendChild(back);
  }

  // a chapter can hide its NEXT button with <body data-no-next>
  if (i !== -1 && i + 1 < CHAPTER_ORDER.length && !document.body.hasAttribute('data-no-next')) {
    const next = document.createElement('button');
    next.id = 'next-btn';
    next.className = 'nav-btn';
    next.textContent = 'NEXT >';
    next.addEventListener('click', goToNextChapter);
    document.body.appendChild(next);
  }
}

// Three-line button (top right, next to NEXT) opening a full-screen grid of chapters.
function renderMenu() {
  const current = window.location.pathname.split('/').pop();
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

  const toggle = document.createElement('button');
  toggle.id = 'menu-btn';
  toggle.setAttribute('aria-label', 'Chapters');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';

  const menu = document.createElement('nav');
  menu.id = 'chapter-menu';
  menu.setAttribute('aria-hidden', 'true');
  const grid = document.createElement('div');
  grid.className = 'menu-grid';

  MENU_TILES.forEach((tile, i) => {
    const page = CHAPTER_ORDER[i];
    const item = document.createElement(page ? 'button' : 'div');
    item.className = 'menu-tile';
    if (!page) item.classList.add('locked');
    if (page === current) item.classList.add('current');

    const img = document.createElement('img');
    img.src = '../assets/images/' + tile.image;
    img.alt = '';
    const label = document.createElement('span');
    label.textContent = numerals[i] + (tile.label ? ' · ' + tile.label : '');
    item.append(img, label);

    if (page) {
      item.addEventListener('click', () => {
        if (page === current) { setOpen(false); return; }
        goToChapter(page);
      });
    }
    grid.appendChild(item);
  });
  menu.appendChild(grid);

  function setOpen(open) {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  }

  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
  // clicking the empty space around the tiles closes the menu
  menu.addEventListener('click', (e) => { if (e.target === menu || e.target === grid) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  document.body.append(menu, toggle);
}

// Mounts a p5 sketch (instance mode) in a full-screen layer behind the page content.
// Each chapter's own JS calls this with its sketch function; when a chapter uses
// several sketches, each new one is stacked on top of the previous ones.
function createChapterSketch(sketch) {
  const layer = document.createElement('div');
  layer.className = 'p5-layer';
  document.body.appendChild(layer);
  return new p5(sketch, layer);
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavButtons();
  renderMenu();
});