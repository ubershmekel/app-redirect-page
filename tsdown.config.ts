import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/app-redirect-page.ts"],
  platform: "browser",
  format: ["iife"],
  outDir: "dist",
  minify: true,
  outputOptions: {
    entryFileNames: "[name].js",
  },
});
