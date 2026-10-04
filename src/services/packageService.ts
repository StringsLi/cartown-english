declare const wx: {
  loadSubpackage?: (options: { name: string; success(): void; fail(error: unknown): void }) => unknown;
};
const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

/** Local media may belong to a package other than the currently visible page. */
export async function ensureMediaPackage(source: string): Promise<void> {
  // #ifdef MP-WEIXIN
  const name = /^\/(pkg-[a-z]+)\/static\//.exec(source)?.[1];
  if (!name || typeof wx === "undefined") return;
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
      if (!wx.loadSubpackage) throw new Error("Media package loading is unavailable");
      wx.loadSubpackage({ name, success: () => finish(), fail: error => finish(error || new Error("Media package loading failed")) });
    } catch (error) { finish(error); }
  });
  pending.set(name, request);
  try { await request; } finally { if (pending.get(name) === request) pending.delete(name); }
  // #endif
}
