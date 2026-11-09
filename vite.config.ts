import path from "node:path";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { h5ImageAssets } from "./scripts/h5-image-assets";

export default defineConfig({
  plugins: [uni(), ...(process.env.UNI_PLATFORM === "h5" ? [h5ImageAssets(__dirname)] : []), {
    name: "cartown-package-boundaries",
    enforce: "post",
    outputOptions(options) {
      if (process.env.UNI_PLATFORM !== "mp-weixin" || typeof options.manualChunks !== "function") return;
      const manualChunks = options.manualChunks;
      // Keep page-shared state and date helpers in a single main-package
      // chunk, rather than absorbing them into whichever page imports first.
      options.manualChunks = undefined;
      options.codeSplitting = { groups: [
        { name: "services/recordService", test: /[\\/]src[\\/](?:services[\\/](?:recordService|progressService|audioService)|utils[\\/](?:date|storage))\.ts$/, priority: 100 },
        { name: (id, context) => manualChunks(id, { getModuleInfo: context.getModuleInfo }) }
      ] };
      return options;
    }
  }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
