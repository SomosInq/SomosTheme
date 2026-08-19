# Theme quality

## Local requirements

- Node.js 20 or newer
- Shopify CLI

Install the development dependencies once with `npm install`.

## Checks

Run the complete quality suite with:

```sh
npm run check
```

The suite includes Shopify Theme Check, JavaScript syntax validation, JSON parsing, and Prettier verification. Individual
checks are available as `check:theme`, `check:javascript`, `check:json`, and `check:format`. Use `npm run format` to apply
supported formatting changes.

Theme Check findings are treated as defects. Do not add exclusions to `.theme-check.yml` merely to make CI green; an
exception should explain why the flagged pattern is necessary.

## Pull-request checklist

- Run `npm run check`.
- Preview every changed template at desktop and mobile widths.
- Test keyboard navigation, visible focus, labels, status announcements, and reduced-motion behavior.
- Test empty, loading, error, sold-out, long-content, and missing-image states where relevant.
- Check the browser console for errors.
- For commerce changes, verify variant changes, add to cart, cart updates, discounts, and accelerated checkout as applicable.
- For visual changes, compare screenshots of the affected views before and after the change.
- For performance-sensitive changes, compare Shopify Theme Inspector or Lighthouse results and record material regressions.

## Automated CI

`.github/workflows/quality.yml` runs on pull requests and pushes to `main`. A pull request is not ready to merge while any
quality job is failing.

## Store-dependent testing

Automated browser, accessibility, and Lighthouse tests require a stable Shopify preview URL and storefront credentials.
Until those are configured in CI, they remain required manual checks. When a stable preview environment exists, add its
URL as a repository secret and automate the same critical paths listed above; never commit storefront passwords.

## Performance budgets

Until page-specific baselines are captured, use these review thresholds:

- No new render-blocking third-party script or stylesheet without documented justification.
- Images must include intrinsic dimensions and use responsive Shopify image URLs.
- New JavaScript should be deferred and loaded only on templates that need it.
- Treat a Lighthouse performance decrease of five or more points as a regression requiring investigation.
- Treat a 10% or greater increase in transferred JavaScript on an affected page as a regression requiring investigation.

## Release evidence

For each release, record the theme version, Shopify preview theme ID, quality-check result, templates tested, known issues,
and rollback theme ID in the pull request or release notes. Publish only after another person has reviewed the preview.
