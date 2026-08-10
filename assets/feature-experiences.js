document.addEventListener('DOMContentLoaded', () => {
  initQuizFlow();
  initWishlist();
  initRecentlyViewed();
  initBackInStock();
  initReferral();
  initSubscription();
  initStoreLocator();
});

function safeStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Could not persist feature data', error);
  }
}

function initQuizFlow() {
  const form = document.querySelector('.js-quiz-form');
  const result = document.querySelector('.js-quiz-result');
  const resultTitle = result?.querySelector('[data-result-title]');
  const resultBody = result?.querySelector('[data-result-body]');
  const resultLink = result?.querySelector('[data-result-link]');

  if (!form || !result) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const selections = Array.from(form.querySelectorAll('input[type="radio"]:checked'));
    const score = selections.reduce((accumulator, input) => {
      const key = input.dataset.resultTitle + '::' + input.dataset.resultBody + '::' + input.dataset.resultLink;
      if (!accumulator[key]) {
        accumulator[key] = {
          title: input.dataset.resultTitle || 'Recommendation',
          body: input.dataset.resultBody || 'We found the best fit for your needs.',
          link: input.dataset.resultLink || '/collections/all',
          count: 0
        };
      }
      accumulator[key].count += 1;
      return accumulator;
    }, {});

    const topRecommendation = Object.values(score).sort((a, b) => b.count - a.count)[0] || {
      title: 'Recommendation ready',
      body: 'Add some answer options in the theme editor to create tailored recommendations.',
      link: '/collections/all'
    };

    if (resultTitle) resultTitle.textContent = topRecommendation.title;
    if (resultBody) resultBody.textContent = topRecommendation.body;
    if (resultLink) {
      resultLink.href = topRecommendation.link;
      resultLink.textContent = topRecommendation.link === '/collections/all' ? 'Browse the collection' : 'Open the matching page';
    }

    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function initWishlist() {
  const wishlistKey = 'somos_wishlist_items';
  const buttons = Array.from(document.querySelectorAll('[data-wishlist-toggle]'));
  const list = document.querySelector('[data-wishlist-list]');
  const emptyState = document.querySelector('[data-wishlist-empty]');
  const clearButton = document.querySelector('[data-wishlist-clear]');

  function getItems() {
    return safeStorage(wishlistKey, []);
  }

  function saveItems(items) {
    writeStorage(wishlistKey, items);
    renderItems(items);
  }

  function renderItems(items) {
    if (!list) return;

    if (!items.length) {
      list.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    list.innerHTML = items.map((item) => `
      <article class="page-card page-card--product">
        <div class="page-card__body">
          <span class="page-card__eyebrow">Saved item</span>
          <h2>${item.title}</h2>
          <p>${item.url ? `<a href="${item.url}">Open product</a>` : 'Saved for later'}</p>
        </div>
        <div class="page-card__footer">
          <button class="button button-secondary" type="button" data-wishlist-remove="${item.handle}">Remove</button>
        </div>
      </article>
    `).join('');
  }

  buttons.forEach((button) => {
    const handle = button.dataset.wishlistHandle;
    const items = getItems();
    const isSaved = items.some((item) => item.handle === handle);
    button.classList.toggle('is-active', isSaved);
    button.textContent = isSaved ? 'Saved' : 'Save for later';

    button.addEventListener('click', () => {
      const items = getItems();
      const exists = items.some((item) => item.handle === handle);
      const nextItems = exists
        ? items.filter((item) => item.handle !== handle)
        : [
            ...items,
            {
              handle,
              title: button.dataset.wishlistTitle || 'Saved product',
              url: button.dataset.wishlistUrl || '#'
            }
          ];
      saveItems(nextItems);
      button.classList.toggle('is-active', !exists);
      button.textContent = exists ? 'Save for later' : 'Saved';
    });
  });

  list?.querySelectorAll('[data-wishlist-remove]').forEach((removeButton) => {
    removeButton.addEventListener('click', () => {
      const handle = removeButton.dataset.wishlistRemove;
      const items = getItems().filter((item) => item.handle !== handle);
      saveItems(items);
      buttons.forEach((button) => {
        if (button.dataset.wishlistHandle === handle) {
          button.classList.remove('is-active');
          button.textContent = 'Save for later';
        }
      });
    });
  });

  clearButton?.addEventListener('click', () => {
    saveItems([]);
    buttons.forEach((button) => {
      button.classList.remove('is-active');
      button.textContent = 'Save for later';
    });
  });

  renderItems(getItems());
}

function initRecentlyViewed() {
  const container = document.querySelector('[data-recently-viewed]');
  if (!container) return;

  const key = 'somos_recently_viewed';
  const currentPath = window.location.pathname;
  if (currentPath.includes('/products/')) {
    const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
    const url = document.querySelector('meta[property="og:url"]')?.content || window.location.href;
    const image = document.querySelector('meta[property="og:image"]')?.content || '';
    const handle = currentPath.split('/products/')[1].split('/')[0];
    const item = { handle, title, url, image };
    const items = safeStorage(key, []);
    const filtered = [item, ...items.filter((entry) => entry.handle !== handle)].slice(0, 6);
    writeStorage(key, filtered);
  }

  const items = safeStorage(key, []);
  if (!items.length) {
    container.innerHTML = '<div class="page-card"><p>No recent products yet.</p></div>';
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="page-card">
      <div class="page-card__body">
        <span class="page-card__eyebrow">Recently viewed</span>
        <h2>${item.title}</h2>
        <p>${item.url ? `<a href="${item.url}">View product</a>` : 'Recently viewed'}</p>
      </div>
    </article>
  `).join('');
}

function initBackInStock() {
  const form = document.querySelector('.js-back-in-stock-form');
  const status = document.querySelector('[data-back-in-stock-status]');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = form.querySelector('input[name="email"]').value.trim();
    const product = form.querySelector('input[name="product"]').value.trim();
    const key = 'somos_back_in_stock';
    const entries = safeStorage(key, []);
    entries.unshift({ email, product, createdAt: new Date().toISOString() });
    writeStorage(key, entries.slice(0, 10));
    status.textContent = `Thanks! We will notify ${email || 'you'} when ${product || 'this item'} is back in stock.`;
    form.reset();
  });
}

function initReferral() {
  const widget = document.querySelector('[data-referral-widget]');
  const form = widget?.querySelector('.js-referral-form');
  const status = widget?.querySelector('[data-referral-status]');
  const count = widget?.querySelector('[data-referral-count]');
  if (!widget || !form || !status || !count) return;

  const key = 'somos_referrals';
  const inviteLink = widget.dataset.referralLink || `${window.location.origin}/account/register`;

  function updateCount() {
    const state = safeStorage(key, { count: 0 });
    count.textContent = state.count;
    status.textContent = `You have earned ${state.count * 10} reward points.`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = safeStorage(key, { count: 0 });
    state.count += 1;
    writeStorage(key, state);
    updateCount();
    status.textContent = `Invite sent. Your reward link is ${inviteLink}`;
  });

  widget.querySelector('[data-copy-link]')?.addEventListener('click', () => {
    navigator.clipboard.writeText(inviteLink);
    const state = safeStorage(key, { count: 0 });
    state.count += 1;
    writeStorage(key, state);
    updateCount();
    status.textContent = 'Invite link copied. Your friend can redeem it instantly.';
  });

  updateCount();
}

function initSubscription() {
  const form = document.querySelector('.js-subscription-form');
  const status = document.querySelector('[data-subscription-status]');
  if (!form || !status) return;

  form.addEventListener('submit', () => {
    status.textContent = 'Subscription selection saved. You can continue to checkout with your preferred plan.';
  });
}

function initStoreLocator() {
  const widget = document.querySelector('[data-store-locator]');
  const input = widget?.querySelector('[data-store-search]');
  const results = widget?.querySelector('[data-store-results]');
  if (!widget || !input || !results) return;

  const source = widget.dataset.storeLocatorData;

  if (!source) return;

  fetch(source)
    .then((response) => response.json())
    .then((stores) => {
      function renderList(query = '') {
        const normalized = query.toLowerCase();
        const filtered = stores.filter((store) => {
          return [store.name, store.address, store.city].join(' ').toLowerCase().includes(normalized);
        });

        if (!filtered.length) {
          results.innerHTML = '<div class="page-card"><p>No stores matched your search.</p></div>';
          return;
        }

        results.innerHTML = filtered.map((store) => `
          <article class="page-card page-card--location">
            <h2>${store.name}</h2>
            <p>${store.address}<br>${store.city}</p>
            <p><strong>Hours:</strong> ${store.hours}</p>
          </article>
        `).join('');
      }

      input.addEventListener('input', (event) => renderList(event.target.value));
      renderList();
    })
    .catch(() => {
      results.innerHTML = '<div class="page-card"><p>Store data is temporarily unavailable.</p></div>';
    });
}
