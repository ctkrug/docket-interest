import { defineConfig } from "vite";

// Relative base so the built app works when served from a subpath
// (e.g. apps.charliekrug.com/docket-interest/) as well as from the root.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
});
