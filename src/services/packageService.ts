declare const require: { async(path: string): Promise<unknown> };
const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

/** Page navigation loads its own package. Only cross-package media needs an async require. */
export async function ensureMediaPackage(source: string): Promise<void> {
  // #ifdef MP-WEIXIN
  const name = /^\/(pkg-[a-z]+)\/static\//.exec(source)?.[1];
  if (!name || typeof getCurrentPages !== "function") return;
  const current = getCurrentPages().slice(-1)[0]?.route || "";
  if (current.startsWith(name + "/")) { loaded.add(name); return; }
  if (loaded.has(name)) return;
  const existing = pending.get(name);
  if (existing) return existing;
  const request = new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else { loaded.add(name); resolve(); }
    };
    const timer = setTimeout(() => finish(new Error("Media package load timed out")), 15000);
    try {
      // Native require.async loads the package; static markers are copied verbatim.
      let load: Promise<unknown>;
      if (name === "pkg-cars") load = require.async("../pkg-cars/static/media-ready.js");
      else if (name === "pkg-music") load = require.async("../pkg-music/static/media-ready.js");
      else if (name === "pkg-reading") load = require.async("../pkg-reading/static/media-ready.js");
      else if (name === "pkg-learning") load = require.async("../pkg-learning/static/media-ready.js");
      else if (name === "pkg-space") load = require.async("../pkg-space/static/media-ready.js");
      else if (name === "pkg-adventure") load = require.async("../pkg-adventure/static/media-ready.js");
      else if (name === "pkg-speaking") load = require.async("../pkg-speaking/static/media-ready.js");
      else throw new Error("Open this world before using its media");
      void load.then(() => finish(), error => finish(error || new Error("Media package loading failed")));
    } catch (error) { finish(error); }
  });
  pending.set(name, request);
  try { await request; } finally { if (pending.get(name) === request) pending.delete(name); }
  // #endif
}
