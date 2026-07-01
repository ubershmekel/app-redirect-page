export type FallbackMode = "buttons" | "none";
export type StylesMode = "default" | "none";

export type Options = {
  iosUrl?: string;
  androidUrl?: string;

  // behavior
  fallback?: FallbackMode; // default "buttons"
  targetSelector?: string | Element; // default: render after current <script>
  delayMs?: number; // time until redirect occurs in ms, default 0
  redirect?: boolean; // default true; if false, always render buttons
  styles?: StylesMode; // default "default"; set "none" for fully host-styled UI

  // copy / UI
  heading?: string; // default ""
  iosLabel?: string; // default "Download on the App Store"
  androidLabel?: string; // default "Get it on Google Play"
  openInNewTab?: boolean; // default false
  className?: string; // optional extra classes on the fallback root
};

type RenderTarget = {
  element: Element;
  mode: "append" | "after";
};

type NormalizedOptions = Required<Options> & { target: RenderTarget };

const DEFAULT_STYLE_ID = "app-redirect-page-default-styles";

function ensureDefaultStyles() {
  if (document.getElementById(DEFAULT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = DEFAULT_STYLE_ID;
  style.textContent = `
.app-redirect-page {
  box-sizing: border-box;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  max-width: 560px;
  margin: 24px auto;
  padding: 16px;
}
.app-redirect-page__heading {
  font-size: 18px;
  font-weight: 650;
  margin-bottom: 12px;
}
.app-redirect-page__link {
  display: block;
  padding: 8px 0;
  margin: 10px 0;
  text-decoration: none;
  background: transparent;
  color: inherit;
}
.app-redirect-page__badge {
  display: block;
  height: 74px;
  width: auto;
}
`;

  (document.head || document.body).appendChild(style);
}

export function detectOs(): "ios" | "android" | "other" {
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);

  // iPadOS 13+ can report MacIntel; catch touch-capable iPads
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" &&
      (navigator as any).maxTouchPoints > 1);

  if (isAndroid) return "android";
  if (isIOS) return "ios";
  return "other";
}

function createAutoTarget(): RenderTarget {
  const script = document.currentScript as HTMLScriptElement | null;
  if (script) {
    return { element: script, mode: "after" };
  }

  return { element: document.body, mode: "append" };
}

function resolveTargetSelector(targetSelector?: string | Element): RenderTarget {
  if (!targetSelector) return createAutoTarget();
  if (typeof targetSelector === "string") {
    const found = document.querySelector(targetSelector);
    return found
      ? { element: found, mode: "append" }
      : createAutoTarget();
  }
  return { element: targetSelector, mode: "append" };
}

function doRedirect(url: string, delayMs: number) {
  if (delayMs > 0) setTimeout(() => window.location.replace(url), delayMs);
  else window.location.replace(url);
}

function resolveBadgeSrc(filename: string) {
  const script = document.currentScript as HTMLScriptElement | null;
  if (script?.src) {
    return new URL(`../images/${filename}`, script.src).toString();
  }
  return `images/${filename}`;
}

function createBadgeLink(
  href: string,
  label: string,
  imageFilename: string,
  openInNewTab: boolean,
  platform: "ios" | "android"
) {
  const a = document.createElement("a");
  a.href = href;
  a.className = `app-redirect-page__link app-redirect-page__link--${platform}`;
  a.setAttribute("data-app-redirect-page-link", platform);
  a.setAttribute("aria-label", label);
  if (openInNewTab) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  const img = document.createElement("img");
  img.src = resolveBadgeSrc(imageFilename);
  img.alt = label;
  img.className = `app-redirect-page__badge app-redirect-page__badge--${platform}`;
  img.setAttribute("data-app-redirect-page-badge", platform);
  a.appendChild(img);
  return a;
}

function renderButtons(
  target: RenderTarget,
  opts: Required<
    Pick<
      Options,
      | "heading"
      | "iosLabel"
      | "iosUrl"
      | "androidLabel"
      | "androidUrl"
      | "openInNewTab"
      | "styles"
      | "className"
    >
  >
) {
  if (opts.styles === "default") ensureDefaultStyles();

  const container = document.createElement("div");
  container.className = ["app-redirect-page", "app-redirect-page--fallback", opts.className]
    .filter(Boolean)
    .join(" ");
  container.setAttribute("data-app-redirect-page", "fallback");

  if (opts.heading) {
    const h = document.createElement("div");
    h.className = "app-redirect-page__heading";
    h.setAttribute("data-app-redirect-page-heading", "");
    h.textContent = opts.heading;
    container.appendChild(h);
  }
  if (opts.iosUrl) {
    container.appendChild(
      createBadgeLink(
        opts.iosUrl,
        opts.iosLabel,
        "Download_on_the_App_Store_Badge.svg",
        opts.openInNewTab,
        "ios"
      )
    );
  }
  if (opts.androidUrl) {
    container.appendChild(
      createBadgeLink(
        opts.androidUrl,
        opts.androidLabel,
        "GetItOnGooglePlay_Badge_Web_color_English.svg",
        opts.openInNewTab,
        "android"
      )
    );
  }

  if (target.mode === "after") {
    const existing = target.element.nextElementSibling;
    if (existing?.getAttribute("data-app-redirect-page") === "fallback") {
      existing.remove();
    }
    target.element.parentNode?.insertBefore(container, target.element.nextSibling);
    return;
  }

  const existing = target.element.querySelector('[data-app-redirect-page="fallback"]');
  if (existing?.parentElement === target.element) existing.remove();
  target.element.appendChild(container);
}

function normalizeOptions(options: Options): NormalizedOptions {
  const opts: Required<Options> = {
    fallback: options.fallback ?? "buttons",
    delayMs: options.delayMs ?? 0,
    redirect: options.redirect ?? true,
    styles: options.styles ?? "default",
    heading: options.heading ?? "",
    iosLabel: options.iosLabel ?? "Download on the Apple App Store",
    androidLabel: options.androidLabel ?? "Get it on Google Play",
    openInNewTab: options.openInNewTab ?? false,
    className: options.className ?? "",
    androidUrl: options.androidUrl ?? "",
    iosUrl: options.iosUrl ?? "",
    targetSelector: options.targetSelector ?? "",
  };

  return {
    ...opts,
    target: resolveTargetSelector(opts.targetSelector),
  };
}

export function parseScriptOptions(script: HTMLScriptElement): Options {
  const options: Options = {
    iosUrl: script.dataset.ios,
    androidUrl: script.dataset.android,
    fallback: script.dataset.fallback as any,
    targetSelector: script.dataset.targetSelector || undefined,
    delayMs: script.dataset.delayms
      ? Number(script.dataset.delayms)
      : undefined,
    redirect: script.dataset.redirect
      ? script.dataset.redirect !== "false"
      : undefined,
    styles: script.dataset.styles as StylesMode | undefined,
    heading: script.dataset.heading,
    iosLabel: script.dataset.iosLabel,
    androidLabel: script.dataset.androidLabel,
    openInNewTab: script.dataset.newtab === "true",
    className: script.dataset.className,
  };

  return options;
}

export function redirectOrRender(options: Options) {
  const opts = normalizeOptions(options);
  const target = opts.target;

  if (opts.fallback === "buttons") {
    renderButtons(target, {
      heading: opts.heading,
      iosLabel: opts.iosLabel,
      androidLabel: opts.androidLabel,
      iosUrl: opts.iosUrl,
      androidUrl: opts.androidUrl,
      openInNewTab: opts.openInNewTab,
      styles: opts.styles,
      className: opts.className,
    });
  }
  if (opts.redirect) {
    return detectOsRedirect(opts);
  }
}

function detectOsRedirect(opts: Required<Options>) {
  const os = detectOs();
  if (os === "ios" && opts.iosUrl) return doRedirect(opts.iosUrl, opts.delayMs);
  if (os === "android" && opts.androidUrl) {
    return doRedirect(opts.androidUrl, opts.delayMs);
  }
}
