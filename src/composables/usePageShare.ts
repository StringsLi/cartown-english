import { onShareAppMessage, onShareTimeline, onShow } from "@dcloudio/uni-app";

type ShareQueryValue = string | number | boolean | null | undefined;

interface RuntimePage {
  route?: string;
  options?: Record<string, ShareQueryValue>;
}

interface PageShareOptions {
  title?: string | (() => string);
}

const HOME_ROUTE = "pages/index/index";

const pageShareTitles: Record<string, string> = {
  [HOME_ROUTE]: "车车探索小助手，开启今天的汽车探索",
  "pages/books/index": "精选趣味绘本，陪孩子边听边探索",
  "pages/vehicles/index": "一起认识有趣的交通工具",
  "pages/car-learn/index": "听一听，认识生活中的车辆",
  "pages/car-logos/index": "挑战认识 50 个常见汽车品牌",
  "pages/car-colors/index": "听颜色，找到正确的小汽车",
  "pages/car-count/index": "数一数，看看有几辆小汽车",
  "pages/car-traffic/index": "红灯停绿灯行，一起认识交通规则",
  "pages/car-stories/index": "有趣的小汽车故事等你来听",
  "pages/car-garage/index": "来看看我的小汽车收藏",
  "pages/world/index": "跟着车车一起探索世界",
  "pages/book-detail/index": "亲子绘本时间，一起听故事",
  "pages/reader/index": "这本绘本真有趣，一起听一听",
  "pages/point-read/index": "点一点图片，发现更多英语声音",
  "pages/repeat/index": "跟我读一句，一起练习自然表达",
  "pages/game/index": "来玩一个轻松的英语小游戏",
  "pages/parent/index": "车车探索小助手，记录孩子的每次进步",
  "pages/profile/index": "车车探索小助手，陪孩子快乐探索"
};

function getCurrentPage(): RuntimePage {
  const pages = getCurrentPages() as unknown as RuntimePage[];
  return pages[pages.length - 1] ?? {};
}

function buildQuery(options: RuntimePage["options"] = {}): string {
  return Object.entries(options)
    .filter(([key, value]) => !key.startsWith("__") && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
}

function resolveTitle(options: PageShareOptions): string {
  if (typeof options.title === "function") {
    return options.title();
  }

  if (options.title) {
    return options.title;
  }

  const page = getCurrentPage();
  return pageShareTitles[page.route ?? HOME_ROUTE] ?? pageShareTitles[HOME_ROUTE];
}

export function usePageShare(options: PageShareOptions = {}) {
  onShow(() => {
    // #ifdef MP-WEIXIN
    uni.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    });
    // #endif
  });

  onShareAppMessage(() => {
    const page = getCurrentPage();
    const route = page.route ?? HOME_ROUTE;
    const query = buildQuery(page.options);

    return {
      title: resolveTitle(options),
      path: `/${route}${query ? `?${query}` : ""}`
    };
  });

  onShareTimeline(() => {
    const page = getCurrentPage();

    return {
      title: resolveTitle(options),
      query: buildQuery(page.options)
    };
  });
}
