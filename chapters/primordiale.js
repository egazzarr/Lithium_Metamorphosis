document.addEventListener('DOMContentLoaded', () => {
  const title = document.getElementById('chapter-title');
  setTimeout(() => {
    title.classList.add('visible');
  }, 4000);
});