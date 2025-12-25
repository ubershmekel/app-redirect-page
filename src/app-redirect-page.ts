import { redirectOrRender, parseScriptOptions } from "./core";

const script = document.currentScript as HTMLScriptElement | null;
if (!script) {
  console.warn("[app-redirect-page] No script element found");
} else {
  redirectOrRender(parseScriptOptions(script));
}
