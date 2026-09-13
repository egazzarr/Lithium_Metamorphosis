function goToChapter(url) {
  document.body.classList.add('fade-out');
  document.body.addEventListener('transitionend', () => {
    window.location.href = url;
  }, { once: true });
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

  if (i !== -1 && i + 1 < CHAPTER_ORDER.length) {
    const next = document.createElement('button');
    next.id = 'next-btn';
    next.className = 'nav-btn';
    next.textContent = 'NEXT >';
    next.addEventListener('click', goToNextChapter);
    document.body.appendChild(next);
  }
}

document.addEventListener('DOMContentLoaded', renderNavButtons);