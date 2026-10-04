export interface SpaceBody { id: string; name: string; nameCn: string; kind: "star" | "planet" | "moon"; color: string; image: string; audio: string; sentence: string; sentenceCn: string; sentenceAudio: string; promptAudio: string; fact: string; parentTask: string }
export interface SpaceSeries { id: string; title: string; english: string; note: string; bodyIds: string[]; color: string }
export const spaceBodies: SpaceBody[] = [
  {
    "id": "sun",
    "name": "Sun",
    "nameCn": "太阳",
    "kind": "star",
    "color": "#ffb84e",
    "image": "/pkg-space/static/textures/sun.jpg",
    "audio": "/pkg-space/static/audio/sun.mp3",
    "sentence": "The Sun is a star.",
    "sentenceCn": "太阳是一颗恒星。",
    "sentenceAudio": "/pkg-space/static/audio/sun-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/sun-find.mp3",
    "fact": "太阳的光和热，让地球充满生机。",
    "parentTask": "一起张开手臂，像太阳一样发光。"
  },
  {
    "id": "mercury",
    "name": "Mercury",
    "nameCn": "水星",
    "kind": "planet",
    "color": "#b9aaa0",
    "image": "/pkg-space/static/textures/mercury.jpg",
    "audio": "/pkg-space/static/audio/mercury.mp3",
    "sentence": "Mercury is near the Sun.",
    "sentenceCn": "水星离太阳很近。",
    "sentenceAudio": "/pkg-space/static/audio/mercury-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/mercury-find.mp3",
    "fact": "水星是离太阳最近的行星，也是八大行星中最小的一颗。",
    "parentTask": "用一个小圆点表示水星，把它放在太阳旁边。"
  },
  {
    "id": "venus",
    "name": "Venus",
    "nameCn": "金星",
    "kind": "planet",
    "color": "#e7bc78",
    "image": "/pkg-space/static/textures/venus.jpg",
    "audio": "/pkg-space/static/audio/venus.mp3",
    "sentence": "Venus is very hot.",
    "sentenceCn": "金星非常热。",
    "sentenceAudio": "/pkg-space/static/audio/venus-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/venus-find.mp3",
    "fact": "厚厚的大气让金星成为太阳系里最热的行星。",
    "parentTask": "摸摸自己的手心，和家长说一声 hot。"
  },
  {
    "id": "earth",
    "name": "Earth",
    "nameCn": "地球",
    "kind": "planet",
    "color": "#65b7cc",
    "image": "/pkg-space/static/textures/earth.jpg",
    "audio": "/pkg-space/static/audio/earth.mp3",
    "sentence": "Earth is our home.",
    "sentenceCn": "地球是我们的家。",
    "sentenceAudio": "/pkg-space/static/audio/earth-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/earth-find.mp3",
    "fact": "蓝色的海洋和陆地，组成我们生活的地球。",
    "parentTask": "找一个蓝色物品，想想地球上的大海。"
  },
  {
    "id": "moon",
    "name": "Moon",
    "nameCn": "月球",
    "kind": "moon",
    "color": "#b5bbc4",
    "image": "/pkg-space/static/textures/moon.jpg",
    "audio": "/pkg-space/static/audio/moon.mp3",
    "sentence": "The Moon goes around Earth.",
    "sentenceCn": "月球绕着地球转。",
    "sentenceAudio": "/pkg-space/static/audio/moon-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/moon-find.mp3",
    "fact": "月球是地球的天然卫星，不属于八大行星。",
    "parentTask": "家长当“地球”，孩子慢慢绕一圈，当“月球”。"
  },
  {
    "id": "mars",
    "name": "Mars",
    "nameCn": "火星",
    "kind": "planet",
    "color": "#d97958",
    "image": "/pkg-space/static/textures/mars.jpg",
    "audio": "/pkg-space/static/audio/mars.mp3",
    "sentence": "Mars is the red planet.",
    "sentenceCn": "火星是红色的行星。",
    "sentenceAudio": "/pkg-space/static/audio/mars-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/mars-find.mp3",
    "fact": "火星表面的铁矿物生锈，让它看起来红红的。",
    "parentTask": "找一个红色物品，和家长一起说 Mars。"
  },
  {
    "id": "jupiter",
    "name": "Jupiter",
    "nameCn": "木星",
    "kind": "planet",
    "color": "#d8b18d",
    "image": "/pkg-space/static/textures/jupiter.jpg",
    "audio": "/pkg-space/static/audio/jupiter.mp3",
    "sentence": "Jupiter is the biggest planet.",
    "sentenceCn": "木星是最大的行星。",
    "sentenceAudio": "/pkg-space/static/audio/jupiter-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/jupiter-find.mp3",
    "fact": "木星是八大行星中最大的一颗，表面能看到条纹。",
    "parentTask": "用双手画一个大圆，说 big, big Jupiter。"
  },
  {
    "id": "saturn",
    "name": "Saturn",
    "nameCn": "土星",
    "kind": "planet",
    "color": "#d9bf85",
    "image": "/pkg-space/static/textures/saturn.jpg",
    "audio": "/pkg-space/static/audio/saturn.mp3",
    "sentence": "Saturn has beautiful rings.",
    "sentenceCn": "土星有美丽的环。",
    "sentenceAudio": "/pkg-space/static/audio/saturn-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/saturn-find.mp3",
    "fact": "土星的环主要由冰和岩石碎片组成。",
    "parentTask": "画一个圆，再在它外面画一道土星环。"
  },
  {
    "id": "uranus",
    "name": "Uranus",
    "nameCn": "天王星",
    "kind": "planet",
    "color": "#a5d4d4",
    "image": "/pkg-space/static/textures/uranus.jpg",
    "audio": "/pkg-space/static/audio/uranus.mp3",
    "sentence": "Uranus rolls on its side.",
    "sentenceCn": "天王星侧着身子转。",
    "sentenceAudio": "/pkg-space/static/audio/uranus-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/uranus-find.mp3",
    "fact": "天王星的自转轴倾斜很大，像侧着身子转动。",
    "parentTask": "把小球侧着滚一滚，观察它怎么转。"
  },
  {
    "id": "neptune",
    "name": "Neptune",
    "nameCn": "海王星",
    "kind": "planet",
    "color": "#497bbb",
    "image": "/pkg-space/static/textures/neptune.jpg",
    "audio": "/pkg-space/static/audio/neptune.mp3",
    "sentence": "Neptune is far from the Sun.",
    "sentenceCn": "海王星离太阳很远。",
    "sentenceAudio": "/pkg-space/static/audio/neptune-sentence.mp3",
    "promptAudio": "/pkg-space/static/audio/neptune-find.mp3",
    "fact": "海王星是八大行星中离太阳最远的一颗。",
    "parentTask": "伸出手指，指向远处，一起说 far。"
  }
];
export const spaceSeries: SpaceSeries[] = [
  {
    "id": "home",
    "title": "我们的太空邻居",
    "english": "Our Space Neighbors",
    "note": "从太阳、地球和月球出发。",
    "bodyIds": [
      "sun",
      "earth",
      "moon"
    ],
    "color": "#a9cfce"
  },
  {
    "id": "rocky",
    "title": "四颗岩石行星",
    "english": "The Rocky Planets",
    "note": "一路认识水星、金星、地球和火星。",
    "bodyIds": [
      "mercury",
      "venus",
      "earth",
      "mars"
    ],
    "color": "#e6b494"
  },
  {
    "id": "giants",
    "title": "远方的大行星",
    "english": "The Giant Planets",
    "note": "寻找木星、土星、天王星和海王星。",
    "bodyIds": [
      "jupiter",
      "saturn",
      "uranus",
      "neptune"
    ],
    "color": "#b6b5e8"
  }
];
export const planets = spaceBodies.filter(body => body.kind === "planet");
export function getSpaceBody(id: string) { return spaceBodies.find(body => body.id === id); }
export function getSpaceSeries(id: string) { return spaceSeries.find(series => series.id === id) || spaceSeries[0]; }
export function seriesBodies(id: string) { return getSpaceSeries(id).bodyIds.map(bodyId => getSpaceBody(bodyId)!); }
