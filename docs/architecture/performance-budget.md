# Performance budget

T0024 establishes a repeatable production benchmark for the public experience.
The automated audit runs against `next start`, not the development server, in
desktop and mobile Chromium profiles.

## Route budget

The homepage must stay within all of these local production thresholds:

- DOM content loaded: less than 2.5 seconds
- First Contentful Paint: less than 1.8 seconds when local Chromium exposes the
  paint entry
- Largest Contentful Paint: less than 2.5 seconds when local Chromium exposes
  the observer entry
- Cumulative Layout Shift: no more than 0.1
- JavaScript transfer: less than 500 KB
- Image transfer during initial navigation: less than 1.5 MB
- Total initial transfer: less than 2.5 MB

Run `pnpm build` followed by `pnpm test:performance` to reproduce the audit.
Local measurements are regression budgets rather than field data; production
monitoring should later validate Core Web Vitals on representative devices and
networks.

## Delivery rules

- Only the route's Largest Contentful Paint candidate receives high priority.
- Below-fold images remain lazy and use responsive `sizes` declarations.
- Image delivery prefers AVIF and WebP with controlled quality values.
- Repository-managed media and reference files receive immutable one-year
  browser caching. Replace an asset with a new path when its contents change.
- Below-fold homepage sections use render deferral with an intrinsic-size
  placeholder to reduce initial layout and paint work without causing shifts.
