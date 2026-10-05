export type BestSellingCar = {
  rank: number;
  id: string;
  brand: string;
  model: string;
  englishName: string;
  sales: number;
  bodyType: "轿车" | "SUV";
  powertrain: string;
  image: string;
  audio: string;
  sentence: string;
  sentenceAudio: string;
};

const imageRoot = "/pkg-cars/static/best-selling-cars";

export const bestSellingCars: BestSellingCar[] = [
  [1, "01-geely-xingyuan", "吉利银河", "星愿", "Geely Galaxy Xingyuan", 465775, "轿车", "纯电"],
  [2, "02-wuling-hongguang-miniev", "五菱", "宏光 MINIEV", "Wuling Hongguang Mini EV", 435599, "轿车", "纯电"],
  [3, "03-tesla-model-y", "特斯拉", "Model Y", "Tesla Model Y", 425337, "SUV", "纯电"],
  [4, "04-byd-qin-plus", "比亚迪", "秦 PLUS", "BYD Qin Plus", 387315, "轿车", "插混 / 纯电"],
  [5, "05-nissan-sylphy", "日产", "轩逸", "Nissan Sylphy", 320000, "轿车", "燃油"],
  [6, "06-byd-seagull", "比亚迪", "海鸥", "BYD Seagull", 310956, "轿车", "纯电"],
  [7, "07-volkswagen-lavida", "大众", "朗逸", "Volkswagen Lavida", 270477, "轿车", "燃油"],
  [8, "08-byd-qin-l", "比亚迪", "秦 L", "BYD Qin L", 264671, "轿车", "插混"],
  [9, "09-xiaomi-su7", "小米汽车", "SU7", "Xiaomi SU7", 258164, "轿车", "纯电"],
  [10, "10-volkswagen-sagitar", "大众", "速腾", "Volkswagen Sagitar", 255979, "轿车", "燃油"],
  [11, "11-geely-xingyue-l", "吉利", "星越 L", "Geely Xingyue L", 244068, "SUV", "燃油"],
  [12, "12-geely-boyue-l", "吉利", "博越 L", "Geely Boyue L", 232926, "SUV", "燃油"],
  [13, "13-volkswagen-passat", "大众", "帕萨特", "Volkswagen Passat", 227131, "轿车", "燃油"],
  [14, "14-byd-seal-06", "比亚迪", "海豹 06", "BYD Seal 06", 220317, "轿车", "插混"],
  [15, "15-toyota-camry", "丰田", "凯美瑞", "Toyota Camry", 208652, "轿车", "燃油 / 混动"],
  [16, "16-toyota-rav4", "丰田", "RAV4 荣放", "Toyota RAV4", 204125, "SUV", "燃油 / 混动"],
  [17, "17-volkswagen-tiguan-l", "大众", "途观 L", "Volkswagen Tiguan L", 202904, "SUV", "燃油"],
  [18, "18-volkswagen-magotan", "大众", "迈腾", "Volkswagen Magotan", 202293, "轿车", "燃油"],
  [19, "19-tesla-model-3", "特斯拉", "Model 3", "Tesla Model 3", 200361, "轿车", "纯电"],
  [20, "20-byd-song-plus", "比亚迪", "宋 PLUS", "BYD Song Plus", 200276, "SUV", "插混 / 纯电"],
  [21, "21-byd-yuan-up", "比亚迪", "元 UP", "BYD Yuan Up", 189277, "SUV", "纯电"],
  [22, "22-toyota-frontlander", "丰田", "锋兰达", "Toyota Frontlander", 186575, "SUV", "燃油 / 混动"],
  [23, "23-byd-song-pro", "比亚迪", "宋 Pro", "BYD Song Pro", 180661, "SUV", "插混"],
  [24, "24-chery-tiggo-8", "奇瑞", "瑞虎 8", "Chery Tiggo 8", 179465, "SUV", "燃油"],
  [25, "25-changan-cs75-plus", "长安", "CS75 PLUS", "Changan CS75 Plus", 175597, "SUV", "燃油"],
  [26, "26-xpeng-mona-m03", "小鹏", "MONA M03", "XPeng Mona M03", 175345, "轿车", "纯电"],
  [27, "27-toyota-corolla-cross", "丰田", "卡罗拉锐放", "Toyota Corolla Cross", 174434, "SUV", "燃油 / 混动"],
  [28, "28-volkswagen-tayron", "大众", "探岳", "Volkswagen Tayron", 173329, "SUV", "燃油"],
  [29, "29-honda-cr-v", "本田", "CR-V", "Honda CR-V", 171207, "SUV", "燃油 / 混动"],
  [30, "30-audi-a6l", "奥迪", "A6L", "Audi A6L", 170821, "轿车", "燃油"],
  [31, "31-changan-eado", "长安", "逸动", "Changan Eado", 168949, "轿车", "燃油"],
  [32, "32-li-auto-l6", "理想", "L6", "Li Auto L6", 166516, "SUV", "增程"],
  [33, "33-hongqi-h5", "红旗", "H5", "Hongqi H5", 163575, "轿车", "燃油"],
  [34, "34-changan-lumin", "长安", "Lumin", "Changan Lumin", 162362, "轿车", "纯电"],
  [35, "35-geely-panda-mini", "吉利", "熊猫 Mini", "Geely Panda Mini", 162098, "轿车", "纯电"],
  [36, "36-byd-dolphin", "比亚迪", "海豚", "BYD Dolphin", 160745, "轿车", "纯电"],
  [37, "37-bmw-3-series", "宝马", "3 系", "BMW 3 Series", 156215, "轿车", "燃油"],
  [38, "38-xiaomi-yu7", "小米汽车", "YU7", "Xiaomi YU7", 153673, "SUV", "纯电"],
  [39, "39-honda-accord", "本田", "雅阁", "Honda Accord", 152115, "轿车", "燃油 / 混动"],
  [40, "40-aito-m8", "问界", "M8", "AITO M8", 150420, "SUV", "增程 / 纯电"],
  [41, "41-haval-big-dog", "哈弗", "大狗", "Haval Big Dog", 149708, "SUV", "燃油"],
  [42, "42-volkswagen-tharu", "大众", "途岳", "Volkswagen Tharu", 148416, "SUV", "燃油"],
  [43, "43-geely-xingrui", "吉利", "星瑞", "Geely Xingrui", 147560, "轿车", "燃油"],
  [44, "44-chery-arrizo-8", "奇瑞", "艾瑞泽 8", "Chery Arrizo 8", 147212, "轿车", "燃油"],
  [45, "45-byd-song-l-dmi", "比亚迪", "宋 L DM-i", "BYD Song L DM-i", 137120, "SUV", "插混"],
  [46, "46-wuling-bingo", "五菱", "缤果", "Wuling Bingo", 136213, "轿车", "纯电"],
  [47, "47-byd-sealion-06", "比亚迪", "海狮 06", "BYD Sealion 06", 136166, "SUV", "插混 / 纯电"],
  [48, "48-byd-yuan-plus", "比亚迪", "元 PLUS", "BYD Yuan Plus", 135446, "SUV", "纯电"],
  [49, "49-leapmotor-c10", "零跑", "C10", "Leapmotor C10", 135043, "SUV", "增程 / 纯电"],
  [50, "50-geely-binyue", "吉利", "缤越", "Geely Binyue", 133888, "SUV", "燃油"]
].map(([rank, id, brand, model, englishName, sales, bodyType, powertrain]) => ({
  rank: rank as number,
  id: id as string,
  brand: brand as string,
  model: model as string,
  englishName: englishName as string,
  sales: sales as number,
  bodyType: bodyType as BestSellingCar["bodyType"],
  powertrain: powertrain as string,
  image: `${imageRoot}/${id}.jpg`,
  audio: `/static/audio/car-models/${id}.mp3`,
  sentenceAudio: `/pkg-speaking/static/audio/car-sentences/${id}.mp3`,
  sentence: `This is the ${englishName}.`
}));
