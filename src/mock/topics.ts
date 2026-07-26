import type { TopicGroup } from "@/types/topic";
import { flagIcon, vehicleIcon } from "@/mock/topicAssets";

export const vehicleGroups: TopicGroup[] = [
  {
    id: "small-cars",
    title: "小汽车和公共交通",
    subtitle: "先认识每天路上能看到的车。",
    words: [
      {
        id: "vehicle_car",
        word: "car",
        phonetic: "/kɑːr/",
        meaning: "小汽车",
        sentence: "I see a car.",
        sentenceCn: "我看见一辆小汽车。",
        image: vehicleIcon("car"),
        audio: "/static/audio/words/car.wav",
        group: "small-cars"
      },
      {
        id: "vehicle_bus",
        word: "bus",
        phonetic: "/bʌs/",
        meaning: "公共汽车",
        sentence: "The bus is big.",
        sentenceCn: "公共汽车很大。",
        image: vehicleIcon("bus"),
        audio: "/static/audio/words/bus.wav",
        group: "small-cars"
      },
      {
        id: "vehicle_taxi",
        word: "taxi",
        phonetic: "/ˈtæksi/",
        meaning: "出租车",
        sentence: "This is a taxi.",
        sentenceCn: "这是一辆出租车。",
        image: vehicleIcon("taxi"),
        audio: "/static/audio/words/taxi.wav",
        group: "small-cars"
      },
      {
        id: "vehicle_train",
        word: "train",
        phonetic: "/treɪn/",
        meaning: "火车",
        sentence: "The train goes choo-choo.",
        sentenceCn: "火车呜呜开。",
        image: vehicleIcon("train"),
        audio: "/static/audio/words/train.wav",
        group: "small-cars"
      },
      {
        id: "vehicle_truck",
        word: "truck",
        phonetic: "/trʌk/",
        meaning: "卡车",
        sentence: "The truck is strong.",
        sentenceCn: "卡车很有力。",
        image: vehicleIcon("truck"),
        audio: "/static/audio/words/truck.wav",
        group: "small-cars"
      },
      {
        id: "vehicle_bicycle",
        word: "bicycle",
        phonetic: "/ˈbaɪsɪkl/",
        meaning: "自行车",
        sentence: "I ride a bicycle.",
        sentenceCn: "我骑自行车。",
        image: vehicleIcon("bicycle"),
        audio: "/static/audio/words/bicycle.wav",
        group: "small-cars"
      },
      {
        id: "vehicle_motorcycle",
        word: "motorcycle",
        phonetic: "/ˈmoʊtərsaɪkl/",
        meaning: "摩托车",
        sentence: "The motorcycle is fast.",
        sentenceCn: "摩托车很快。",
        image: vehicleIcon("motorcycle"),
        audio: "/static/audio/words/motorcycle.wav",
        group: "small-cars"
      },
      {
        id: "vehicle_scooter",
        word: "scooter",
        phonetic: "/ˈskuːtər/",
        meaning: "滑板车",
        sentence: "This is a scooter.",
        sentenceCn: "这是一辆滑板车。",
        image: vehicleIcon("scooter"),
        audio: "/static/audio/words/scooter.wav",
        group: "small-cars"
      }
    ]
  },
  {
    id: "construction",
    title: "工程车",
    subtitle: "挖、推、吊、运，工程车各有本领。",
    words: [
      {
        id: "vehicle_excavator",
        word: "excavator",
        phonetic: "/ˈekskəveɪtər/",
        meaning: "挖掘机",
        sentence: "The excavator can dig.",
        sentenceCn: "挖掘机会挖土。",
        image: vehicleIcon("excavator"),
        audio: "/static/audio/words/excavator.wav",
        group: "construction"
      },
      {
        id: "vehicle_bulldozer",
        word: "bulldozer",
        phonetic: "/ˈbʊldoʊzər/",
        meaning: "推土机",
        sentence: "The bulldozer can push.",
        sentenceCn: "推土机会往前推。",
        image: vehicleIcon("bulldozer"),
        audio: "/static/audio/words/bulldozer.wav",
        group: "construction"
      },
      {
        id: "vehicle_crane",
        word: "crane",
        phonetic: "/kreɪn/",
        meaning: "起重机",
        sentence: "The crane can lift.",
        sentenceCn: "起重机会吊起来。",
        image: vehicleIcon("crane"),
        audio: "/static/audio/words/crane.wav",
        group: "construction"
      },
      {
        id: "vehicle_dump_truck",
        word: "dump truck",
        phonetic: "/dʌmp trʌk/",
        meaning: "自卸卡车",
        sentence: "The dump truck carries sand.",
        sentenceCn: "自卸卡车运沙子。",
        image: vehicleIcon("dump-truck"),
        audio: "/static/audio/words/dump-truck.wav",
        group: "construction"
      },
      {
        id: "vehicle_mixer",
        word: "cement mixer",
        phonetic: "/sɪˈment ˈmɪksər/",
        meaning: "水泥搅拌车",
        sentence: "The mixer goes round and round.",
        sentenceCn: "搅拌车转呀转。",
        image: vehicleIcon("cement-mixer"),
        audio: "/static/audio/words/cement-mixer.wav",
        group: "construction"
      },
      {
        id: "vehicle_tractor",
        word: "tractor",
        phonetic: "/ˈtræktər/",
        meaning: "拖拉机",
        sentence: "The tractor works on a farm.",
        sentenceCn: "拖拉机在农场工作。",
        image: vehicleIcon("tractor"),
        audio: "/static/audio/words/tractor.wav",
        group: "construction"
      },
      {
        id: "vehicle_road_roller",
        word: "road roller",
        phonetic: "/roʊd ˈroʊlər/",
        meaning: "压路机",
        sentence: "The road roller rolls slowly.",
        sentenceCn: "压路机慢慢压路。",
        image: vehicleIcon("road-roller"),
        audio: "/static/audio/words/road-roller.wav",
        group: "construction"
      },
      {
        id: "vehicle_forklift",
        word: "forklift",
        phonetic: "/ˈfɔːrklɪft/",
        meaning: "叉车",
        sentence: "The forklift can lift boxes.",
        sentenceCn: "叉车能举起箱子。",
        image: vehicleIcon("forklift"),
        audio: "/static/audio/words/forklift.wav",
        group: "construction"
      }
    ]
  },
  {
    id: "helper-cars",
    title: "帮忙的车",
    subtitle: "这些车会在需要时帮助大家。",
    words: [
      {
        id: "vehicle_fire_truck",
        word: "fire truck",
        phonetic: "/ˈfaɪər trʌk/",
        meaning: "消防车",
        sentence: "The fire truck helps people.",
        sentenceCn: "消防车帮助大家。",
        image: vehicleIcon("fire-truck"),
        audio: "/static/audio/words/fire-truck.wav",
        group: "helper-cars"
      },
      {
        id: "vehicle_ambulance",
        word: "ambulance",
        phonetic: "/ˈæmbjələns/",
        meaning: "救护车",
        sentence: "The ambulance is fast.",
        sentenceCn: "救护车开得很快。",
        image: vehicleIcon("ambulance"),
        audio: "/static/audio/words/ambulance.wav",
        group: "helper-cars"
      },
      {
        id: "vehicle_police_car",
        word: "police car",
        phonetic: "/pəˈliːs kɑːr/",
        meaning: "警车",
        sentence: "This is a police car.",
        sentenceCn: "这是一辆警车。",
        image: vehicleIcon("police-car"),
        audio: "/static/audio/words/police-car.wav",
        group: "helper-cars"
      },
      {
        id: "vehicle_school_bus",
        word: "school bus",
        phonetic: "/skuːl bʌs/",
        meaning: "校车",
        sentence: "The school bus is yellow.",
        sentenceCn: "校车是黄色的。",
        image: vehicleIcon("school-bus"),
        audio: "/static/audio/words/school-bus.wav",
        group: "helper-cars"
      },
      {
        id: "vehicle_garbage_truck",
        word: "garbage truck",
        phonetic: "/ˈɡɑːrbɪdʒ trʌk/",
        meaning: "垃圾车",
        sentence: "The garbage truck keeps streets clean.",
        sentenceCn: "垃圾车让街道保持干净。",
        image: vehicleIcon("garbage-truck"),
        audio: "/static/audio/words/garbage-truck.wav",
        group: "helper-cars"
      },
      {
        id: "vehicle_tow_truck",
        word: "tow truck",
        phonetic: "/toʊ trʌk/",
        meaning: "拖车",
        sentence: "The tow truck pulls a car.",
        sentenceCn: "拖车拉走一辆车。",
        image: vehicleIcon("tow-truck"),
        audio: "/static/audio/words/tow-truck.wav",
        group: "helper-cars"
      }
    ]
  }
];

export const worldGroups: TopicGroup[] = [
  {
    id: "countries",
    title: "国家图标",
    subtitle: "点大图标听英文，先认识这些常见国家。",
    words: [
      {
        id: "country_china",
        word: "China",
        phonetic: "/ˈtʃaɪnə/",
        meaning: "中国",
        sentence: "I live in China.",
        sentenceCn: "我住在中国。",
        image: flagIcon("china"),
        audio: "/static/audio/words/china.wav",
        group: "countries"
      },
      {
        id: "country_usa",
        word: "United States",
        phonetic: "/juːˈnaɪtɪd steɪts/",
        meaning: "美国",
        sentence: "This is the United States.",
        sentenceCn: "这是美国。",
        image: flagIcon("united-states"),
        audio: "/static/audio/words/united-states.wav",
        group: "countries"
      },
      {
        id: "country_uk",
        word: "United Kingdom",
        phonetic: "/juːˈnaɪtɪd ˈkɪŋdəm/",
        meaning: "英国",
        sentence: "This is the United Kingdom.",
        sentenceCn: "这是英国。",
        image: flagIcon("united-kingdom"),
        audio: "/static/audio/words/united-kingdom.wav",
        group: "countries"
      },
      {
        id: "country_canada",
        word: "Canada",
        phonetic: "/ˈkænədə/",
        meaning: "加拿大",
        sentence: "Canada is big.",
        sentenceCn: "加拿大很大。",
        image: flagIcon("canada"),
        audio: "/static/audio/words/canada.wav",
        group: "countries"
      },
      {
        id: "country_australia",
        word: "Australia",
        phonetic: "/ɔːˈstreɪliə/",
        meaning: "澳大利亚",
        sentence: "Australia has kangaroos.",
        sentenceCn: "澳大利亚有袋鼠。",
        image: flagIcon("australia"),
        audio: "/static/audio/words/australia.wav",
        group: "countries"
      },
      {
        id: "country_japan",
        word: "Japan",
        phonetic: "/dʒəˈpæn/",
        meaning: "日本",
        sentence: "This is Japan.",
        sentenceCn: "这是日本。",
        image: flagIcon("japan"),
        audio: "/static/audio/words/japan.wav",
        group: "countries"
      },
      {
        id: "country_france",
        word: "France",
        phonetic: "/fræns/",
        meaning: "法国",
        sentence: "This is France.",
        sentenceCn: "这是法国。",
        image: flagIcon("france"),
        audio: "/static/audio/words/france.wav",
        group: "countries"
      },
      {
        id: "country_germany",
        word: "Germany",
        phonetic: "/ˈdʒɜːrməni/",
        meaning: "德国",
        sentence: "This is Germany.",
        sentenceCn: "这是德国。",
        image: flagIcon("germany"),
        audio: "/static/audio/words/germany.wav",
        group: "countries"
      },
      {
        id: "country_brazil",
        word: "Brazil",
        phonetic: "/brəˈzɪl/",
        meaning: "巴西",
        sentence: "Brazil is far away.",
        sentenceCn: "巴西在很远的地方。",
        image: flagIcon("brazil"),
        audio: "/static/audio/words/brazil.wav",
        group: "countries"
      },
      {
        id: "country_india",
        word: "India",
        phonetic: "/ˈɪndiə/",
        meaning: "印度",
        sentence: "This is India.",
        sentenceCn: "这是印度。",
        image: flagIcon("india"),
        audio: "/static/audio/words/india.wav",
        group: "countries"
      },
      {
        id: "country_egypt",
        word: "Egypt",
        phonetic: "/ˈiːdʒɪpt/",
        meaning: "埃及",
        sentence: "Egypt has pyramids.",
        sentenceCn: "埃及有金字塔。",
        image: flagIcon("egypt"),
        audio: "/static/audio/words/egypt.wav",
        group: "countries"
      },
      {
        id: "country_mexico",
        word: "Mexico",
        phonetic: "/ˈmeksɪkoʊ/",
        meaning: "墨西哥",
        sentence: "This is Mexico.",
        sentenceCn: "这是墨西哥。",
        image: flagIcon("mexico"),
        audio: "/static/audio/words/mexico.wav",
        group: "countries"
      },
      {
        id: "country_italy",
        word: "Italy",
        phonetic: "/ˈɪtəli/",
        meaning: "意大利",
        sentence: "This is Italy.",
        sentenceCn: "这是意大利。",
        image: flagIcon("italy"),
        audio: "/static/audio/words/italy.wav",
        group: "countries"
      },
      {
        id: "country_spain",
        word: "Spain",
        phonetic: "/speɪn/",
        meaning: "西班牙",
        sentence: "This is Spain.",
        sentenceCn: "这是西班牙。",
        image: flagIcon("spain"),
        audio: "/static/audio/words/spain.wav",
        group: "countries"
      }
    ]
  }
];
