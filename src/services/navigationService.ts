import { stopAudio } from "@/services/audioService";

type NavigationMode = "navigateTo" | "redirectTo" | "reLaunch";
const HOME = "/pages/index/index";
let navigating = false;
let transition = 0;
let releaseTimer: ReturnType<typeof setTimeout> | undefined;

/** One transition at a time, including failures and full native page stacks. */
export function navigate(options: { url: string }, mode: NavigationMode = "navigateTo"): void {
  if (navigating) return;
  const current = getCurrentPages().slice(-1)[0];
  if (mode === "reLaunch" && `/${current?.route}` === options.url) return;
  stopAudio();
  const token = ++transition;
  navigating = true;
  const release = () => {
    if (token !== transition) return;
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(() => { navigating = false; }, 350);
  };
  // Ensure an interrupted platform callback never leaves navigation locked.
  releaseTimer = setTimeout(() => { navigating = false; }, 3000);
  const request = {
    url: options.url,
    success: release,
    fail(error: { errMsg?: string }) {
      if (token !== transition) return;
      if (mode === "navigateTo" && /limit|stack|层级/i.test(error.errMsg || "")) {
        uni.redirectTo({ url: options.url, success: release, fail: fail });
      } else fail();
    }
  };
  if (mode === "reLaunch") uni.reLaunch(request);
  else if (mode === "redirectTo") uni.redirectTo(request);
  else uni.navigateTo(request);
  function fail() {
    if (token !== transition) return;
    release();
    uni.showToast({ title: "页面没能打开，请再试一次", icon: "none" });
  }
}

export function backTo(fallback = HOME): void {
  if (navigating) return;
  if (getCurrentPages().length <= 1) { navigate({ url: fallback }, "reLaunch"); return; }
  stopAudio();
  const token = ++transition;
  navigating = true;
  releaseTimer = setTimeout(() => { navigating = false; }, 3000);
  uni.navigateBack({
    delta: 1,
    success() { if (token !== transition) return; clearTimeout(releaseTimer); releaseTimer = setTimeout(() => { navigating = false; }, 350); },
    fail() { if (token !== transition) return; clearTimeout(releaseTimer); navigating = false; navigate({ url: fallback }, "reLaunch"); }
  });
}
