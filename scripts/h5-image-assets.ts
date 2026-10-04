import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

const imageGroups = ["books", "topic-icons", "cartown-logos"] as const;

/** Web-only originals: emit them for production and serve the same URLs in dev. */
export function h5ImageAssets(projectRoot: string): Plugin {
  async function imageFiles(): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    for (const group of imageGroups) {
      const directory = path.join(projectRoot, "docs/source-assets", `${group}-original`);
      async function walk(current: string): Promise<void> {
        for (const entry of await readdir(current, { withFileTypes: true })) {
          const file = path.join(current, entry.name);
          if (entry.isDirectory()) await walk(file);
          else if (/\.(png|jpe?g)$/i.test(entry.name)) {
            const relative = path.relative(directory, file).split(path.sep).join("/");
            files.set(`static/${group}/${relative}`, file);
          }
        }
      }
      await walk(directory);
    }
    return files;
  }

  return {
    name: "cartown-h5-image-assets",
    async configureServer(server) {
      const files = await imageFiles();
      server.middlewares.use(async (request, response, next) => {
        let url: string;
        try { url = decodeURIComponent((request.url || "").split("?")[0]).replace(/^\//, ""); }
        catch { next(); return; }
        const file = files.get(url);
        if (!file) { next(); return; }
        try {
          response.setHeader("Content-Type", file.endsWith(".png") ? "image/png" : "image/jpeg");
          response.end(await readFile(file));
        } catch (error) { next(error as Error); }
      });
    },
    async generateBundle() {
      for (const [fileName, file] of await imageFiles()) {
        this.emitFile({ type: "asset", fileName, source: await readFile(file) });
      }
    }
  };
}
