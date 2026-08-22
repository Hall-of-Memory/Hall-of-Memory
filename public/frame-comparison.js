(() => {
  const sliders = Array.from(document.querySelectorAll('[data-frame-size]'));
  const consumers = Array.from(document.querySelectorAll('[data-frame-consumer]'));
  if (sliders.length === 0 || consumers.length === 0) return;

  const clamp = (value) => Math.max(0, Math.min(100, value));
  const params = new URL(window.location.href).searchParams;
  const explicitSize = Number.parseFloat(params.get('bildgroesse') ?? '');
  const legacySize = params.get('bild') === 'full' ? 100 : params.get('bild') === 'inner' ? 0 : Number.NaN;
  let imageSize = Number.isFinite(explicitSize) ? clamp(explicitSize) : Number.isFinite(legacySize) ? legacySize : 50;

  const syncUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('bild');
    url.searchParams.delete('kasten');
    if (imageSize === 50) url.searchParams.delete('bildgroesse');
    else url.searchParams.set('bildgroesse', String(Math.round(imageSize)));
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const render = (writeUrl = false) => {
    for (const slider of sliders) slider.value = String(imageSize);
    for (const consumer of consumers) {
      const inner = Number.parseFloat(consumer.dataset.frameInsetInner ?? '');
      const outer = Number.parseFloat(consumer.dataset.frameInsetOuter ?? '');
      if (!Number.isFinite(inner) || !Number.isFinite(outer)) continue;
      const inset = inner + (outer - inner) * (imageSize / 100);
      const size = 100 - inset * 2;
      consumer.style.setProperty('--demo-photo-inset', `${inset.toFixed(3)}%`);
      consumer.style.setProperty('--demo-photo-size', `${size.toFixed(3)}%`);
      consumer.dataset.frameSize = String(Math.round(imageSize));
    }
    if (writeUrl) syncUrl();
  };

  render(false);
  if (params.has('bild') || params.has('kasten')) syncUrl();

  for (const slider of sliders) {
    slider.addEventListener('input', () => {
      imageSize = clamp(Number.parseFloat(slider.value));
      render(false);
    });
    slider.addEventListener('change', () => render(true));
  }
})();
