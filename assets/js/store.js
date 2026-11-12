(function () {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const records = JSON.parse(document.getElementById('records-data').textContent);
  const cards = Array.from(grid.children);
  // Map slug -> card. Duplicate records (same title + catalog) get a -2, -3… suffix.
  const bySlug = new Map();
  cards.forEach(c => {
    let slug = c.dataset.slug, n = 1;
    while (bySlug.has(slug)) slug = `${c.dataset.slug}-${++n}`;
    c.dataset.slug = slug;
    c.querySelector('a').href = '#' + slug;
    bySlug.set(slug, c);
  });
  const $ = id => document.getElementById(id);
  const q = $('q'), labelSel = $('label'), sortSel = $('sort'), hideSold = $('hide-sold');

  // ---- Label dropdown, built from the records ----
  const labels = [...new Set(cards.map(c => c.dataset.label))].sort((a, b) => a.localeCompare(b));
  labels.forEach(l => labelSel.add(new Option(l, l)));

  // ---- Filter + sort ----
  function apply() {
    const term = q.value.trim().toLowerCase();
    const label = labelSel.value;
    const [key, dir] = (sortSel.value || 'index-asc').split('-');
    const sign = dir === 'desc' ? -1 : 1;
    const val = c => key === 'index' ? +c.dataset.index
      : key === 'title' ? c.dataset.title.toLowerCase()
      : +c.dataset[key] || 0;

    const sorted = [...cards].sort((a, b) => {
      const x = val(a), y = val(b);
      return (x < y ? -1 : x > y ? 1 : 0) * sign;
    });

    let shown = 0;
    sorted.forEach(c => {
      const ok = (!term || c.dataset.search.includes(term)) && (!label || c.dataset.label === label)
        && !(hideSold.checked && c.dataset.sold === 'true');
      c.hidden = !ok;
      if (ok) shown++;
      grid.appendChild(c);
    });
    $('count').textContent = shown;

    // badge on the mobile "Search & filter" button: how many filters are in use
    const active = [term, label, sortSel.value, hideSold.checked].filter(Boolean).length;
    $('filters-active').hidden = !active;
    $('filters-active').textContent = active;
    $('empty').hidden = shown > 0;
  }
  q.addEventListener('input', apply);
  labelSel.addEventListener('change', apply);
  sortSel.addEventListener('change', apply);
  hideSold.addEventListener('change', apply);

  // Mobile: filters start collapsed behind a toggle (always visible on desktop via CSS)
  const toggle = $('filters-toggle'), form = $('filters');
  toggle.addEventListener('click', () => {
    const open = form.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  // Browsers restore form fields on reload/back; sync the grid with them.
  apply();
  window.addEventListener('pageshow', apply);

  // ---- Detail dialog ----
  const dlg = $('detail');
  const url = p => (p && p.startsWith('/') ? SHOP.base + p : p);
  const fallback = img => { img.onerror = () => { img.onerror = null; img.src = SHOP.noCover; }; };

  function open(slug) {
    const card = bySlug.get(slug);
    if (!card) return;
    const r = records[+card.dataset.index];
    // Front image first, then every other photo found in the record's folder, in numeric order.
    const num = p => parseInt(p.split('/').pop(), 10) || 0;
    const folderPhotos = (card.dataset.photos || '').split('|').filter(Boolean)
      .filter(p => p !== r.front_image)
      .sort((a, b) => num(a) - num(b) || a.localeCompare(b));
    const images = [r.front_image, ...folderPhotos].filter(Boolean);

    $('detail-label').textContent = `${card.dataset.label} · ${r.catalog}`;
    $('detail-title').textContent = r.title;
    $('detail-price').textContent = `${r.price},-`;
    $('detail-labelname').textContent = card.dataset.label;
    $('detail-catalog').textContent = r.catalog;
    $('detail-year').textContent = r.year;
    $('detail-vinyl').textContent = r.condition_vinyl;
    $('detail-cover').textContent = r.condition_cover;
    $('detail-desc').textContent = r.description || 'Ask for more details and extra photos.';
    $('detail-desc').classList.toggle('is-empty', !r.description);

    const discogs = $('detail-discogs');
    discogs.hidden = !r.discogs_url;
    discogs.href = r.discogs_url || '#';

    $('detail-pricebox').hidden = !!r.sold;
    $('detail-sold').hidden = !r.sold;
    dlg.classList.toggle('is-sold', !!r.sold);

    const ask = $('detail-ask');
    const subject = encodeURIComponent(`${r.sold ? 'Looking for' : 'Record inquiry'}: ${r.title} (${r.catalog})`);
    ask.href = `mailto:${SHOP.email}?subject=${subject}`;
    ask.textContent = r.sold ? 'Ask me to keep an eye out' : 'Ask about this record';

    const main = $('detail-main');
    fallback(main);
    main.src = url(images[0]) || SHOP.noCover;
    main.alt = r.title;

    const thumbs = $('detail-thumbs');
    thumbs.replaceChildren();
    if (images.length > 1) {
      images.forEach((src, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'thumb' + (i === 0 ? ' is-active' : '');
        b.setAttribute('aria-label', `Photo ${i + 1}`);
        const im = new Image();
        fallback(im);
        im.src = url(src);
        im.alt = '';
        b.appendChild(im);
        b.addEventListener('click', () => {
          fallback(main);
          main.src = url(src);
          thumbs.querySelectorAll('.thumb').forEach(t => t.classList.remove('is-active'));
          b.classList.add('is-active');
        });
        thumbs.appendChild(b);
      });
    }

    document.title = `${r.title} · ${siteTitle}`;
    if (!dlg.open) dlg.showModal();
  }

  const siteTitle = document.title;
  function close() {
    if (dlg.open) dlg.close();
  }
  dlg.addEventListener('close', () => {
    document.title = siteTitle;
    if (bySlug.has(location.hash.slice(1))) history.pushState(null, '', location.pathname + location.search);
  });
  $('detail-close').addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });

  function route() {
    const slug = decodeURIComponent(location.hash.slice(1));
    if (bySlug.has(slug)) open(slug);
    else close();
  }
  window.addEventListener('hashchange', route);
  route();
})();
