export type FallbackMode = "buttons" | "none";

export type Options = {
  iosUrl?: string;
  androidUrl?: string;

  // behavior
  fallback?: FallbackMode; // default "buttons"
  targetSelector?: string | Element; // default: new element after current <script>
  delayMs?: number; // time until redirect occurs in ms, default 0
  redirect?: boolean; // default true; if false, always render buttons

  // copy / UI
  heading?: string; // default "Get the app"
  iosLabel?: string; // default "Download on the App Store"
  androidLabel?: string; // default "Get it on Google Play"
  openInNewTab?: boolean; // default false
};

type NormalizedOptions = Required<Options> & { targetSelector: Element };

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

function resolveTargetSelector(targetSelector?: string | Element): Element {
  if (!targetSelector) {
    const script = document.currentScript as HTMLScriptElement | null;
    const container = document.createElement("div");
    if (script?.parentNode) {
      script.parentNode.insertBefore(container, script.nextSibling);
    } else {
      document.body.appendChild(container);
    }
    return container;
  }
  if (typeof targetSelector === "string") {
    return document.querySelector(targetSelector) ?? document.body;
  }
  return targetSelector;
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
  openInNewTab: boolean
) {
  const a = document.createElement("a");
  a.href = href;
  a.setAttribute("aria-label", label);
  a.style.display = "block";
  a.style.padding = "8px 0";
  a.style.margin = "10px 0";
  a.style.borderRadius = "10px";
  a.style.textDecoration = "none";
  a.style.border = "1px solid transparent";
  a.style.background = "transparent";
  a.style.color = "inherit";
  if (openInNewTab) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  const img = document.createElement("img");
  img.src = resolveBadgeSrc(imageFilename);
  img.alt = label;
  img.style.display = "block";
  img.style.height = "74px";
  img.style.width = "auto";
  a.appendChild(img);
  return a;
}

function renderButtons(
  target: Element,
  opts: Required<
    Pick<
      Options,
      | "heading"
      | "iosLabel"
      | "iosUrl"
      | "androidLabel"
      | "androidUrl"
      | "openInNewTab"
    >
  >
) {
  const container = document.createElement("div");
  container.setAttribute("data-app-redirect-page", "fallback");

  // minimal inline styling so it looks decent anywhere
  container.style.fontFamily =
    "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  container.style.maxWidth = "560px";
  container.style.margin = "24px auto";
  container.style.padding = "16px";
  container.style.border = "1px solid rgba(0,0,0,0.12)";
  container.style.borderRadius = "12px";

  const h = document.createElement("div");
  h.textContent = opts.heading;
  h.style.fontSize = "18px";
  h.style.fontWeight = "650";
  h.style.marginBottom = "12px";

  container.appendChild(h);
  if (opts.iosUrl) {
    container.appendChild(
      createBadgeLink(
        opts.iosUrl,
        opts.iosLabel,
        "Download_on_the_App_Store_Badge.svg",
        opts.openInNewTab
      )
    );
  }
  if (opts.androidUrl) {
    container.appendChild(
      createBadgeLink(
        opts.androidUrl,
        opts.androidLabel,
        "GetItOnGooglePlay_Badge_Web_color_English.svg",
        opts.openInNewTab
      )
    );
  }

  target.innerHTML = "";
  target.appendChild(container);
}

function normalizeOptions(options: Options): NormalizedOptions {
  const opts: Required<Options> = {
    fallback: options.fallback ?? "buttons",
    delayMs: options.delayMs ?? 0,
    redirect: options.redirect ?? true,
    heading: options.heading ?? "Get the app",
    iosLabel: options.iosLabel ?? "Download on the Apple App Store",
    androidLabel: options.androidLabel ?? "Get it on Google Play",
    openInNewTab: options.openInNewTab ?? false,
    androidUrl: options.androidUrl ?? "",
    iosUrl: options.iosUrl ?? "",
    targetSelector: options.targetSelector ?? "",
  };

  return {
    ...opts,
    targetSelector: resolveTargetSelector(opts.targetSelector),
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
    heading: script.dataset.heading,
    iosLabel: script.dataset.iosLabel,
    androidLabel: script.dataset.androidLabel,
    openInNewTab: script.dataset.newtab === "true",
  };

  return options;
}

export function redirectOrRender(options: Options) {
  const opts = normalizeOptions(options);
  const targetEl = opts.targetSelector;

  if (opts.fallback === "buttons") {
    renderButtons(targetEl, {
      heading: opts.heading,
      iosLabel: opts.iosLabel,
      androidLabel: opts.androidLabel,
      iosUrl: opts.iosUrl,
      androidUrl: opts.androidUrl,
      openInNewTab: opts.openInNewTab,
    });
  }
  if (opts.redirect) {
    return detectOsRedirect(opts);
  }
}

function detectOsRedirect(opts: Required<Options>) {
  const os = detectOs();
  if (os === "ios") return doRedirect(opts.iosUrl, opts.delayMs);
  if (os === "android") return doRedirect(opts.androidUrl, opts.delayMs);
}
