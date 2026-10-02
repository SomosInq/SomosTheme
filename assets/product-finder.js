function initProductFinder(root) {
  if (!root || root.dataset.finderInitialized === 'true') return;
  root.dataset.finderInitialized = 'true';

  const form = root.querySelector('[data-finder-form]');
  const search = root.querySelector('[data-finder-search]');
  const clearSearch = root.querySelector('[data-finder-clear-search]');
  const typeInputs = Array.from(root.querySelectorAll('[data-finder-type]'));
  const vendor = root.querySelector('[data-finder-vendor]');
  const available = root.querySelector('[data-finder-available]');
  const price = root.querySelector('[data-finder-price]');
  const priceOutput = root.querySelector('[data-finder-price-output]');
  const sort = root.querySelector('[data-finder-sort]');
  const grid = root.querySelector('[data-finder-grid]');
  const cards = Array.from(root.querySelectorAll('[data-finder-card]'));
  const count = root.querySelector('[data-finder-count]');
  const empty = root.querySelector('[data-finder-empty]');
  const resetButtons = Array.from(root.querySelectorAll('[data-finder-reset]'));
  const currency = root.dataset.currency || 'USD';

  if (!form || !search || !grid || !cards.length) return;

  const money = new Intl.NumberFormat(document.documentElement.lang || 'en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  const selectedType = () => typeInputs.find((input) => input.checked)?.value || '';

  const updatePriceLabel = () => {
    if (!price || !priceOutput) return;
    priceOutput.textContent =
      Number(price.value) >= Number(price.max) ? 'Any price' : `Up to ${money.format(price.value)}`;
  };

  const applyFilters = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const type = selectedType();
    const vendorValue = vendor?.value || '';
    const onlyAvailable = available?.checked || false;
    const maximumPrice = price ? Number(price.value) * 100 : Number.POSITIVE_INFINITY;
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesQuery = !query || card.dataset.index.includes(query);
      const matchesType = !type || card.dataset.type === type;
      const matchesVendor = !vendorValue || card.dataset.vendor === vendorValue;
      const matchesAvailability = !onlyAvailable || card.dataset.available === 'true';
      const matchesPrice = Number(card.dataset.price) <= maximumPrice;
      const isVisible = matchesQuery && matchesType && matchesVendor && matchesAvailability && matchesPrice;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (count) count.textContent = `${visibleCount} ${visibleCount === 1 ? 'product' : 'products'}`;
    if (empty) empty.hidden = visibleCount > 0;
    if (clearSearch) clearSearch.hidden = query.length === 0;
    updatePriceLabel();
  };

  const sortCards = () => {
    const value = sort?.value || 'featured';
    const sortedCards = [...cards].sort((first, second) => {
      if (value === 'price-ascending') return Number(first.dataset.price) - Number(second.dataset.price);
      if (value === 'price-descending') return Number(second.dataset.price) - Number(first.dataset.price);
      if (value === 'title-ascending') return first.dataset.title.localeCompare(second.dataset.title);
      return Number(first.dataset.position) - Number(second.dataset.position);
    });

    sortedCards.forEach((card) => grid.appendChild(card));
    applyFilters();
  };

  const reset = () => {
    form.reset();
    if (vendor) vendor.value = '';
    if (available) available.checked = false;
    if (price) price.value = price.max;
    if (sort) sort.value = 'featured';
    typeInputs.forEach((input, index) => {
      input.checked = index === 0;
    });
    sortCards();
    search.focus();
  };

  form.addEventListener('submit', (event) => event.preventDefault());
  search.addEventListener('input', applyFilters);
  clearSearch?.addEventListener('click', () => {
    search.value = '';
    applyFilters();
    search.focus();
  });
  typeInputs.forEach((input) => input.addEventListener('change', applyFilters));
  vendor?.addEventListener('change', applyFilters);
  available?.addEventListener('change', applyFilters);
  price?.addEventListener('input', applyFilters);
  sort?.addEventListener('change', sortCards);
  resetButtons.forEach((button) => button.addEventListener('click', reset));

  updatePriceLabel();
  applyFilters();
}

function initProductFinders(scope = document) {
  scope.querySelectorAll('[data-product-finder]').forEach(initProductFinder);
}

document.addEventListener('DOMContentLoaded', () => initProductFinders());
document.addEventListener('shopify:section:load', (event) => initProductFinders(event.target));
