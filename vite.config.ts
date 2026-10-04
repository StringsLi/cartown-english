import path from "node:path";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { h5ImageAssets } from "./scripts/h5-image-assets";

export default defineConfig({
  plugins: [uni(), ...(process.env.UNI_PLATFORM === "h5" ? [h5ImageAssets(__dirname)] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
