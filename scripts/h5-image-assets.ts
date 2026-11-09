import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

const imageGroups = ["books", "topic-icons", "cartown-logos", "audio"] as const;

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
          else if ((group === "audio" ? /\.(mp3|wav)$/i : /\.(png|jpe?g)$/i).test(entry.name)) {
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
      // uni-app copies subpackage static files for production but its H5 dev
      // middleware only serves the main static directory. Serve the same URLs.
      const sourceRoot = path.join(projectRoot, "src");
      async function addPackagedMedia(directory: string): Promise<void> {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
          const file = path.join(directory, entry.name);
          if (entry.isDirectory()) await addPackagedMedia(file);
          else if (/\.(mp3|wav|png|jpe?g|webp)$/i.test(entry.name)) files.set(path.relative(sourceRoot, file).split(path.sep).join("/"), file);
        }
      }
      for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name.startsWith("pkg-")) {
          const children = await readdir(path.join(sourceRoot, entry.name));
          if (children.includes("static")) await addPackagedMedia(path.join(sourceRoot, entry.name, "static"));
        }
      }
      server.middlewares.use(async (request, response, next) => {
        let url: string;
        try { url = decodeURIComponent((request.url || "").split("?")[0]).replace(/^\//, ""); }
        catch { next(); return; }
        const file = files.get(url);
        if (!file) { next(); return; }
        try {
          response.setHeader("Content-Type", file.endsWith(".mp3") ? "audio/mpeg" : file.endsWith(".wav") ? "audio/wav" : file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg");
          const bytes = await readFile(file);
          response.setHeader("Accept-Ranges", "bytes");
          // Safari needs byte ranges for seeking and reliable resumed audio.
          const range = request.headers.range;
          if (range) {
            const match = /^bytes=(\d*)-(\d*)$/.exec(range);
            const suffix = match && !match[1] && match[2] ? Number(match[2]) : 0;
            const start = suffix ? Math.max(0, bytes.length - suffix) : Number(match?.[1] || 0);
            const end = suffix ? bytes.length - 1 : Math.min(Number(match?.[2] || bytes.length - 1), bytes.length - 1);
            if (!match || (!match[1] && !suffix) || start >= bytes.length || start > end) {
              response.statusCode = 416; response.setHeader("Content-Range", `bytes */${bytes.length}`); response.end(); return;
            }
            response.statusCode = 206;
            response.setHeader("Content-Range", `bytes ${start}-${end}/${bytes.length}`);
            response.setHeader("Content-Length", end - start + 1);
            response.end(request.method === "HEAD" ? undefined : bytes.subarray(start, end + 1));
          } else {
            response.setHeader("Content-Length", bytes.length);
            response.end(request.method === "HEAD" ? undefined : bytes);
          }
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
