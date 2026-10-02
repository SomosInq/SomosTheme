function initBeforeAfterComparison(comparison) {
  if (!comparison || comparison.dataset.comparisonInitialized === 'true') return;
  comparison.dataset.comparisonInitialized = 'true';

  const range = comparison.querySelector('[data-before-after-range]');
  const value = comparison.querySelector('[data-comparison-value]');
  const controls = comparison.querySelectorAll('[data-comparison-show]');

  if (!range) return;

  const update = (nextValue) => {
    const position = Math.max(0, Math.min(100, Number(nextValue)));
    range.value = position;
    comparison.style.setProperty('--comparison-position', `${position}%`);
    range.setAttribute('aria-valuetext', `${position}% after image visible`);
    if (value) value.textContent = Math.round(position);
  };

  range.addEventListener('input', () => update(range.value));
  controls.forEach((control) => {
    control.addEventListener('click', () => {
      update(control.dataset.comparisonShow);
      range.focus();
    });
  });

  update(range.value);
}

function initBeforeAfterComparisons(scope = document) {
  scope.querySelectorAll('[data-before-after]').forEach(initBeforeAfterComparison);
}

document.addEventListener('DOMContentLoaded', () => initBeforeAfterComparisons());
document.addEventListener('shopify:section:load', (event) => initBeforeAfterComparisons(event.target));
