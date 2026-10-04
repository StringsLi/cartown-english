import { onLoad } from "@dcloudio/uni-app";
import { navigate } from "@/services/navigationService";

/** Keep previously shared links usable after relocating pages. */
export function useLegacyRoute(target: string) {
  let query = "";
  const open = () => navigate({ url: target + query }, "redirectTo");
  onLoad(options => {
    const pairs = Object.entries(options || {})
      .filter(([key, value]) => !key.startsWith("__") && typeof value === "string")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`);
    query = pairs.length ? `?${pairs.join("&")}` : "";
    open();
  });
  return { open, goHome: () => navigate({ url: "/pages/index/index" }, "reLaunch") };
}
