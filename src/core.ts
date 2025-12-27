export type FallbackMode = "buttons" | "none";

export type Options = {
  iosUrl?: string;
  androidUrl?: string;

  // behavior
  fallback?: FallbackMode; // default "buttons"
  targetSelector?: string | Element; // default document.body
  delayMs?: number; // time until redirect occurs in ms, default 0
  redirect?: boolean; // default true; if false, always render buttons

  // copy / UI
  heading?: string; // default "Get the app"
  iosLabel?: string; // default "Download on the App Store"
  androidLabel?: string; // default "Get it on Google Play"
  openInNewTab?: boolean; // default false
};

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
  if (!targetSelector) return document.body;
  if (typeof targetSelector === "string")
    return document.querySelector(targetSelector) ?? document.body;
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

export function parseScriptOptions(script: HTMLScriptElement): Options {
  const iosUrl = script.dataset.ios;
  const androidUrl = script.dataset.android;
  const fallback = (script.dataset.fallback as any) || "buttons";
  const targetSelector = script.dataset.targetSelector || undefined;
  const delayMs = script.dataset.delayms ? Number(script.dataset.delayms) : 0;
  const redirect = script.dataset.redirect
    ? script.dataset.redirect !== "false"
    : true;

  const heading = script.dataset.heading || "Get the app";
  const iosLabel = script.dataset.iosLabel || "Download on the App Store";
  const androidLabel = script.dataset.androidLabel || "Get it on Google Play";

  const openInNewTab = script.dataset.newtab === "true";

  const opts: Options = {
    iosUrl,
    androidUrl,
    fallback,
    targetSelector,
    delayMs,
    redirect,
    heading,
    iosLabel,
    androidLabel,
    openInNewTab,
  };

  return opts;
}

export function redirectOrRender(options: Options) {
  // override defaults
  const opts: Required<Options> = {
    fallback: "buttons",
    targetSelector: document.body,
    delayMs: 0,
    redirect: true,
    heading: "Get the app",
    iosLabel: "Download on the Apple App Store",
    androidLabel: "Get it on Google Play",
    openInNewTab: false,
    androidUrl: "",
    iosUrl: "",
    ...options,
  };

  const targetEl = resolveTargetSelector(opts.targetSelector);

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
