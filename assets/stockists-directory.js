(() => {
  const initialise = (root) => {
    if (!root || root.dataset.stockistsReady === 'true') return;
    root.dataset.stockistsReady = 'true';
    const search = root.querySelector('[data-stockist-search]');
    const filters = [...root.querySelectorAll('[data-stockist-filter]')];
    const cards = [...root.querySelectorAll('[data-stockist-card]')];
    const pins = [...root.querySelectorAll('[data-stockist-pin]')];
    const count = root.querySelector('[data-stockist-count]');
    const empty = root.querySelector('[data-stockist-empty]');
    const resets = [...root.querySelectorAll('[data-stockist-reset]')];
    let region = 'all';
    const classToggle = (element, className, force) => element.classList.toggle(className, force);
    const highlight = (id) => {
      cards.forEach((card) => classToggle(card, 'is-active', card.dataset.stockistCard === id));
      pins.forEach((pin) => classToggle(pin, 'is-active', pin.dataset.stockistPin === id));
    };
    const update = () => {
      const query = (search?.value || '').trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const show =
          (!query || card.dataset.stockistIndex.includes(query)) &&
          (region === 'all' || card.dataset.stockistRegion === region);
        card.hidden = !show;
        if (show) visible += 1;
        const pin = root.querySelector(`[data-stockist-pin="${card.dataset.stockistCard}"]`);
        if (pin) pin.hidden = !show;
      });
      if (count) count.textContent = visible;
      if (empty) empty.hidden = visible !== 0;
      resets.forEach((button) => {
        button.hidden = region === 'all' && !query;
      });
    };
    search?.addEventListener('input', update);
    filters.forEach((filter) =>
      filter.addEventListener('click', () => {
        region = filter.dataset.stockistFilter;
        filters.forEach((item) => {
          const active = item === filter;
          classToggle(item, 'is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        update();
      }),
    );
    resets.forEach((button) =>
      button.addEventListener('click', () => {
        region = 'all';
        if (search) search.value = '';
        filters.forEach((item) => {
          const active = item.dataset.stockistFilter === 'all';
          classToggle(item, 'is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        update();
      }),
    );
    pins.forEach((pin) =>
      pin.addEventListener('click', () => {
        const id = pin.dataset.stockistPin;
        const card = root.querySelector(`[data-stockist-card="${id}"]`);
        highlight(id);
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => card?.focus({ preventScroll: true }), 450);
      }),
    );
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => highlight(card.dataset.stockistCard));
      card.addEventListener('focusin', () => highlight(card.dataset.stockistCard));
    });
  };
  const initialiseAll = (scope = document) => scope.querySelectorAll('[data-stockists-directory]').forEach(initialise);
  document.addEventListener('DOMContentLoaded', () => initialiseAll());
  document.addEventListener('shopify:section:load', (event) => initialiseAll(event.target));
})();
