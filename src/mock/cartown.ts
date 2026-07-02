export type Vehicle = {
  id: string;
  word: string;
  zh: string;
  sentence: string;
  color: string;
  accent: string;
  kind:
    | 'car'
    | 'bus'
    | 'truck'
    | 'taxi'
    | 'fire-truck'
    | 'police-car'
    | 'ambulance'
    | 'van'
    | 'train'
    | 'race-car'
    | 'scooter'
    | 'school-bus';
};

export type ColorCar = {
  id: string;
  label: string;
  zh: string;
  hex: string;
  task: string;
};

export type StoryPage = {
  id: number;
  sentence: string;
  zh: string;
  scene: 'intro' | 'fast' | 'dog' | 'stop' | 'cheer' | 'rain' | 'bridge' | 'wash' | 'sleep';
};

export type StoryBook = {
  id: string;
  title: string;
  zh: string;
  pages: StoryPage[];
};

export type CountingChallenge = {
  id: string;
  count: number;
  vehicleWord: string;
  vehicleZh: string;
  task: string;
  color: string;
  accent: string;
  kind: Vehicle['kind'];
};

export type TrafficPrompt = {
  id: string;
  light: 'red' | 'yellow' | 'green';
  task: string;
  action: string;
  zh: string;
};

export const vehicles: Vehicle[] = [
  {
    id: 'car',
    word: 'Car',
    zh: '小汽车',
    sentence: 'This is a car.',
    color: '#f95757',
    accent: '#ffd166',
    kind: 'car',
  },
  {
    id: 'bus',
    word: 'Bus',
    zh: '公共汽车',
    sentence: 'This is a bus.',
    color: '#ffd447',
    accent: '#48cae4',
    kind: 'bus',
  },
  {
    id: 'truck',
    word: 'Truck',
    zh: '卡车',
    sentence: 'This is a truck.',
    color: '#49a6ff',
    accent: '#ffe66d',
    kind: 'truck',
  },
  {
    id: 'taxi',
    word: 'Taxi',
    zh: '出租车',
    sentence: 'This is a taxi.',
    color: '#ffcf33',
    accent: '#1f2937',
    kind: 'taxi',
  },
  {
    id: 'fire-truck',
    word: 'Fire truck',
    zh: '消防车',
    sentence: 'This is a fire truck.',
    color: '#ef233c',
    accent: '#f7fff7',
    kind: 'fire-truck',
  },
  {
    id: 'police-car',
    word: 'Police car',
    zh: '警车',
    sentence: 'This is a police car.',
    color: '#ffffff',
    accent: '#2563eb',
    kind: 'police-car',
  },
  {
    id: 'ambulance',
    word: 'Ambulance',
    zh: '救护车',
    sentence: 'This is an ambulance.',
    color: '#f8fafc',
    accent: '#ef4444',
    kind: 'ambulance',
  },
  {
    id: 'van',
    word: 'Van',
    zh: '面包车',
    sentence: 'This is a van.',
    color: '#8bdeff',
    accent: '#fff7bd',
    kind: 'van',
  },
  {
    id: 'school-bus',
    word: 'School bus',
    zh: '校车',
    sentence: 'This is a school bus.',
    color: '#ffc83d',
    accent: '#17324d',
    kind: 'school-bus',
  },
  {
    id: 'train',
    word: 'Train',
    zh: '火车',
    sentence: 'This is a train.',
    color: '#7c5cff',
    accent: '#ffcf33',
    kind: 'train',
  },
  {
    id: 'race-car',
    word: 'Race car',
    zh: '赛车',
    sentence: 'This is a race car.',
    color: '#ff7a1a',
    accent: '#ffffff',
    kind: 'race-car',
  },
  {
    id: 'scooter',
    word: 'Scooter',
    zh: '滑板车',
    sentence: 'This is a scooter.',
    color: '#43c66b',
    accent: '#bdf3ff',
    kind: 'scooter',
  },
];

export const colorCars: ColorCar[] = [
  {
    id: 'red',
    label: 'red',
    zh: '红色',
    hex: '#f95757',
    task: 'Tap the red car.',
  },
  {
    id: 'blue',
    label: 'blue',
    zh: '蓝色',
    hex: '#3aa6ff',
    task: 'Tap the blue car.',
  },
  {
    id: 'yellow',
    label: 'yellow',
    zh: '黄色',
    hex: '#ffd447',
    task: 'Tap the yellow car.',
  },
  {
    id: 'green',
    label: 'green',
    zh: '绿色',
    hex: '#43c66b',
    task: 'Tap the green car.',
  },
  {
    id: 'orange',
    label: 'orange',
    zh: '橙色',
    hex: '#ff9f1c',
    task: 'Tap the orange car.',
  },
  {
    id: 'purple',
    label: 'purple',
    zh: '紫色',
    hex: '#8b5cf6',
    task: 'Tap the purple car.',
  },
];

export const storyBooks: StoryBook[] = [
  {
    id: 'little-red-car',
    title: 'Little Red Car',
    zh: '红色小汽车',
    pages: [
      { id: 1, sentence: 'This is a little red car.', zh: '这是一辆红色小汽车。', scene: 'intro' },
      { id: 2, sentence: 'The little car goes fast.', zh: '小汽车开得很快。', scene: 'fast' },
      { id: 3, sentence: 'Stop! A dog is on the road.', zh: '停下！路上有一只小狗。', scene: 'dog' },
      { id: 4, sentence: 'The car stops. The dog is safe.', zh: '汽车停下了，小狗安全了。', scene: 'stop' },
      { id: 5, sentence: 'Good job, little car!', zh: '做得好，小汽车！', scene: 'cheer' },
    ],
  },
  {
    id: 'rainy-day-bus',
    title: 'Rainy Day Bus',
    zh: '雨天巴士',
    pages: [
      { id: 1, sentence: 'The yellow bus is here.', zh: '黄色巴士来了。', scene: 'rain' },
      { id: 2, sentence: 'Rain, rain, on the road.', zh: '雨滴落在路上。', scene: 'rain' },
      { id: 3, sentence: 'The bus goes over a bridge.', zh: '巴士开过小桥。', scene: 'bridge' },
      { id: 4, sentence: 'The bus gets a bubble wash.', zh: '巴士洗了泡泡澡。', scene: 'wash' },
      { id: 5, sentence: 'Good night, busy bus.', zh: '晚安，忙碌的巴士。', scene: 'sleep' },
    ],
  },
];

export const storyPages = storyBooks[0].pages;

export const countingChallenges: CountingChallenge[] = [
  {
    id: 'two-cars',
    count: 2,
    vehicleWord: 'cars',
    vehicleZh: '小汽车',
    task: 'Tap two cars.',
    color: '#f95757',
    accent: '#ffd166',
    kind: 'car',
  },
  {
    id: 'three-buses',
    count: 3,
    vehicleWord: 'buses',
    vehicleZh: '公共汽车',
    task: 'Tap three buses.',
    color: '#ffd447',
    accent: '#48cae4',
    kind: 'bus',
  },
  {
    id: 'four-trucks',
    count: 4,
    vehicleWord: 'trucks',
    vehicleZh: '卡车',
    task: 'Tap four trucks.',
    color: '#49a6ff',
    accent: '#ffe66d',
    kind: 'truck',
  },
  {
    id: 'five-taxis',
    count: 5,
    vehicleWord: 'taxis',
    vehicleZh: '出租车',
    task: 'Tap five taxis.',
    color: '#ffcf33',
    accent: '#17324d',
    kind: 'taxi',
  },
];

export const trafficPrompts: TrafficPrompt[] = [
  { id: 'red-stop', light: 'red', task: 'Red light. Stop!', action: 'Stop', zh: '红灯停' },
  { id: 'yellow-slow', light: 'yellow', task: 'Yellow light. Slow down.', action: 'Slow', zh: '黄灯慢' },
  { id: 'green-go', light: 'green', task: 'Green light. Go!', action: 'Go', zh: '绿灯行' },
];
export type CarLogo = {
  id: string;
  name: string;
  zh: string;
  country: string;
  cue: string;
  badgeText: string;
  shape: 'circle' | 'oval' | 'shield' | 'diamond' | 'hex' | 'wings' | 'star' | 'wordmark' | 'triangle' | 'ring';
  primary: string;
  secondary: string;
};

export const carLogos: CarLogo[] = [
  { id: 'toyota', name: 'Toyota', zh: '丰田', country: 'Japan', cue: 'A friendly T badge.', badgeText: 'T', shape: 'oval', primary: '#e63946', secondary: '#ffffff' },
  { id: 'honda', name: 'Honda', zh: '本田', country: 'Japan', cue: 'A big H badge.', badgeText: 'H', shape: 'shield', primary: '#ef233c', secondary: '#ffffff' },
  { id: 'nissan', name: 'Nissan', zh: '日产', country: 'Japan', cue: 'A round N badge.', badgeText: 'N', shape: 'ring', primary: '#5c677d', secondary: '#ffffff' },
  { id: 'ford', name: 'Ford', zh: '福特', country: 'USA', cue: 'A blue oval badge.', badgeText: 'Ford', shape: 'oval', primary: '#2563eb', secondary: '#ffffff' },
  { id: 'chevrolet', name: 'Chevrolet', zh: '雪佛兰', country: 'USA', cue: 'A golden cross badge.', badgeText: '+', shape: 'diamond', primary: '#ffbf00', secondary: '#17324d' },
  { id: 'volkswagen', name: 'Volkswagen', zh: '大众', country: 'Germany', cue: 'A V W circle badge.', badgeText: 'VW', shape: 'circle', primary: '#1d4ed8', secondary: '#ffffff' },
  { id: 'bmw', name: 'BMW', zh: '宝马', country: 'Germany', cue: 'A blue and white round badge.', badgeText: 'BMW', shape: 'circle', primary: '#0f6fff', secondary: '#ffffff' },
  { id: 'mercedes-benz', name: 'Mercedes-Benz', zh: '梅赛德斯-奔驰', country: 'Germany', cue: 'A star badge.', badgeText: '★', shape: 'star', primary: '#374151', secondary: '#ffffff' },
  { id: 'audi', name: 'Audi', zh: '奥迪', country: 'Germany', cue: 'Four ring badge.', badgeText: 'OOOO', shape: 'ring', primary: '#111827', secondary: '#ffffff' },
  { id: 'porsche', name: 'Porsche', zh: '保时捷', country: 'Germany', cue: 'A sporty shield badge.', badgeText: 'P', shape: 'shield', primary: '#f59e0b', secondary: '#7f1d1d' },
  { id: 'tesla', name: 'Tesla', zh: '特斯拉', country: 'USA', cue: 'A bright T badge.', badgeText: 'T', shape: 'triangle', primary: '#dc2626', secondary: '#ffffff' },
  { id: 'hyundai', name: 'Hyundai', zh: '现代', country: 'Korea', cue: 'A silver H badge.', badgeText: 'H', shape: 'oval', primary: '#0f4c81', secondary: '#ffffff' },
  { id: 'kia', name: 'Kia', zh: '起亚', country: 'Korea', cue: 'A simple KIA badge.', badgeText: 'KIA', shape: 'oval', primary: '#111827', secondary: '#ffffff' },
  { id: 'volvo', name: 'Volvo', zh: '沃尔沃', country: 'Sweden', cue: 'A strong blue badge.', badgeText: 'V', shape: 'circle', primary: '#2563eb', secondary: '#ffffff' },
  { id: 'lexus', name: 'Lexus', zh: '雷克萨斯', country: 'Japan', cue: 'A smooth L badge.', badgeText: 'L', shape: 'oval', primary: '#4b5563', secondary: '#ffffff' },
  { id: 'mazda', name: 'Mazda', zh: '马自达', country: 'Japan', cue: 'A flying M badge.', badgeText: 'M', shape: 'wings', primary: '#334155', secondary: '#ffffff' },
  { id: 'subaru', name: 'Subaru', zh: '斯巴鲁', country: 'Japan', cue: 'A starry blue badge.', badgeText: '✦', shape: 'oval', primary: '#1d4ed8', secondary: '#ffffff' },
  { id: 'mitsubishi', name: 'Mitsubishi', zh: '三菱', country: 'Japan', cue: 'Three red diamonds.', badgeText: '◆', shape: 'diamond', primary: '#dc2626', secondary: '#ffffff' },
  { id: 'peugeot', name: 'Peugeot', zh: '标致', country: 'France', cue: 'A lion style shield.', badgeText: 'P', shape: 'shield', primary: '#111827', secondary: '#ffffff' },
  { id: 'citroen', name: 'Citroen', zh: '雪铁龙', country: 'France', cue: 'Two little arrows.', badgeText: '⌃⌃', shape: 'oval', primary: '#dc2626', secondary: '#ffffff' },
  { id: 'renault', name: 'Renault', zh: '雷诺', country: 'France', cue: 'A yellow diamond badge.', badgeText: 'R', shape: 'diamond', primary: '#facc15', secondary: '#17324d' },
  { id: 'fiat', name: 'Fiat', zh: '菲亚特', country: 'Italy', cue: 'A red FIAT badge.', badgeText: 'FIAT', shape: 'circle', primary: '#b91c1c', secondary: '#ffffff' },
  { id: 'jeep', name: 'Jeep', zh: '吉普', country: 'USA', cue: 'A green adventure badge.', badgeText: 'Jeep', shape: 'wordmark', primary: '#4d7c0f', secondary: '#ffffff' },
  { id: 'land-rover', name: 'Land Rover', zh: '路虎', country: 'UK', cue: 'A green oval badge.', badgeText: 'LR', shape: 'oval', primary: '#166534', secondary: '#ffffff' },
  { id: 'jaguar', name: 'Jaguar', zh: '捷豹', country: 'UK', cue: 'A fast cat badge.', badgeText: 'J', shape: 'wings', primary: '#111827', secondary: '#ffffff' },
  { id: 'mini', name: 'Mini', zh: '迷你', country: 'UK', cue: 'A small wing badge.', badgeText: 'MINI', shape: 'wings', primary: '#111827', secondary: '#ffffff' },
  { id: 'rolls-royce', name: 'Rolls-Royce', zh: '劳斯莱斯', country: 'UK', cue: 'A double R badge.', badgeText: 'RR', shape: 'wordmark', primary: '#4b5563', secondary: '#ffffff' },
  { id: 'bentley', name: 'Bentley', zh: '宾利', country: 'UK', cue: 'A B with wings.', badgeText: 'B', shape: 'wings', primary: '#064e3b', secondary: '#ffffff' },
  { id: 'ferrari', name: 'Ferrari', zh: '法拉利', country: 'Italy', cue: 'A yellow racing shield.', badgeText: 'F', shape: 'shield', primary: '#facc15', secondary: '#111827' },
  { id: 'lamborghini', name: 'Lamborghini', zh: '兰博基尼', country: 'Italy', cue: 'A black and gold shield.', badgeText: 'L', shape: 'shield', primary: '#111827', secondary: '#facc15' },
  { id: 'maserati', name: 'Maserati', zh: '玛莎拉蒂', country: 'Italy', cue: 'A trident style badge.', badgeText: 'M', shape: 'triangle', primary: '#1e3a8a', secondary: '#ffffff' },
  { id: 'bugatti', name: 'Bugatti', zh: '布加迪', country: 'France', cue: 'A red oval badge.', badgeText: 'B', shape: 'oval', primary: '#dc2626', secondary: '#ffffff' },
  { id: 'mclaren', name: 'McLaren', zh: '迈凯伦', country: 'UK', cue: 'An orange speed badge.', badgeText: 'M', shape: 'triangle', primary: '#f97316', secondary: '#ffffff' },
  { id: 'aston-martin', name: 'Aston Martin', zh: '阿斯顿·马丁', country: 'UK', cue: 'A wing badge.', badgeText: 'AM', shape: 'wings', primary: '#047857', secondary: '#ffffff' },
  { id: 'alfa-romeo', name: 'Alfa Romeo', zh: '阿尔法·罗密欧', country: 'Italy', cue: 'A round red badge.', badgeText: 'AR', shape: 'circle', primary: '#b91c1c', secondary: '#ffffff' },
  { id: 'cadillac', name: 'Cadillac', zh: '凯迪拉克', country: 'USA', cue: 'A colorful shield.', badgeText: 'C', shape: 'shield', primary: '#7c3aed', secondary: '#ffffff' },
  { id: 'buick', name: 'Buick', zh: '别克', country: 'USA', cue: 'A three shield badge.', badgeText: 'B', shape: 'shield', primary: '#2563eb', secondary: '#ffffff' },
  { id: 'lincoln', name: 'Lincoln', zh: '林肯', country: 'USA', cue: 'A tall star badge.', badgeText: '✦', shape: 'star', primary: '#111827', secondary: '#ffffff' },
  { id: 'dodge', name: 'Dodge', zh: '道奇', country: 'USA', cue: 'A red racing badge.', badgeText: 'D', shape: 'hex', primary: '#dc2626', secondary: '#ffffff' },
  { id: 'ram', name: 'Ram', zh: '公羊', country: 'USA', cue: 'A truck badge.', badgeText: 'RAM', shape: 'shield', primary: '#374151', secondary: '#ffffff' },
  { id: 'acura', name: 'Acura', zh: '讴歌', country: 'Japan', cue: 'A pointed A badge.', badgeText: 'A', shape: 'triangle', primary: '#4b5563', secondary: '#ffffff' },
  { id: 'infiniti', name: 'Infiniti', zh: '英菲尼迪', country: 'Japan', cue: 'A road to the sky badge.', badgeText: 'I', shape: 'oval', primary: '#374151', secondary: '#ffffff' },
  { id: 'genesis', name: 'Genesis', zh: '捷尼赛思', country: 'Korea', cue: 'A wing badge.', badgeText: 'G', shape: 'wings', primary: '#111827', secondary: '#ffffff' },
  { id: 'byd', name: 'BYD', zh: '比亚迪', country: 'China', cue: 'A blue BYD badge.', badgeText: 'BYD', shape: 'oval', primary: '#2563eb', secondary: '#ffffff' },
  { id: 'geely', name: 'Geely', zh: '吉利', country: 'China', cue: 'A happy blue badge.', badgeText: 'G', shape: 'shield', primary: '#2563eb', secondary: '#ffffff' },
  { id: 'chery', name: 'Chery', zh: '奇瑞', country: 'China', cue: 'A red A badge.', badgeText: 'A', shape: 'oval', primary: '#dc2626', secondary: '#ffffff' },
  { id: 'nio', name: 'NIO', zh: '蔚来', country: 'China', cue: 'A sky and road badge.', badgeText: 'NIO', shape: 'circle', primary: '#111827', secondary: '#ffffff' },
  { id: 'xpeng', name: 'XPeng', zh: '小鹏', country: 'China', cue: 'A flying X badge.', badgeText: 'X', shape: 'wings', primary: '#06b6d4', secondary: '#ffffff' },
  { id: 'li-auto', name: 'Li Auto', zh: '理想', country: 'China', cue: 'A home car badge.', badgeText: 'Li', shape: 'hex', primary: '#22c55e', secondary: '#ffffff' },
  { id: 'smart', name: 'Smart', zh: '精灵', country: 'Germany', cue: 'A tiny city car badge.', badgeText: 'S', shape: 'circle', primary: '#84cc16', secondary: '#17324d' },
];
