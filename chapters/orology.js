// Arriving from the fauna chapter (?from=fauna), the relief has already faded
// in over the hands there: the page doesn't fade in again, only the map and
// the place appear on it.

if (new URLSearchParams(location.search).get('from') === 'fauna') {
  document.body.classList.add('seamless');
}
