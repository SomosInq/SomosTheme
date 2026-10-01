class NewsletterPopup extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    if (!this.dialog || this.dataset.initialized === 'true') return;

    this.dataset.initialized = 'true';
    this.storageKey = `newsletter-popup-${this.dataset.sectionId}`;
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.querySelectorAll('[data-newsletter-close]').forEach((button) => {
      button.addEventListener('click', () => this.dismiss(), { signal });
    });

    this.dialog.addEventListener(
      'click',
      (event) => {
        if (event.target === this.dialog) this.dismiss();
      },
      { signal },
    );

    this.dialog.addEventListener('cancel', () => this.recordDismissal(), { signal });

    document.addEventListener(
      'shopify:section:select',
      (event) => {
        if (event.detail.sectionId === this.dataset.sectionId) this.open();
      },
      { signal },
    );

    const hasSuccess = this.querySelector('[data-newsletter-success]');
    const hasErrors = this.querySelector('[data-newsletter-errors]');
    if (hasSuccess || hasErrors) {
      if (hasSuccess) this.recordDismissal();
      this.open();
      (hasSuccess || hasErrors)?.focus();
      return;
    }

    if (window.Shopify?.designMode || this.wasRecentlyDismissed()) return;

    const delay = Number(this.dataset.delayMs) || 0;
    this.timer = window.setTimeout(() => this.open(), delay);

    const scrollPercent = Number(this.dataset.scrollPercent);
    if (scrollPercent > 0) {
      window.addEventListener('scroll', this.handleScroll, { passive: true, signal });
    }
  }

  disconnectedCallback() {
    window.clearTimeout(this.timer);
    this.abortController?.abort();
  }

  handleScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const progress = (window.scrollY / scrollable) * 100;
    if (progress >= Number(this.dataset.scrollPercent)) this.open();
  };

  open() {
    if (this.dialog.open) return;
    window.clearTimeout(this.timer);
    window.removeEventListener('scroll', this.handleScroll);
    this.dialog.showModal();
  }

  dismiss() {
    this.recordDismissal();
    this.dialog.close();
  }

  recordDismissal() {
    try {
      localStorage.setItem(this.storageKey, String(Date.now()));
    } catch (_error) {
      // The popup still works when browser storage is unavailable.
    }
  }

  wasRecentlyDismissed() {
    try {
      const dismissedAt = Number(localStorage.getItem(this.storageKey));
      const frequency = Number(this.dataset.frequencyDays) * 24 * 60 * 60 * 1000;
      return dismissedAt > 0 && Date.now() - dismissedAt < frequency;
    } catch (_error) {
      return false;
    }
  }
}

if (!customElements.get('newsletter-popup')) {
  customElements.define('newsletter-popup', NewsletterPopup);
}
