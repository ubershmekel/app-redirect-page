# app-redirect-page

Drop-in `<script>` to redirect iOS and Android users to the right store and
show App Store / Play Store buttons everywhere else. Ideal for GitHub Pages and
simple landing pages.

## Why use this

- One tag, no build step, CDN hosted
- OS detection for iOS, Android, and everything else
- Automatic fallback UI for desktop and bots
- Configurable copy, delay, and target element

## Quick start

Add this to the `<body>` of your redirect page:

```html
<script
  src="https://cdn.jsdelivr.net/npm/app-redirect-page/dist/app-redirect-page.js"
  data-ios="YOUR_IOS_APP_LINK"
  data-android="YOUR_ANDROID_APP_LINK"
></script>
```

Live example:
https://ubershmekel.github.io/zensnake/app/

```html
<script
  src="https://cdn.jsdelivr.net/npm/app-redirect-page/dist/app-redirect-page.js"
  data-ios="https://apps.apple.com/us/app/kat-and-noodles/id6755672232"
  data-android="https://play.google.com/store/apps/details?id=com.andluck.zensnake"
></script>
```

## How it works

- iOS: redirects to `data-ios`
- Android: redirects to `data-android`
- Other: renders store badges and stays on the page

## Configuration

All options are set as `data-*` attributes on the script tag.

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `data-ios` | string | - | iOS App Store URL |
| `data-android` | string | - | Google Play URL |
| `data-fallback` | `buttons` \| `none` | `buttons` | Render store buttons when not redirecting |
| `data-target-selector` | string | `document.body` | CSS selector to replace with fallback UI |
| `data-delayms` | number | `0` | Delay before redirect (milliseconds) |
| `data-redirect` | boolean | `true` | If `false`, never redirect (always show buttons) |
| `data-heading` | string | `Get the app` | Heading text above buttons |
| `data-ios-label` | string | `Download on the App Store` | Accessible label for iOS badge |
| `data-android-label` | string | `Get it on Google Play` | Accessible label for Android badge |
| `data-newtab` | boolean | `false` | Open store links in a new tab |

Example with options:

```html
<script
  src="https://cdn.jsdelivr.net/npm/app-redirect-page/dist/app-redirect-page.js"
  data-ios="https://apps.apple.com/app/id000000000"
  data-android="https://play.google.com/store/apps/details?id=com.example.app"
  data-delayms="350"
  data-heading="Get the full app"
  data-target-selector="#app-cta"
  data-newtab="true"
></script>
```

## Develop locally

- Install deps: `npm install`
- Start the watcher + preview page: `npm run dev`
- Open `http://localhost:4173/examples/` to see the snippet in action
- The example page loads `dist/app-redirect-page.js`

## License

MIT. See `LICENSE`.