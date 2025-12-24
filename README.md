# app-redirect-page

A drop-in `<script>` that redirects iOS → App Store, Android → Play Store, and
shows fallback buttons on unknown OS (desktop, bots, etc). Perfect for GitHub
Pages.

## Quick start (no build tools)

```html
<div id="app-links"></div>

<script
  src="https://cdn.jsdelivr.net/npm/app-redirect-page@1/dist/snippet.min.js"
  data-ios="https://apps.apple.com/app/idYOUR_APP_ID"
  data-android="https://play.google.com/store/apps/details?id=YOUR.PACKAGE"
  data-fallback="buttons"
  data-target="#app-links"
></script>
```
