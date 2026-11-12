// Scale the strapline under the logo so it is exactly as wide as "MIDNIGHT SUN".
(function () {
  const line = document.getElementById('est-line');
  const word = document.querySelector('.wordmark__main');
  const box = document.querySelector('.wordmark');        // block box whose width = MIDNIGHT SUN
  if (!line || !word) return;

  function fit() {
    const target = word.getBoundingClientRect().width;
    if (!target) return;
    line.style.fontSize = '20px';                                   // measure at a known size…
    const w = line.getBoundingClientRect().width;
    const trailing = parseFloat(getComputedStyle(line).letterSpacing) || 0; // spacing after the last letter
    line.style.fontSize = (20 * target / (w - trailing)) + 'px';  // …then scale so the letters span exactly the target
  }

  let raf;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
  if ('ResizeObserver' in window && box) new ResizeObserver(schedule).observe(box);
  window.addEventListener('resize', schedule);
  if (document.fonts) {
    document.fonts.ready.then(fit);
    document.fonts.addEventListener('loadingdone', schedule);   // web fonts swap in after first paint
  }
  window.addEventListener('load', fit);
  fit();
})();
