import { redirectOrRender } from "./core";

const script = document.currentScript as HTMLScriptElement | null;
if (!script) {
  // Some async loading scenarios won’t have currentScript; fail silently.
} else {
  const iosUrl = script.dataset.ios;
  const androidUrl = script.dataset.android;

  if (!iosUrl || !androidUrl) {
    console.warn("[app-redirect-page] Missing data-ios or data-android");
  } else {
    const fallback = (script.dataset.fallback as any) || "buttons";
    const target = script.dataset.target || undefined;

    const delayMs = script.dataset.delay ? Number(script.dataset.delay) : 0;
    const redirect = script.dataset.redirect
      ? script.dataset.redirect !== "false"
      : true;

    const heading = script.dataset.heading || "Get the app";
    const iosLabel = script.dataset.iosLabel || "Download on the App Store";
    const androidLabel = script.dataset.androidLabel || "Get it on Google Play";

    const openInNewTab = script.dataset.newtab === "true";

    redirectOrRender({
      iosUrl,
      androidUrl,
      fallback,
      target,
      delayMs,
      redirect,
      heading,
      iosLabel,
      androidLabel,
      openInNewTab,
    });
  }
}
