export const homeWorlds = [
  { id: "learn", title: "点图听英语", english: "Listen & play", note: "8 个主题小世界", kind: "learn", url: "/pkg-learning/playground/index" },
  { id: "book", title: "车车绘本", english: "Story time", note: "翻一页，听一个故事", kind: "book", url: "/pages/books/index" },
  { id: "world", title: "世界地图", english: "Hello, world!", note: "国旗、地图和英语名字", kind: "world", url: "/pkg-world/world/index" },
  { id: "logo", title: "车标发现", english: "Find a badge", note: "50 个车标，听听找找", kind: "logo", url: "/pkg-cars/car-logos/index" },
  { id: "town", title: "车车小故事", english: "Little driver", note: "送货，和家长一起演", kind: "town", url: "/pkg-adventure/index/index" },
  { id: "space", title: "太阳系旅行", english: "Space explorer", note: "太阳、行星和月球", kind: "space", url: "/pkg-space/index/index" }
] as const;

export const homePractices = [
  { id: "cars", title: "认识真车", note: "听名字，看照片", icon: "CAR", url: "/pages/vehicles/index" },
  { id: "colors", title: "颜色汽车", note: "听颜色，找汽车", icon: "●", url: "/pkg-cars/car-colors/index" },
  { id: "count", title: "数字数车", note: "点一点，数一数", icon: "123", url: "/pkg-cars/car-count/index" },
  { id: "traffic", title: "红绿灯动作", note: "停一停，动一动", icon: "GO", url: "/pkg-cars/car-traffic/index" }
] as const;
