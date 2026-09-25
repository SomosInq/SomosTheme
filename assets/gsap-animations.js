// Section entrance animations using browser-native APIs.
// Configuration is provided by theme-animations-config.liquid.

(function () {
  const config = window.themeAnimations;

  if (!config?.enabled) return;
  if (config.respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const animationVariants = {
    'fade-in': { opacity: 0, transform: 'none' },
    'fade-up': { opacity: 0, transform: 'translate3d(0, 40px, 0)' },
    'slide-in-left': { opacity: 0, transform: 'translate3d(-40px, 0, 0)' },
    'slide-in-right': { opacity: 0, transform: 'translate3d(40px, 0, 0)' },
    'zoom-in': { opacity: 0, transform: 'scale(0.8)' },
  };

  const easingMap = {
    'power1.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'power2.out': 'cubic-bezier(0.22, 1, 0.36, 1)',
    'power3.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'expo.out': 'cubic-bezier(0.19, 1, 0.22, 1)',
  };

  const animatedElements = new WeakSet();
  const activeAnimations = new WeakMap();

  function numberOrDefault(value, fallback) {
    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  function observerOptions(trigger, element) {
    if (trigger === 'center') {
      return { rootMargin: '-45% 0px -45% 0px', threshold: 0 };
    }

    if (trigger === 'visible') {
      const visibleRatio = Math.min(1, window.innerHeight / Math.max(element.offsetHeight, 1));
      return { threshold: Math.max(0.01, visibleRatio) };
    }

    return { rootMargin: '0px 0px -20% 0px', threshold: 0 };
  }

  function clearInitialState(element) {
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  }

  function playAnimation(element, settings) {
    activeAnimations.get(element)?.cancel();

    const animation = element.animate([settings.from, { opacity: 1, transform: 'none' }], {
      duration: settings.duration * 1000,
      delay: settings.delay * 1000,
      easing: easingMap[settings.ease] || settings.ease || easingMap['power2.out'],
      fill: 'none',
    });

    activeAnimations.set(element, animation);
    clearInitialState(element);
    animation.finished
      .catch(() => {})
      .finally(() => {
        if (activeAnimations.get(element) === animation) activeAnimations.delete(element);
      });
  }

  function prepareSection(element) {
    if (animatedElements.has(element) || element.dataset.animate === 'none') return;

    const style = element.dataset.animate || config.defaultStyle;
    const from = animationVariants[style];

    // The theme setting and per-section opt-out both leave the section fully visible.
    if (!from) return;

    animatedElements.add(element);

    const settings = {
      from,
      duration: numberOrDefault(element.dataset.animateDuration, config.defaultDuration),
      delay: numberOrDefault(element.dataset.animateDelay, config.defaultDelay),
      ease: element.dataset.animateEase || config.defaultEase,
      once: (element.dataset.animateRepeat || config.repeat) === 'once',
    };

    element.style.opacity = String(from.opacity);
    element.style.transform = from.transform;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          playAnimation(element, settings);
          if (settings.once) observer.unobserve(element);
        });
      },
      observerOptions(config.scrollTrigger, element),
    );

    observer.observe(element);
  }

  function animateSections(root = document) {
    const selector = '#MainContent > .shopify-section';
    const sections = root.matches?.(selector) ? [root] : [...root.querySelectorAll(selector)];

    sections.forEach(prepareSection);
  }

  animateSections();
  document.addEventListener('shopify:section:load', (event) => animateSections(event.target));
})();
