document.addEventListener('DOMContentLoaded', () => {
  initAnalytics();
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
    const value = raw ? JSON.parse(raw) : fallback;
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function readStorageArray(key, fallback = []) {
  const value = safeStorage(key, fallback);
  return Array.isArray(value) ? value : fallback;
}

function readStorageObject(key, fallback = {}) {
  const value = safeStorage(key, fallback);
  return value && typeof value === 'object' ? value : fallback;
}

function setStatus(element, message) {
  if (!element) return;
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  element.textContent = message;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function safeHref(value) {
  if (!value) return '';

  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (error) {
    return '';
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Could not persist feature data', error);
  }
}

function dispatchAnalyticsEvent(eventName, payload = {}) {
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(eventData);
  }

  document.dispatchEvent(new CustomEvent('theme:analytics', { detail: eventData, bubbles: true }));
}

function showToast(message, tone = 'success') {
  let toast = document.querySelector('[data-theme-toast]');

  if (!toast) {
    toast = document.createElement('div');
    toast.dataset.themeToast = 'true';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.position = 'fixed';
    toast.style.right = '1rem';
    toast.style.bottom = '1rem';
    toast.style.zIndex = '2000';
    toast.style.maxWidth = '22rem';
    toast.style.padding = '0.75rem 1rem';
    toast.style.borderRadius = '999px';
    toast.style.fontSize = '0.875rem';
    toast.style.fontWeight = '600';
    toast.style.background = tone === 'error' ? 'rgba(160, 20, 20, 0.92)' : 'rgba(20, 70, 45, 0.92)';
    toast.style.color = '#fff';
    toast.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
  }, 2400);
}

function initAnalytics() {
  const pathname = window.location.pathname || '';

  if (pathname.includes('/products/')) {
    const productId = document.querySelector('input[name="id"]')?.value || '';
    const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
    const url = document.querySelector('meta[property="og:url"]')?.content || window.location.href;
    const handle = pathname.split('/products/')[1]?.split('/')[0] || '';

    dispatchAnalyticsEvent('product_view', {
      product_id: productId,
      product_handle: handle,
      product_title: title,
      product_url: url,
    });
  }

  document.addEventListener('cart:update', (event) => {
    const data = event.detail?.data ?? {};
    const productId = data.productId || document.querySelector('input[name="id"]')?.value || '';
    const itemCount = Number(data.itemCount || 1);

    dispatchAnalyticsEvent('add_to_cart', {
      product_id: productId,
      item_count: itemCount,
      source: data.source || 'unknown',
    });

    if (itemCount > 0) {
      showToast(itemCount > 1 ? `${itemCount} items added to cart` : 'Item added to cart');
    }
  });
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
          count: 0,
        };
      }
      accumulator[key].count += 1;
      return accumulator;
    }, {});

    const topRecommendation = Object.values(score).sort((a, b) => b.count - a.count)[0] || {
      title: 'Recommendation ready',
      body: 'Add some answer options in the theme editor to create tailored recommendations.',
      link: '/collections/all',
    };

    if (resultTitle) resultTitle.textContent = topRecommendation.title;
    if (resultBody) resultBody.textContent = topRecommendation.body;
    if (resultLink) {
      const link = safeHref(topRecommendation.link) || '/collections/all';
      resultLink.href = link;
      const isCollectionLink = new URL(link, window.location.origin).pathname === '/collections/all';
      resultLink.textContent = isCollectionLink ? 'Browse the collection' : 'Open the matching page';
    }

    result.hidden = false;
    result.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  });
}

function initWishlist() {
  const wishlistKey = 'somos_wishlist_items';
  const buttons = Array.from(document.querySelectorAll('[data-wishlist-toggle]'));
  const list = document.querySelector('[data-wishlist-list]');
  const emptyState = document.querySelector('[data-wishlist-empty]');
  const clearButton = document.querySelector('[data-wishlist-clear]');

  function getItems() {
    return readStorageArray(wishlistKey, []);
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

    list.replaceChildren(
      ...items.map((item) => {
        const article = document.createElement('article');
        article.className = 'page-card page-card--product';

        const body = document.createElement('div');
        body.className = 'page-card__body';

        const eyebrow = document.createElement('span');
        eyebrow.className = 'page-card__eyebrow';
        eyebrow.textContent = 'Saved item';

        const title = document.createElement('h2');
        title.textContent = item.title || 'Saved product';

        const description = document.createElement('p');
        const url = safeHref(item.url);
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.textContent = 'Open product';
          description.append(link);
        } else {
          description.textContent = 'Saved for later';
        }

        body.append(eyebrow, title, description);

        const footer = document.createElement('div');
        footer.className = 'page-card__footer';

        const removeButton = document.createElement('button');
        removeButton.className = 'button button-secondary';
        removeButton.type = 'button';
        removeButton.dataset.wishlistRemove = item.handle;
        removeButton.textContent = 'Remove';

        footer.append(removeButton);
        article.append(body, footer);
        return article;
      }),
    );
  }

  buttons.forEach((button) => {
    const handle = button.dataset.wishlistHandle;
    const items = getItems();
    const isSaved = items.some((item) => item.handle === handle);
    button.classList.toggle('is-active', isSaved);
    button.setAttribute('aria-pressed', String(isSaved));
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
              url: button.dataset.wishlistUrl || '#',
            },
          ];
      saveItems(nextItems);
      button.classList.toggle('is-active', !exists);
      button.setAttribute('aria-pressed', String(!exists));
      button.textContent = exists ? 'Save for later' : 'Saved';
    });
  });

  list?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-wishlist-remove]');
    if (!removeButton) return;

    const handle = removeButton.dataset.wishlistRemove;
    const items = getItems().filter((item) => item.handle !== handle);
    saveItems(items);
    buttons.forEach((button) => {
      if (button.dataset.wishlistHandle === handle) {
        button.classList.remove('is-active');
        button.setAttribute('aria-pressed', 'false');
        button.textContent = 'Save for later';
      }
    });
  });

  clearButton?.addEventListener('click', () => {
    saveItems([]);
    buttons.forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
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
    const storedItems = safeStorage(key, []);
    const items = Array.isArray(storedItems) ? storedItems : [];
    const filtered = [item, ...items.filter((entry) => entry.handle !== handle)].slice(0, 6);
    writeStorage(key, filtered);
  }

  const storedItems = safeStorage(key, []);
  const items = Array.isArray(storedItems) ? storedItems : [];
  if (!items.length) {
    container.innerHTML = '<div class="page-card"><p>No recent products yet.</p></div>';
    return;
  }

  container.replaceChildren(
    ...items.map((item) => {
      const article = document.createElement('article');
      article.className = 'page-card';

      const body = document.createElement('div');
      body.className = 'page-card__body';

      const eyebrow = document.createElement('span');
      eyebrow.className = 'page-card__eyebrow';
      eyebrow.textContent = 'Recently viewed';

      const title = document.createElement('h2');
      title.textContent = item.title || 'Recently viewed product';

      const description = document.createElement('p');
      const url = safeHref(item.url);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.textContent = 'View product';
        description.append(link);
      } else {
        description.textContent = 'Recently viewed';
      }

      body.append(eyebrow, title, description);
      article.append(body);
      return article;
    }),
  );
}

function initBackInStock() {
  const form = document.querySelector('.js-back-in-stock-form');
  const status = document.querySelector('[data-back-in-stock-status]');
  if (!form || !status) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (submitButton?.disabled) return;

    const email = form.querySelector('input[name="email"]').value.trim();
    const product = form.querySelector('input[name="product"]').value.trim();
    if (!email || !product) {
      setStatus(status, 'Please complete both the email and product name fields before submitting.');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    const key = 'somos_back_in_stock';
    const entries = readStorageArray(key, []);
    entries.unshift({ email, product, createdAt: new Date().toISOString() });
    writeStorage(key, entries.slice(0, 10));
    setStatus(status, `Thanks! We will notify ${email} when ${product} is back in stock.`);
    form.reset();

    submitButton.disabled = false;
    submitButton.textContent = 'Notify me';
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
  const submitButton = form.querySelector('button[type="submit"]');
  const copyButton = widget.querySelector('[data-copy-link]');

  function updateCount() {
    const state = readStorageObject(key, { count: 0 });
    state.count = Number.isFinite(Number(state.count)) ? Number(state.count) : 0;
    count.textContent = state.count;
    setStatus(status, `You have earned ${state.count * 10} reward points.`);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (submitButton?.disabled) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    const state = readStorageObject(key, { count: 0 });
    state.count = Number.isFinite(Number(state.count)) ? Number(state.count) : 0;
    state.count += 1;
    writeStorage(key, state);
    updateCount();
    setStatus(status, `Invite sent. Your reward link is ${inviteLink}`);

    submitButton.disabled = false;
    submitButton.textContent = 'Send invite';
  });

  copyButton?.addEventListener('click', () => {
    if (copyButton.disabled) return;

    copyButton.disabled = true;
    copyButton.textContent = 'Copying...';

    const copyLink = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(inviteLink)
      : Promise.reject(new Error('Clipboard API unavailable'));

    copyLink
      .then(() => {
        const state = readStorageObject(key, { count: 0 });
        state.count = Number.isFinite(Number(state.count)) ? Number(state.count) : 0;
        state.count += 1;
        writeStorage(key, state);
        updateCount();
        setStatus(status, 'Invite link copied. Your friend can redeem it instantly.');
      })
      .catch(() => setStatus(status, 'Copy failed. Select and copy the invite link manually.'))
      .finally(() => {
        copyButton.disabled = false;
        copyButton.textContent = 'Copy invite link';
      });
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

  results.setAttribute('aria-live', 'polite');
  results.setAttribute('aria-atomic', 'true');

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`Store data request failed: ${response.status}`);
      return response.json();
    })
    .then((stores) => {
      if (!Array.isArray(stores)) throw new Error('Store data must be an array');

      function renderList(query = '') {
        const normalized = query.trim().toLowerCase();
        const filtered = stores.filter((store) => {
          const details = [store?.name, store?.address, store?.city].filter(Boolean).join(' ').toLowerCase();
          return details.includes(normalized);
        });

        if (!filtered.length) {
          const emptyState = document.createElement('div');
          emptyState.className = 'page-card';
          const message = document.createElement('p');
          message.textContent = 'No stores matched your search.';
          emptyState.append(message);
          results.replaceChildren(emptyState);
          return;
        }

        results.replaceChildren(
          ...filtered.map((store) => {
            const article = document.createElement('article');
            article.className = 'page-card page-card--location';

            const name = document.createElement('h2');
            name.textContent = store?.name || 'Store';

            const address = document.createElement('p');
            address.textContent = [store?.address, store?.city].filter(Boolean).join('\n');
            address.style.whiteSpace = 'pre-line';

            const hours = document.createElement('p');
            const label = document.createElement('strong');
            label.textContent = 'Hours: ';
            hours.append(label, document.createTextNode(store?.hours || 'Check with store'));

            article.append(name, address, hours);
            return article;
          }),
        );
      }

      input.addEventListener('input', (event) => renderList(event.target.value));
      renderList();
    })
    .catch(() => {
      const errorState = document.createElement('div');
      errorState.className = 'page-card';
      const message = document.createElement('p');
      message.textContent = 'Store data is temporarily unavailable.';
      errorState.append(message);
      results.replaceChildren(errorState);
    });
}
