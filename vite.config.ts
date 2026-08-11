import path from "node:path";
import { readFile } from "node:fs/promises";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

function packageStaticPlugin() {
  const sourceRoot = path.resolve(__dirname, "src");
  const contentTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav"
  };

  return {
    name: "cartown-package-static",
    apply: "serve" as const,
    configureServer(server: { middlewares: { use(handler: (request: { url?: string }, response: { statusCode: number; setHeader(name: string, value: string): void; end(body?: Uint8Array): void }, next: () => void): void): void } }) {
      server.middlewares.use((request, response, next) => {
        const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
        const match = pathname.match(/^\/(pkg-[^/]+)\/static\/(.+)$/);
        if (!match) {
          next();
          return;
        }

        const packageRoot = path.resolve(sourceRoot, match[1], "static");
        const filePath = path.resolve(packageRoot, match[2]);
        if (!filePath.startsWith(packageRoot + path.sep)) {
          response.statusCode = 403;
          response.end();
          return;
        }

        void readFile(filePath)
          .then((content) => {
            response.setHeader("Content-Type", contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream");
            response.end(content);
          })
          .catch(() => next());
      });
    }
  };
}

export default defineConfig({
  plugins: [packageStaticPlugin(), uni()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
