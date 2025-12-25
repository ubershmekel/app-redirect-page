# app-redirect-page

A drop-in `<script>` that redirects iOS → App Store, Android → Play Store, and
shows fallback buttons on unknown OS (desktop, bots, etc). Perfect for GitHub
Pages.

## Quick start (no build tools)

```html
<script
  src="https://cdn.jsdelivr.net/npm/app-redirect-page@1/dist/app-redirect-page.js"
  data-ios="YOUR_IOS_APP_LINK"
  data-android="YOUR_ANDROID_APP_LINK"
></script>
```

## Develop locally

- Install deps: `npm install`
- Start the watcher + preview page: `npm run dev`
- Open `http://localhost:4173/dev/` to see the snippet from
  `dist/app-redirect-page.js` included in an HTML page. Mobile should redirect;
  desktop shows the fallback buttons. Edit `dev/index.html` to tweak the sample
  attributes.
