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
  [HOME_ROUTE]: "车车英语乐园，开启今天的亲子探索",
  "pages/books/index": "精选趣味绘本，陪孩子边听边探索",
  "pages/vehicles/index": "一起认识有趣的交通工具",
  "pkg-cars/car-learn/index": "听一听，认识生活中的车辆",
  "pkg-learning/car-logos/index": "挑战认识 50 个常见汽车品牌",
  "pkg-learning/car-colors/index": "听颜色，找到正确的小汽车",
  "pkg-learning/car-count/index": "数一数，看看有几辆小汽车",
  "pkg-learning/car-traffic/index": "红灯停绿灯行，一起认识交通规则",
  "pkg-learning/car-stories/index": "有趣的小汽车故事等你来听",
  "pkg-learning/car-garage/index": "来看看我的小汽车收藏",
  "pkg-learning/playground/index": "四个英语主题，和孩子听一听、找一找",
  "pkg-learning/playground-game/index": "一起玩小小英语主题游戏",
  "pkg-world/world/index": "跟着车车一起探索世界",
  "pkg-reading/book-detail/index": "亲子绘本时间，一起听故事",
  "pkg-reading/reader/index": "这本绘本真有趣，一起听一听",
  "pkg-reading/point-read/index": "点一点图片，发现更多英语声音",
  "pkg-reading/repeat/index": "跟我读一句，一起练习自然表达",
  "pkg-reading/game/index": "来玩一个轻松的英语小游戏",
  "pkg-user/parent/index": "车车英语乐园，记录孩子的每次进步",
  "pkg-user/profile/index": "车车英语乐园，陪孩子快乐探索"
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
